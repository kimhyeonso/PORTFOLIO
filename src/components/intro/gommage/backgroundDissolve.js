import * as THREE from 'three/webgpu'
import { uniform, uv, texture, floor, float, clamp, step, mix, length, mrt } from 'three/tsl'
import PixelParticles from './pixelParticles.js'

const CELL_PX = 18 // 배경 조각 한 칸 (CSS px)
const BAND = 0.06 // 막 부서지는 칸이 빛나는 폭 (진행도 단위)
const NOISE_WEIGHT = 0.25 // 칸마다 순서를 섞는 정도 (나머지는 아래 → 위 높이)
// 질문 화면 배경(.intro-portal-veil)의 색 — 떨어져 나간 조각 입자
const VEIL_COLORS = ['#dbf0f7', '#9fd3e8', '#73bddb', '#4f9cc2']

/**
 * 질문 화면 배경이 픽셀 칸으로 부서지며 아래 → 위로 사라진다 (글자 지우기와 같은 2.5초 · 같은 perlin 노이즈).
 * CSS 배경(그라디언트 · 링)은 그대로 두고, 그 위에 칸마다 떠날 때의 화이트블루 빛(.intro-portal-glow와 같은 색)을 덮어
 * 배경이 사라지고 다음 화면의 빛이 드러나 보이게 한다. 막 부서지는 줄의 칸은 밝게 빛나고(bloom),
 * 떨어져 나간 칸은 같은 크기의 픽셀 입자가 되어 위로 떠오른다.
 */
export default class BackgroundDissolve {
  uProgress = uniform(0)
  #uGrid = uniform(new THREE.Vector2(1, 1))
  #uPx = uniform(new THREE.Vector2(1, 1))
  #mesh
  #grid = { cols: 1, rows: 1, cell: 0.1 } // cell: 월드 단위 한 칸
  #view = { width: 1, height: 1 } // 월드 단위 화면 크기

  initialize(perlinTexture, uTime) {
    const material = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false })
    const cell = floor(uv().mul(this.#uGrid))
    const cellUv = cell.add(0.5).div(this.#uGrid)
    // 칸마다 perlin 값 → 부서지는 순서를 조금씩 흐트러뜨린다 (텍스처 값은 0.5 근처에 몰려 있어 늘려 쓴다)
    const noise = clamp(texture(perlinTexture, cell.mul(0.09)).x.sub(0.3).div(0.4), 0, 1)
    const threshold = cellUv.y.mul(1 - NOISE_WEIGHT).add(noise.mul(NOISE_WEIGHT))
    const gone = step(threshold, this.uProgress)
    const edge = gone.mul(float(1).sub(step(threshold, this.uProgress.sub(BAND))))

    // .intro-portal-glow: radial-gradient(circle, #fff 0%, #eef8fc 45%, #cde9f5 100%) — 반지름은 가장 먼 모서리까지
    const r = length(uv().sub(0.5).mul(this.#uPx)).div(length(this.#uPx).mul(0.5))
    const c0 = uniform(new THREE.Color('#ffffff'))
    const c1 = uniform(new THREE.Color('#eef8fc'))
    const c2 = uniform(new THREE.Color('#cde9f5'))
    const glow = mix(mix(c0, c1, clamp(r.div(0.45), 0, 1)), c2, clamp(r.sub(0.45).div(0.55), 0, 1))
    const uEdgeColor = uniform(new THREE.Color('#9fe6ff'))

    material.colorNode = mix(glow, uEdgeColor.mul(1.3), edge)
    material.opacityNode = gone
    material.mrtNode = mrt({ bloomIntensity: edge.mul(0.8) })

    this.#mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
    this.#mesh.frustumCulled = false
    // 글자 · 입자보다 먼저 그린다
    this.#mesh.renderOrder = -1

    // 떨어져 나간 칸: 칸 크기의 픽셀 입자
    this.pieces = new PixelParticles({ max: 800, colors: VEIL_COLORS, scale: [0.55, 0.95], life: [1.1, 1.8], riseSpeed: 0.45, riseAccel: 0.35 })
    const pieces = this.pieces.initialize(perlinTexture, uTime)
    return [this.#mesh, pieces]
  }

  // 화면 크기(px) · 월드 단위 1 = ppu px
  resize(widthPx, heightPx, ppu) {
    const cols = Math.ceil(widthPx / CELL_PX)
    const rows = Math.ceil(heightPx / CELL_PX)
    this.#grid = { cols, rows, cell: CELL_PX / ppu }
    this.#view = { width: widthPx / ppu, height: heightPx / ppu }
    // 칸이 화면 끝에서 잘리지 않게 격자 크기로 덮는다 (가운데 기준)
    this.#mesh.scale.set((cols * CELL_PX) / ppu, (rows * CELL_PX) / ppu, 1)
    this.#uGrid.value.set(cols, rows)
    this.#uPx.value.set(cols * CELL_PX, rows * CELL_PX)
    this.pieces.uPixelSize.value = this.#grid.cell
  }

  // 지금 부서지는 줄 근처 칸에서 조각을 떼어 낸다 (셰이더의 순서식을 노이즈 평균으로 거꾸로 풀어 높이를 정한다)
  spawn(count, now, lights) {
    const p = this.uProgress.value
    if (p <= 0 || p > 1.05) return
    const { cols, rows, cell } = this.#grid
    const position = new THREE.Vector3()
    for (let i = 0; i < count; i += 1) {
      const t = p - Math.random() * BAND
      const n = 0.2 + Math.random() * 0.6
      const yUv = (t - n * NOISE_WEIGHT) / (1 - NOISE_WEIGHT)
      if (yUv < 0 || yUv > 1) continue
      const col = Math.floor(Math.random() * cols)
      const row = Math.min(rows - 1, Math.floor(yUv * rows))
      position.set((col + 0.5 - cols / 2) * cell, (row + 0.5 - rows / 2) * cell, 0)
      this.pieces.spawnPixel(position, now)
      // 몇 개는 빛 입자도 같이
      if (lights && Math.random() < 0.25) lights.spawnPixel(position, now)
    }
  }

  get view() {
    return this.#view
  }

  reset() {
    this.uProgress.value = 0
    this.pieces.reset()
  }
}
