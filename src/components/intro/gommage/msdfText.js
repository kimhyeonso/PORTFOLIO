import * as THREE from 'three/webgpu'
import { MSDFTextGeometry, MSDFTextNodeMaterial } from 'three-msdf-text-utils/webgpu'
import { texture, mix, uniform, clamp, attribute, step, float, smoothstep, mrt, uv, max, min, vec2, fwidth } from 'three/tsl'

// 1em = 0.4 월드 단위 (원본의 lineHeight 0.5 기준 파티클 값들이 글자 크기에 맞게 움직이도록)
export const EM = 0.4

/**
 * MSDF 글자 (원본 Gommage msdfText.js 구조 유지).
 * 한 문장 안에 글꼴이 섞여 있어(한글 Noto Sans KR · STAGE만 픽셀 글꼴) 조각(segment)마다 메시를 만들어 한 줄로 잇는다.
 * 모든 조각이 같은 uProgress · perlin 노이즈를 써서 한 번에 지워진다.
 * 그룹 원점 = 문장 가운데 · 기준선(baseline)
 */
export default class MSDFText {
  #glyphRects = [] // 파티클이 나올 자리: 그룹 기준 글자 사각형들
  group = new THREE.Group()
  uOpacity = uniform(1) // HTML 제목의 투명도를 따라간다 (떠오르는 등장 애니메이션)

  initialize(segments, uProgress, perlinTexture) {
    let pen = 0
    const meshes = []
    segments.forEach((segment) => {
      const { font, atlas, text, size = 1, letterSpacing = 0 } = segment
      const scale = (EM * size) / font.info.size
      // 공백만 있는 조각은 그 글꼴의 띄어쓰기 폭만큼 펜을 옮긴다
      if (!text.trim()) {
        const space = font.chars.find((c) => c.id === 32)
        pen += (space?.xadvance ?? font.info.size * 0.25) * text.length * scale
        return
      }
      const geometry = new MSDFTextGeometry({ text, font, width: 100000, align: 'left', letterSpacing: letterSpacing * font.info.size })
      const material = this.createTextMaterial(atlas, perlinTexture, uProgress, segment)
      // Adjust to remove visual artifacts
      material.alphaTest = 0.1
      const mesh = new THREE.Mesh(geometry, material)
      mesh.scale.setScalar(scale)
      // 한 줄일 때 기준선이 지역 y = 0에 온다. x를 뒤집어 위아래를 바로 세운다
      mesh.rotation.x = Math.PI
      mesh.position.x = pen
      // 폭: 마지막 글자의 오른쪽 끝 (넓게 준 width 대신 글자 위치로 잰다)
      const glyphs = geometry.layout.glyphs
      const width = glyphs.reduce((max, g) => Math.max(max, g.position[0] + g.data.xadvance), 0)
      geometry.visibleGlyphs.forEach((g) => {
        const x = g.position[0] + g.data.xoffset
        const y = g.position[1] + g.data.yoffset
        // rotation.x = π: y → -y
        this.#glyphRects.push({ x: pen + x * scale, y: -(y + g.data.height) * scale, w: g.data.width * scale, h: g.data.height * scale })
      })
      pen += width * scale
      meshes.push(mesh)
    })
    // 문장 전체를 가운데 정렬
    const half = pen / 2
    meshes.forEach((mesh) => {
      mesh.position.x -= half
      this.group.add(mesh)
    })
    this.#glyphRects.forEach((rect) => { rect.x -= half })
    this.width = pen
    return this.group
  }

  // 원본은 경계 상자 안 아무 데서나 뽑았다. 글꼴이 섞이고 띄어쓰기가 있어 실제 글자 사각형 안에서 뽑는다
  getRandomPositionInMesh(target = new THREE.Vector3()) {
    const rect = this.#glyphRects[Math.floor(Math.random() * this.#glyphRects.length)]
    target.set(rect.x + Math.random() * rect.w, rect.y + Math.random() * rect.h, Math.random() * 0.5)
    this.group.updateWorldMatrix(true, false)
    return this.group.localToWorld(target)
  }

  createTextMaterial(fontAtlasTexture, perlinTexture, uProgress, { font, color, dissolvedColor }) {
    const textMaterial = new MSDFTextNodeMaterial({
      map: fontAtlasTexture,
      transparent: true,
    })
    textMaterial.side = THREE.DoubleSide

    const glyphUv = attribute('glyphUv', 'vec2')
    const center = attribute('center', 'vec2')

    const uNoiseRemapMin = uniform(0.48)
    const uNoiseRemapMax = uniform(0.9)
    const uCenterScale = uniform(0.05)
    const uGlyphScale = uniform(0.75)
    const uDissolvedColor = uniform(new THREE.Color(dissolvedColor))
    const uDesatComplete = uniform(0.45)
    const uBaseColor = uniform(new THREE.Color(color))

    const customUv = center.mul(uCenterScale).add(glyphUv.mul(uGlyphScale))

    const perlinTextureNode = texture(perlinTexture, customUv).x
    const perlinRemap = clamp(perlinTextureNode.sub(uNoiseRemapMin).div(uNoiseRemapMax.sub(uNoiseRemapMin)), 0, 1)
    const dissolve = step(uProgress, perlinRemap)
    const desaturationProgress = smoothstep(float(0.0), uDesatComplete, uProgress)

    const colorMix = mix(uBaseColor, uDissolvedColor, desaturationProgress)
    textMaterial.colorNode = colorMix
    // MSDF 알파: 라이브러리의 sigDist / fwidth(sigDist)는 거리값이 평평한 곳(글자 안 · 바깥)에서 0으로 나눠
    // 일부 GPU에서 글자 상자 전체가 칠해진다. UV의 화면 변화량으로 거리 범위를 픽셀로 바꾸는 표준 방식을 쓴다
    const s = texture(fontAtlasTexture, uv())
    const sigDist = max(min(s.r, s.g), min(max(s.r, s.g), s.b)).sub(0.5)
    const unitRange = vec2(font.distanceField.distanceRange / font.common.scaleW, font.distanceField.distanceRange / font.common.scaleH)
    const screenPxRange = max(unitRange.div(fwidth(uv())).dot(vec2(0.5)), float(1))
    const msdfOpacity = clamp(sigDist.mul(screenPxRange).add(0.5), 0, 1)
    textMaterial.opacityNode = msdfOpacity.mul(dissolve).mul(this.uOpacity)
    // 밝은 배경 위 진한 글자라 원본(0.4)보다 약하게
    textMaterial.mrtNode = mrt({
      bloomIntensity: float(0.2).mul(dissolve),
    })

    return textMaterial
  }
}
