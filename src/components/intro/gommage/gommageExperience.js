import * as THREE from 'three/webgpu'
import { float, mrt, pass, output, uniform, vec4 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import GommageOrchestrator from './gommageOrchestrator.js'
import { EM } from './msdfText.js'

// Noto Sans KR(ascent 1.16 · descent 0.288em)을 line-height 1.35로 놓았을 때 줄 가운데 → 기준선 거리 (em)
const BASELINE_FROM_CENTER = 0.436

/**
 * 원본 Gommage experience.js 구조 유지: WebGPURenderer + 장면 + RenderPipeline(MRT bloomIntensity로 선택적 bloom).
 * 바뀐 점
 *  - 투명 캔버스: 질문 화면의 CSS 배경 · 링 위에 겹친다. bloom은 알파 없이 색만 더해 페이지 위에서도 빛이 더해지게
 *  - 정사영 카메라: HTML 제목(target)의 위치 · 글자 크기 · 투명도를 매 프레임 따라가 같은 자리에 MSDF 글자를 그린다
 *  - 시계: 입자 생일과 셰이더 uTime이 같은 시계를 쓴다 (TSL time은 첫 프레임부터 세서 performance.now와 어긋난다)
 */
export default class GommageExperience {
  #renderer = null
  #scene = new THREE.Scene()
  #camera = new THREE.OrthographicCamera()
  #pipeline = null
  #orchestrator = new GommageOrchestrator()
  #uTime = uniform(0)
  #start = performance.now()
  #target = null
  #size = { width: 0, height: 0, fontSize: 0 }
  #disposed = false
  #useBloom = true
  #idle = false

  clock = () => (performance.now() - this.#start) / 1000

  async initialize(canvas, { target, bloom: useBloom = true } = {}) {
    this.#target = target
    this.#useBloom = useBloom
    // WebGPU가 없으면 WebGL2로 자동 대체된다
    this.#renderer = new THREE.WebGPURenderer({ canvas, alpha: true, antialias: true })
    await this.#renderer.init()
    if (this.#disposed) return false
    this.#renderer.toneMapping = THREE.NoToneMapping
    this.#renderer.setClearColor(0x000000, 0)
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.#camera.position.set(0, 0, 5)
    this.#camera.near = 0.1
    this.#camera.far = 25

    await this.#orchestrator.initialize(this.#scene, this.#uTime, this.clock)
    if (this.#disposed) return false
    this.#setupPostprocessing()
    this.#resize()
    // 셰이더를 미리 컴파일해 첫 프레임 · 첫 입자가 끊기지 않게
    await this.#renderer.compileAsync(this.#scene, this.#camera)
    if (this.#disposed) return false
    this.#renderer.setAnimationLoop(() => this.#render())
    return true
  }

  #setupPostprocessing() {
    this.#pipeline = new THREE.RenderPipeline(this.#renderer)
    const scenePass = pass(this.#scene, this.#camera)
    scenePass.setMRT(mrt({ output, bloomIntensity: float(0) }))
    const outputPass = scenePass.getTextureNode()
    if (!this.#useBloom) {
      this.#pipeline.outputNode = outputPass
      return
    }
    const bloomIntensityPass = scenePass.getTextureNode('bloomIntensity')
    const bloomPass = bloom(outputPass.mul(bloomIntensityPass.r), 0.8)
    // 장면 색(미리 곱한 알파) + bloom 빛(알파 0 → 아래 페이지에 그대로 더해진다)
    this.#pipeline.outputNode = vec4(outputPass.rgb.add(bloomPass.rgb), outputPass.a)
  }

  // 화면 · 글자 크기가 바뀌면 카메라를 맞춘다: 1em = EM 월드 단위
  #resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    const el = this.#target?.current
    const fontSize = el ? parseFloat(getComputedStyle(el).fontSize) : this.#size.fontSize || 48
    if (width === this.#size.width && height === this.#size.height && fontSize === this.#size.fontSize) return
    this.#size = { width, height, fontSize }
    const ppu = fontSize / EM // 월드 단위 1 = ppu px
    Object.assign(this.#camera, { left: -width / 2 / ppu, right: width / 2 / ppu, top: height / 2 / ppu, bottom: -height / 2 / ppu })
    this.#camera.updateProjectionMatrix()
    this.#renderer.setSize(width, height, false)
    this.#orchestrator.resize(width, height, ppu)
  }

  // HTML 제목 자리에 글자를 놓는다 (등장 애니메이션의 y 이동 · 투명도도 그대로 따라간다)
  #follow() {
    const text = this.#orchestrator.text
    const el = this.#target?.current
    if (!el) {
      text.visible = false
      return
    }
    const { width, height, fontSize } = this.#size
    const ppu = fontSize / EM
    const rect = el.getBoundingClientRect()
    const baseline = rect.top + rect.height / 2 + BASELINE_FROM_CENTER * fontSize
    text.visible = true
    text.position.set((rect.left + rect.width / 2 - width / 2) / ppu, (height / 2 - baseline) / ppu, 0)
    // 화면보다 넓으면 좌우 16px 여백 안으로 줄인다
    const fit = Math.min(1, (width - 32) / (this.#orchestrator.textEntity.width * ppu))
    text.scale.setScalar(fit)
    this.#orchestrator.textEntity.uOpacity.value = parseFloat(getComputedStyle(el).opacity)
  }

  #render() {
    this.#resize()
    this.#uTime.value = this.clock()
    this.#follow()
    // 제목이 아직 없고(소용돌이 · 워프 터널 중) 입자도 없으면 빈 화면을 한 번만 그리고 쉰다
    const idle = !this.#target?.current && !this.#orchestrator.running
    if (idle && this.#idle) return
    this.#idle = idle
    this.#pipeline.render()
  }

  trigger(onComplete) {
    this.#orchestrator.triggerGommage(onComplete)
  }

  dispose() {
    this.#disposed = true
    this.#orchestrator.dispose()
    if (!this.#renderer) return
    this.#renderer.setAnimationLoop(null)
    this.#scene.traverse((object) => {
      object.geometry?.dispose()
      object.material?.dispose()
    })
    this.#pipeline?.dispose()
    this.#renderer.dispose()
  }
}
