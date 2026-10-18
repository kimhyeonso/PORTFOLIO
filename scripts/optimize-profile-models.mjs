import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, weld, simplify, resample, prune, sparse, textureCompress } from '@gltf-transform/functions'
import { MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Keep source models outside public/ so Vite only deploys the optimized copies.
const source = process.argv[2]
if (!source) {
  console.error('Usage: npm run models:optimize -- <original-model-directory> [output-directory]')
  process.exit(1)
}
const output = resolve(process.argv[3] ?? 'public/models')
if (resolve(source) === output) {
  console.error('Use separate source and output directories to preserve the originals.')
  process.exit(1)
}
mkdirSync(output, { recursive: true })
await MeshoptSimplifier.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const models = [
  'profile-anime-girl.glb',
  'skill-anime-girl.glb',
  'equipment-cute-girl.glb',
  'stats-chibi-girl.glb',
  'record-anime-girl.glb',
]
for (const model of models) {
  const document = await io.read(join(resolve(source), model))
  // Preserve the scene hierarchy and avoid Draco/Meshopt decoder dependencies.
  await document.transform(
    dedup(), weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.15, error: 0.001 }),
    resample(), prune(), sparse(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] }),
  )
  await io.write(join(output, model), document)
  console.log(`Optimized ${model}`)
}
