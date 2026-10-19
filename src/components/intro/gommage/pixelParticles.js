import * as THREE from 'three/webgpu'
import { attribute, uniform, positionLocal, texture, mrt, mix, vec2, vec3, clamp, smoothstep, step, float, floor, ceil, fract, sin } from 'three/tsl'

const SOLID_COLORS = ['#0f4467', '#2f8fc2', '#73bddb'] // 질문 글자 · STAGE · 링과 같은 블루 계열
const LIGHT_COLORS = ['#5fd8ff', '#e9fbff'] // 빛 입자

/**
 * 픽셀 입자 (원본 Gommage petalParticles.js의 꽃잎을 대체).
 * 꽃잎 모델 대신 작은 정사각형 평면을 인스턴스로 그리고, 회전 · 휘어짐 없이 화면에 반듯하게 선 채로
 * 원본과 같은 perlin noise 난류를 타고 위로 떠오르며 크기가 계단식으로 줄어 사라진다.
 * light: 빛 입자 — 더하기(additive) 섞기 + bloom MRT로 선택적으로 빛나게 한다. 아니면 일반 섞기의 단색 픽셀 (bloom 없음)
 * 배경 조각(BackgroundDissolve)도 같은 입자를 색 · 크기 · 속도만 바꿔 쓴다.
 */
export default class PixelParticles {
  #spawnPos
  #birthLifeSeedScale
  #currentIndex = 0
  #mesh
  #max
  #options

  constructor({ light = false, max = 400, colors, pixelSize, scale, life, riseSpeed, riseAccel } = {}) {
    this.light = light
    this.#max = max
    this.#options = {
      colors: colors ?? (light ? LIGHT_COLORS : SOLID_COLORS),
      pixelSize: pixelSize ?? (light ? 0.03 : 0.042),
      scale: scale ?? (light ? [0.5, 1] : [0.6, 1.4]),
      life: life ?? (light ? [1.1, 1.6] : [1.3, 1.9]),
      riseSpeed: riseSpeed ?? (light ? 0.34 : 0.26),
      riseAccel: riseAccel ?? (light ? 0.3 : 0.18),
    }
    this.uPixelSize = uniform(this.#options.pixelSize)
  }

  initialize(perlinTexture, uTime) {
    // 정사각형 1장: 크기는 셰이더에서 uPixelSize · aScale로 정한다
    const geometry = new THREE.PlaneGeometry(1, 1)
    this.#spawnPos = new Float32Array(this.#max * 3)
    // Combined 4 attributes into one to not go above the 9 attribute limit for webgpu
    this.#birthLifeSeedScale = new Float32Array(this.#max * 4)
    geometry.setAttribute('aSpawnPos', new THREE.InstancedBufferAttribute(this.#spawnPos, 3))
    geometry.setAttribute('aBirthLifeSeedScale', new THREE.InstancedBufferAttribute(this.#birthLifeSeedScale, 4))
    this.#mesh = new THREE.InstancedMesh(geometry, this.createPixelMaterial(perlinTexture, uTime), this.#max)
    this.#mesh.frustumCulled = false
    this.reset()
    return this.#mesh
  }

  spawnPixel(spawnPos, now) {
    if (this.#currentIndex === this.#max) this.#currentIndex = 0
    const id = this.#currentIndex
    this.#currentIndex += 1
    this.#spawnPos[id * 3 + 0] = spawnPos.x
    this.#spawnPos[id * 3 + 1] = spawnPos.y
    this.#spawnPos[id * 3 + 2] = spawnPos.z
    this.#birthLifeSeedScale[id * 4 + 0] = now // Birth time
    const { life, scale } = this.#options
    this.#birthLifeSeedScale[id * 4 + 1] = life[0] + Math.random() * (life[1] - life[0]) // Life time
    this.#birthLifeSeedScale[id * 4 + 2] = Math.random() // Random seed
    this.#birthLifeSeedScale[id * 4 + 3] = scale[0] + Math.random() * (scale[1] - scale[0]) // Scale

    this.#mesh.geometry.attributes.aSpawnPos.needsUpdate = true
    this.#mesh.geometry.attributes.aBirthLifeSeedScale.needsUpdate = true
  }

  // 아직 태어나지 않은 칸은 생일을 아주 먼 미래로 둬서 보이지 않게
  reset() {
    for (let i = 0; i < this.#max; i += 1) this.#birthLifeSeedScale[i * 4] = 1e9
    this.#mesh.geometry.attributes.aBirthLifeSeedScale.needsUpdate = true
  }

  createPixelMaterial(perlinTexture, uTime) {
    const light = this.light
    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    if (light) {
      // 색은 더하고(additive) 알파도 쌓는다: 입자끼리는 겹칠수록 밝아지고, 흰 배경 위에서도 색이 남는다
      material.blending = THREE.CustomBlending
      material.blendEquation = THREE.AddEquation
      material.blendSrc = THREE.SrcAlphaFactor
      material.blendDst = THREE.OneFactor
      material.blendSrcAlpha = THREE.SrcAlphaFactor
      material.blendDstAlpha = THREE.OneFactor
    }

    const aSpawnPos = attribute('aSpawnPos', 'vec3')
    const aBirthLifeSeedScale = attribute('aBirthLifeSeedScale', 'vec4')
    const aBirth = aBirthLifeSeedScale.x
    const aLife = aBirthLifeSeedScale.y
    const aSeed = aBirthLifeSeedScale.z
    const aScale = aBirthLifeSeedScale.w

    const uWindDirection = uniform(new THREE.Vector3(-1, 0, 0).normalize())
    const uWindStrength = uniform(0.04)
    const { colors, riseSpeed, riseAccel } = this.#options
    const uRiseSpeed = uniform(riseSpeed) // 위로 떠오르는 기본 속도
    const uRiseAccel = uniform(riseAccel) // 시간이 갈수록 빨라진다
    const uNoiseScale = uniform(30.0)
    const uNoiseSpeed = uniform(0.015)
    const uWobbleAmp = uniform(0.22) // 좌우 흔들림
    const uPixelSize = this.uPixelSize
    const uSnap = uniform(0.008) // 위치를 격자에 맞춰 픽셀처럼 칸칸이 움직인다
    const uLightBoost = uniform(1.6)

    // Age in seconds
    const age = uTime.sub(aBirth)
    const lifeInterpolation = clamp(age.div(aLife), 0, 1)
    const alive = step(float(0), age)

    // Use noise (원본과 같은 perlin 난류)
    const randomSeed = vec2(aSeed.mul(123.4), aSeed.mul(567.8))
    const noiseUv = aSpawnPos.xz
      .mul(uNoiseScale)
      .add(randomSeed)
      .add(uWindDirection.xz.mul(age.mul(uNoiseSpeed)))
    const noiseSample = texture(perlinTexture, noiseUv).x
    const noiseSampleBis = texture(perlinTexture, noiseUv.add(vec2(13.37, 7.77))).x
    const turbulenceX = noiseSample.sub(0.5).mul(2)
    const turbulenceY = noiseSampleBis.sub(0.5).mul(2)

    const swirl = vec3(turbulenceX.mul(lifeInterpolation), turbulenceY.mul(lifeInterpolation).mul(0.3), 0.0).mul(uWobbleAmp)
    const windImpulse = uWindDirection.mul(uWindStrength).mul(age)
    const riseFactor = clamp(noiseSample, 0.3, 1.0).add(0.4)
    const rise = vec3(0.0, age.mul(uRiseSpeed).add(age.mul(age).mul(uRiseAccel)).mul(riseFactor), 0.0)
    const center = aSpawnPos.add(windImpulse).add(rise).add(swirl)
    const snapped = floor(center.div(uSnap).add(0.5)).mul(uSnap)

    // 태어날 때 톡 커지고, 남은 수명에 따라 3단계로 작아진다 (1 → 2/3 → 1/3 → 0)
    const popIn = smoothstep(float(0), float(0.05), lifeInterpolation)
    const steps = ceil(float(1).sub(lifeInterpolation).mul(3)).div(3)
    const size = uPixelSize.mul(aScale).mul(popIn).mul(steps).mul(alive)
    const fadingOut = float(1.0).sub(smoothstep(float(0.75), float(1.0), lifeInterpolation)).mul(alive)

    material.positionNode = snapped.add(positionLocal.mul(size))

    const pick = (colors) => {
      let color = uniform(new THREE.Color(colors[0]))
      colors.slice(1).forEach((hex, i) => {
        color = mix(color, uniform(new THREE.Color(hex)), step(float((i + 1) / colors.length), aSeed))
      })
      return color
    }

    if (light) {
      // 빛 입자: 칸칸이 깜빡인다 (부드러운 sin 대신 켜짐 · 꺼짐 두 단계)
      const blink = mix(float(0.45), float(1), step(float(0.5), fract(age.mul(7).add(aSeed.mul(10)))))
      const glow = fadingOut.mul(blink)
      material.colorNode = pick(colors).mul(uLightBoost)
      material.opacityNode = glow
      material.mrtNode = mrt({ bloomIntensity: float(1.0).mul(glow) })
    } else {
      // 살짝 반짝이는 결 (위상만 다르게)
      const shade = float(0.85).add(sin(age.mul(9).add(aSeed.mul(40))).mul(0.15))
      material.colorNode = pick(colors).mul(shade)
      material.opacityNode = fadingOut
      material.mrtNode = mrt({ bloomIntensity: float(0) })
    }

    return material
  }
}
