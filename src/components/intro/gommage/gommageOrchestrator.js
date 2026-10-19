import * as THREE from 'three/webgpu'
import { uniform } from 'three/tsl'
import gsap from 'gsap'
import MSDFText from './msdfText.js'
import DustParticles from './dustParticles.js'
import PixelParticles from './pixelParticles.js'
import BackgroundDissolve from './backgroundDissolve.js'
import koFont from '../../../assets/image/intro/gommage/question-ko.json'
import koAtlasUrl from '../../../assets/image/intro/gommage/question-ko.png'
import pixelFont from '../../../assets/image/intro/gommage/question-pixel.json'
import pixelAtlasUrl from '../../../assets/image/intro/gommage/question-pixel.png'
import perlinUrl from '../../../assets/image/intro/gommage/perlin.webp'
import dustUrl from '../../../assets/image/intro/gommage/dustParticle.png'

const DURATION = 2.5 // s, 글자가 다 지워지기까지
const DUST_INTERVAL = 0.125 // s, 원본과 같은 간격
const PIXEL_INTERVAL = 0.03 // s
const PIXELS_PER_TICK = 4
const LIGHTS_PER_TICK = 2
const PIECES_PER_TICK = 12 // 배경에서 떨어져 나가는 조각

/**
 * 원본 Gommage gommageOrchestrator.js 구조 유지:
 * uProgress 하나를 GSAP으로 0 → 1 움직여 글자를 noise로 지우고, 그동안 일정 간격으로 글자 자리에서 먼지 · 입자를 태어나게 한다.
 * 꽃잎 대신 픽셀(단색 + 빛 입자 두 무리)을 쓴다.
 * 같은 시간 동안 배경도 픽셀 칸으로 부서지며 아래 → 위로 사라진다 (BackgroundDissolve).
 */
export default class GommageOrchestrator {
  #uProgress = uniform(0.0)
  #MSDFTextEntity = null
  #DustParticlesEntity = null
  #PixelEntity = null
  #LightEntity = null
  #Background = null
  #tweens = []
  #textures = []
  #clock
  #endsAt = 0

  // 지우는 중이거나 마지막 입자가 아직 떠 있는 동안 true
  get running() {
    return this.#tweens.length > 0 || this.#clock() < this.#endsAt
  }

  // clock: 셰이더 uTime과 같은 시계 (초)
  async initialize(scene, uTime, clock) {
    this.#clock = clock
    const { perlinTexture, dustParticleTexture, koAtlas, pixelAtlas } = await this.loadTextures()

    // 배경 칸 · 배경 조각 입자 (글자보다 먼저 그린다)
    this.#Background = new BackgroundDissolve()
    this.#Background.initialize(perlinTexture, uTime).forEach((mesh) => scene.add(mesh))

    this.#MSDFTextEntity = new MSDFText()
    // HTML 제목과 같은 글꼴 · 색: 한글은 Noto Sans KR Bold, STAGE만 픽셀 글꼴(0.82em · 스카이블루)
    const ko = { font: koFont, atlas: koAtlas, color: '#0f4467', dissolvedColor: '#8aa2b4', letterSpacing: -0.02 }
    const segments = [
      { ...ko, text: '다음' },
      { ...ko, text: ' ' },
      { font: pixelFont, atlas: pixelAtlas, text: 'STAGE', size: 0.82, color: '#2f8fc2', dissolvedColor: '#9db8c8' },
      { ...ko, text: '는 어딜까?' },
    ]
    this.text = this.#MSDFTextEntity.initialize(segments, this.#uProgress, perlinTexture)
    this.textEntity = this.#MSDFTextEntity
    scene.add(this.text)

    this.#DustParticlesEntity = new DustParticles()
    scene.add(this.#DustParticlesEntity.initialize(perlinTexture, dustParticleTexture, uTime))
    this.#DustParticlesEntity.reset()

    this.#PixelEntity = new PixelParticles({ max: 400 })
    scene.add(this.#PixelEntity.initialize(perlinTexture, uTime))
    // 빛 입자는 단색 픽셀 위에 그린다
    this.#LightEntity = new PixelParticles({ light: true, max: 320 })
    const lights = this.#LightEntity.initialize(perlinTexture, uTime)
    lights.renderOrder = 1
    scene.add(lights)
  }

  resize(widthPx, heightPx, ppu) {
    this.#Background.resize(widthPx, heightPx, ppu)
  }

  async loadTextures() {
    const textureLoader = new THREE.TextureLoader()
    const [dustParticleTexture, perlinTexture, koAtlas, pixelAtlas] = await Promise.all([dustUrl, perlinUrl, koAtlasUrl, pixelAtlasUrl].map((url) => textureLoader.loadAsync(url)))

    dustParticleTexture.colorSpace = THREE.NoColorSpace
    dustParticleTexture.minFilter = THREE.LinearFilter
    dustParticleTexture.magFilter = THREE.LinearFilter
    dustParticleTexture.generateMipmaps = false

    perlinTexture.colorSpace = THREE.NoColorSpace
    perlinTexture.minFilter = THREE.LinearFilter
    perlinTexture.magFilter = THREE.LinearFilter
    perlinTexture.wrapS = THREE.RepeatWrapping
    perlinTexture.wrapT = THREE.RepeatWrapping
    perlinTexture.generateMipmaps = false

    ;[koAtlas, pixelAtlas].forEach((atlas) => {
      atlas.colorSpace = THREE.NoColorSpace
      atlas.minFilter = THREE.LinearFilter
      atlas.magFilter = THREE.LinearFilter
      atlas.wrapS = THREE.ClampToEdgeWrapping
      atlas.wrapT = THREE.ClampToEdgeWrapping
      atlas.generateMipmaps = false
    })

    this.#textures = [dustParticleTexture, perlinTexture, koAtlas, pixelAtlas]
    return { perlinTexture, dustParticleTexture, koAtlas, pixelAtlas }
  }

  triggerGommage(onComplete) {
    // Don't start if already running
    if (this.#tweens.length) return
    this.#uProgress.value = 0
    // 마지막에 태어난 입자의 수명(최대 2.2초)까지
    this.#endsAt = this.#clock() + DURATION + 2.3
    const position = new THREE.Vector3()

    const spawnDust = gsap.to({}, {
      duration: DUST_INTERVAL,
      repeat: -1,
      onRepeat: () => this.#DustParticlesEntity.spawnDust(this.#MSDFTextEntity.getRandomPositionInMesh(position), this.#clock()),
    })

    const spawnPixels = gsap.to({}, {
      duration: PIXEL_INTERVAL,
      repeat: -1,
      onRepeat: () => {
        const now = this.#clock()
        for (let i = 0; i < PIXELS_PER_TICK; i += 1) this.#PixelEntity.spawnPixel(this.#MSDFTextEntity.getRandomPositionInMesh(position), now)
        for (let i = 0; i < LIGHTS_PER_TICK; i += 1) this.#LightEntity.spawnPixel(this.#MSDFTextEntity.getRandomPositionInMesh(position), now)
        this.#Background.spawn(PIECES_PER_TICK, now, this.#LightEntity)
      },
    })

    // 배경: 글자와 같은 시간 동안 아래 → 위로 부서진다
    const background = gsap.to(this.#Background.uProgress, { value: 1.02, duration: DURATION, ease: 'power1.in' })

    const gommage = gsap.to(this.#uProgress, {
      // 1을 살짝 넘겨 noise가 가장 높은 곳까지 남김없이 지운다
      value: 1.02,
      duration: DURATION,
      ease: 'none',
      onComplete: () => {
        spawnDust.kill()
        spawnPixels.kill()
        this.#tweens = []
        onComplete?.()
      },
    })

    this.#tweens = [spawnDust, spawnPixels, background, gommage]
  }

  resetGommage() {
    this.#tweens.forEach((tween) => tween.kill())
    this.#tweens = []
    this.#uProgress.value = 0
    this.#DustParticlesEntity?.reset()
    this.#PixelEntity?.reset()
    this.#LightEntity?.reset()
    this.#Background?.reset()
  }

  dispose() {
    this.#tweens.forEach((tween) => tween.kill())
    this.#tweens = []
    this.#textures.forEach((texture) => texture.dispose())
  }
}
