/*
 * 워프 터널 셰이더 — 화면 전체를 덮는 평면 하나에 그린다.
 *
 * 좌표: 중심점(uCenter) 기준 각도(angle) + log(거리)(depth).
 *   log 공간에서 depth를 일정하게 흘려보내면 화면에서는 바깥으로 갈수록 빨라지고(원근에 따른 속도 차),
 *   중심에서 새 빛줄기가 생겨 화면 밖으로 사라지는 무한 터널이 된다 → 관찰자가 중심점으로 빨려 들어가는 착시.
 *
 * 하이브리드: 셰이더로 만든 방사형 빛줄기(procedural streak) + 레퍼런스 이미지를 같은 극좌표로 무한 줌한 색.
 *   이미지는 두 배율을 번갈아 섞어(2배마다 이음) 계속 확대해도 화질이 깨지거나 끊기지 않게 하고,
 *   세밀한 선은 셰이더 빛줄기가 맡는다.
 */

export const warpVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    // 카메라와 상관없이 화면 전체를 덮는다
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const warpFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;        // 경과 시간 (빛줄기 미세한 반짝임)
uniform float uTravel;      // 지금까지 이동한 거리 = ∫ uSpeed dt (JS에서 매 프레임 누적)
uniform float uSpeed;       // 이동 속도 — 빛줄기 늘어남 · 블러 길이에 쓴다
uniform float uProgress;    // 전체 진행률 0 → 1
uniform vec2 uCenter;       // 중심점 (0~1, 왼쪽 아래 기준)
uniform vec2 uResolution;   // 화면 크기 (px)
uniform float uIntensity;   // 왜곡 강도
uniform float uBlurStrength;// 블러 강도
uniform float uGlow;        // 중심부 밝기
uniform float uFlash;       // 화이트 플래시 0 → 1
uniform sampler2D uTexture; // 레퍼런스 이미지
uniform float uTexAspect;   // 레퍼런스 이미지 가로 ÷ 세로

varying vec2 vUv;

#define PI 3.14159265359
#define TAU 6.28318530718
#define BLUR_SAMPLES 10

float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

// 레퍼런스 색감: 딥블루 · 스카이블루 · 화이트블루 · 화이트
const vec3 DEEP = vec3(0.09, 0.36, 0.53);
const vec3 SKY = vec3(0.45, 0.74, 0.86);
const vec3 PALE = vec3(0.86, 0.94, 0.97);
const vec3 WHITE = vec3(1.0);

/*
 * 방사형 빛줄기 한 겹: 각도를 freq칸으로 나눠 칸마다 두께 · 밝기 · 길이 · 속도를 다르게 하고,
 * depth 방향으로는 끊긴 선(대시)으로 만들어 흘려보낸다. stretch가 클수록 대시가 길어진다(속도감).
 */
float streakLayer(float angle01, float depth, float freq, float seed, float stretch) {
    float a = angle01 * freq;
    // 각도가 한 바퀴(1 → 0)로 이어지는 자리에서 칸 번호도 이어지게 (안 그러면 중심 왼쪽에 가로 이음선이 보인다)
    float id = mod(floor(a), freq);
    float f = fract(a) - 0.5;
    float h1 = hash11(id + seed);
    float h2 = hash11(id * 1.7 + seed * 3.1);
    float h3 = hash11(id * 2.3 + seed * 7.7);

    // 칸 안에서 선 위치를 흔들어 규칙적인 배열이 보이지 않게
    float offset = (h2 - 0.5) * 0.6;
    float width = mix(0.04, 0.32, h1 * h1);
    float line = smoothstep(width, 0.0, abs(f - offset));

    // 칸마다 속도를 조금씩 다르게 (깊이감에 따른 속도 차)
    float z = depth * (0.75 + 0.5 * h3) * stretch;
    float dash = fract(z * (0.6 + h1 * 1.4) + h2 * 13.0);
    float len = mix(0.25, 0.9, h3);
    float seg = smoothstep(0.0, 0.08, dash) * smoothstep(len, len - 0.25, dash);

    return line * seg * mix(0.35, 1.0, h2);
}

// 레퍼런스 이미지를 같은 극좌표로 샘플: rho(0 = 중심, 1 = 화면 가장 먼 모서리)를 이미지 반지름에 맞춘다
vec3 sampleReference(vec2 dir, float rho) {
    // 이미지 높이 기준 거리: 방향마다 rho = 1이 이미지 테두리에 닿게 한다
    // (세로로 긴 모바일 화면에서도 이미지 밖을 읽어 가장자리가 늘어난 띠가 생기지 않게)
    vec2 a = abs(dir) + 1e-4;
    float reach = min(0.5 * uTexAspect / a.x, 0.5 / a.y) * 0.98;
    vec2 offset = dir * rho * reach;
    vec2 uv = vec2(0.5) + vec2(offset.x / uTexAspect, offset.y);
    return texture2D(uTexture, clamp(uv, 0.0, 1.0)).rgb;
}

// 무한 줌: 2배 차이 나는 두 배율을 번갈아 섞어 끊김 없이 계속 확대한다
vec3 zoomReference(vec2 dir, float rho, float travel) {
    float t = fract(travel * 0.22);
    float sA = exp2(-t);
    float sB = exp2(1.0 - t);
    vec3 a = sampleReference(dir, rho * sA);
    vec3 b = sampleReference(dir, rho * sB);
    return mix(a, b, smoothstep(0.0, 1.0, t));
}

// 한 지점의 색 (블러는 이걸 반지름 방향으로 여러 번 샘플해 평균)
vec3 shade(vec2 dir, float r, float rMax, float angle01) {
    // Radial UV Distortion · Perspective Warp: 강도가 커질수록 중심 쪽을 끌어당겨 깊이를 과장한다
    float rho = r / rMax;
    float warped = pow(rho, 1.0 + uIntensity * 0.55);
    float depth = log(warped * rMax + 0.002) * (1.0 + uIntensity * 0.8) - uTravel;

    float stretch = 1.0 / (1.0 + uSpeed * 0.18);
    float s = streakLayer(angle01, depth, 220.0, 1.0, stretch) * 0.55
            + streakLayer(angle01, depth * 1.3, 410.0, 7.0, stretch) * 0.35
            + streakLayer(angle01, depth * 0.8, 90.0, 13.0, stretch) * 0.6;

    // 레퍼런스 이미지 색 (중심 부근은 더 밝게, 바깥은 이미지 명암을 살린다)
    vec3 ref = zoomReference(dir, warped, uTravel);

    // Blue Tone Gradient: 중심은 밝고 바깥으로 갈수록 블루 대비
    vec3 base = mix(PALE, SKY, smoothstep(0.15, 0.85, rho));
    base = mix(base, DEEP, smoothstep(0.55, 1.25, rho) * 0.55);
    vec3 col = mix(base, ref, 0.55);

    // 빛줄기: 바깥쪽은 짙은 블루 선, 안쪽은 흰 선
    vec3 streakColor = mix(WHITE, mix(SKY, DEEP, 0.65), smoothstep(0.1, 0.9, rho));
    col = mix(col, streakColor, clamp(s, 0.0, 1.0) * smoothstep(0.02, 0.18, rho));

    // 바깥으로 갈수록 명암 대비를 올려 레퍼런스처럼 블루 결이 또렷하게 (중심부는 밝게 둔다)
    col = mix(col, col * col, smoothstep(0.25, 0.9, rho) * 0.45);

    return col;
}

void main() {
    vec2 px = vUv * uResolution;
    vec2 center = uCenter * uResolution;
    vec2 d = px - center;
    // 거리는 화면 높이 기준 (어떤 화면비에서도 원근이 같게)
    float r = length(d) / uResolution.y;
    vec2 dir = normalize(d + 1e-5);
    float angle01 = atan(d.y, d.x) / TAU + 0.5;

    // 중심점에서 가장 먼 화면 모서리까지 거리
    vec2 far = max(uCenter, 1.0 - uCenter) * uResolution;
    float rMax = length(far) / uResolution.y;

    // Directional Motion Blur + Radial Zoom Blur: 중심 쪽으로 반지름을 줄여 가며 평균
    vec3 col = vec3(0.0);
    float blurLen = uBlurStrength * 0.22 * (0.4 + 0.6 * min(uSpeed / 6.0, 1.0));
    float total = 0.0;
    for (int i = 0; i < BLUR_SAMPLES; i++) {
        float k = float(i) / float(BLUR_SAMPLES - 1);
        float w = 1.0 - k * 0.6;
        col += shade(dir, r * (1.0 - blurLen * k), rMax, angle01) * w;
        total += w;
    }
    col /= total;

    // 미세한 반짝임 (초기 정적 화면에서도 살아 있게)
    col *= 0.97 + 0.03 * sin(uTime * 2.3 + angle01 * TAU * 7.0);

    // Center Glow: 중심부 빛이 진행에 따라 넓어지고 밝아진다
    float rho = r / rMax;
    float glow = exp(-rho * mix(9.0, 2.2, clamp(uGlow / 2.0, 0.0, 1.0))) * uGlow;
    col += vec3(0.85, 0.95, 1.0) * glow;

    // 바깥 가장자리 명암 대비 (진행될수록 밝은 영역이 넓어져 대비가 줄어든다)
    col *= mix(1.0, mix(0.82, 0.95, uProgress), smoothstep(0.7, 1.15, rho));

    // White Flash
    col = mix(col, WHITE, clamp(uFlash, 0.0, 1.0));

    gl_FragColor = vec4(col, 1.0);
}
`
