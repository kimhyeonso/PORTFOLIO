import * as THREE from 'three/webgpu'
import { attribute, uniform, positionLocal, texture, vec4, uv, mrt, vec2, vec3, clamp, smoothstep, float } from 'three/tsl'

/**
 * 먼지 (원본 Gommage dustParticles.js 구조 유지).
 * 글자가 지워지는 동안 일정 간격으로 글자 자리에서 태어나 noise 난류를 타고 흩어진다.
 * 바뀐 점: 픽셀과 같이 위로 떠오르도록 바람 방향을 위쪽으로 · 밝은 배경에 맞춘 색 · 시간은 공용 uTime
 */
export default class DustParticles {
  #spawnPos
  #birthLifeSeedScale
  #currentDustIndex = 0
  #dustMesh
  #MAX_DUST = 100

  initialize(perlinTexture, dustParticleTexture, uTime) {
    const dustGeometry = new THREE.PlaneGeometry(0.02, 0.02)
    this.#spawnPos = new Float32Array(this.#MAX_DUST * 3)
    // Combined 4 attributes into one to not go above the 9 attribute limit for webgpu
    this.#birthLifeSeedScale = new Float32Array(this.#MAX_DUST * 4)
    this.#currentDustIndex = 0

    dustGeometry.setAttribute('aSpawnPos', new THREE.InstancedBufferAttribute(this.#spawnPos, 3))
    dustGeometry.setAttribute('aBirthLifeSeedScale', new THREE.InstancedBufferAttribute(this.#birthLifeSeedScale, 4))
    const material = this.createDustMaterial(perlinTexture, dustParticleTexture, uTime)
    this.#dustMesh = new THREE.InstancedMesh(dustGeometry, material, this.#MAX_DUST)
    this.#dustMesh.frustumCulled = false
    return this.#dustMesh
  }

  spawnDust(spawnPos, now) {
    if (this.#currentDustIndex === this.#MAX_DUST) this.#currentDustIndex = 0
    const id = this.#currentDustIndex
    this.#currentDustIndex = this.#currentDustIndex + 1
    this.#spawnPos[id * 3 + 0] = spawnPos.x
    this.#spawnPos[id * 3 + 1] = spawnPos.y
    this.#spawnPos[id * 3 + 2] = spawnPos.z
    this.#birthLifeSeedScale[id * 4 + 0] = now // Birth time
    this.#birthLifeSeedScale[id * 4 + 1] = 2.2 // Life time (전체 2.5초 안에 대부분 사라지게)
    this.#birthLifeSeedScale[id * 4 + 2] = Math.random() // Random seed
    this.#birthLifeSeedScale[id * 4 + 3] = Math.random() * 0.5 + 0.5 // Scale

    this.#dustMesh.geometry.attributes.aSpawnPos.needsUpdate = true
    this.#dustMesh.geometry.attributes.aBirthLifeSeedScale.needsUpdate = true
  }

  // 아직 태어나지 않은 칸은 생일을 아주 먼 미래로 둬서 보이지 않게
  reset() {
    for (let i = 0; i < this.#MAX_DUST; i += 1) this.#birthLifeSeedScale[i * 4] = 1e9
    this.#dustMesh.geometry.attributes.aBirthLifeSeedScale.needsUpdate = true
  }

  createDustMaterial(perlinTexture, dustTexture, uTime) {
    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })

    const aSpawnPos = attribute('aSpawnPos', 'vec3')
    const aBirthLifeSeedScale = attribute('aBirthLifeSeedScale', 'vec4')
    const aBirth = aBirthLifeSeedScale.x
    const aLife = aBirthLifeSeedScale.y
    const aSeed = aBirthLifeSeedScale.z
    const aScale = aBirthLifeSeedScale.w

    const uDustColor = uniform(new THREE.Color('#5d7f99'))
    const uWindDirection = uniform(new THREE.Vector3(-0.35, 1, 0).normalize())
    const uWindStrength = uniform(0.12)
    const uRiseSpeed = uniform(0.1) // constant lift
    const uNoiseScale = uniform(30.0) // start small (frequency)
    const uNoiseSpeed = uniform(0.015) // scroll speed
    const uWobbleAmp = uniform(0.6) // vertical wobble amplitude

    // Age of the dust in seconds
    const dustAge = uTime.sub(aBirth)
    const lifeInterpolation = clamp(dustAge.div(aLife), 0, 1)
    const alive = smoothstep(float(-0.001), float(0), dustAge)

    // Use noise
    const randomSeed = vec2(aSeed.mul(123.4), aSeed.mul(567.8))
    const noiseUv = aSpawnPos.xz
      .mul(uNoiseScale)
      .add(randomSeed)
      .add(uWindDirection.xz.mul(dustAge.mul(uNoiseSpeed)))

    // Return a value between 0 and 1.
    const noiseSample = texture(perlinTexture, noiseUv).x
    const noiseSampleBis = texture(perlinTexture, noiseUv.add(vec2(13.37, 7.77))).x

    // Convert to turbulence values between -1 and 1.
    const turbulenceX = noiseSample.sub(0.5).mul(2)
    const turbulenceY = noiseSampleBis.sub(0.5).mul(2)

    const swirl = vec3(clamp(turbulenceX.mul(lifeInterpolation), 0, 1.0), turbulenceY.mul(lifeInterpolation), 0.0).mul(uWobbleAmp)

    const windImpulse = uWindDirection.mul(uWindStrength).mul(dustAge)

    const riseFactor = clamp(noiseSample, 0.3, 1.0)
    const rise = vec3(0.0, dustAge.mul(uRiseSpeed).mul(riseFactor), 0.0)
    const driftMovement = windImpulse.add(rise).add(swirl)

    // 0 at creation, 1 at death
    const scaleFactor = smoothstep(float(0), float(0.05), lifeInterpolation).mul(alive)
    const fadingOut = float(1.0).sub(smoothstep(float(0.8), float(1.0), lifeInterpolation)).mul(alive)

    const dustSample = texture(dustTexture, uv())
    material.colorNode = vec4(uDustColor, dustSample.a)
    material.positionNode = aSpawnPos.add(driftMovement).add(positionLocal.mul(aScale.mul(scaleFactor)))
    material.opacityNode = fadingOut

    material.mrtNode = mrt({
      bloomIntensity: float(0.5).mul(fadingOut),
    })

    return material
  }
}
