# React + Vite

## Vercel deployment

- Deploy the directory containing this `package.json` and `vercel.json`. This directory is the Git repository root; when importing a parent repository, select `PORTFOLIO` as Root Directory.
- Use Node.js 22.x (declared in `package.json`). Vercel configuration selects Vite, `npm run build`, and the `dist` output directory.
- Set `OPENAI_API_KEY` in the Vercel Production and Preview environments for `/api/guide`, then redeploy. Keep this server-only: do not use a `VITE_` prefix. `.env.example` documents local setup.
- `api/guide.js` runs as a Vercel Function; its guide text is included through `functions.includeFiles`. Vite preview serves static output only and does not run this API.
- SPA page URLs fall back to `index.html`; API URLs, model URLs, asset URLs, and file requests keep their normal responses, including 404 for missing files.
- Prefer Git integration for the current large asset set. The October 2026 audit measured approximately 675 MB of build output, including 313 MB of GLB files. No individual output file exceeded 100 MB, but Hobby CLI source uploads are limited to 100 MB total. See [Vercel limits](https://vercel.com/docs/limits). Optimize or externally host large media before using a deployment method with a smaller upload allowance.

Deployment verification: open a page directly and refresh it, check `/models/profile-anime-girl.glb` returns binary data, and check `/api/guide` returns JSON (GET should return 405). Ask the chatbot a question after configuring the API key.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Intro page

`/intro` is a full-screen, keyboard-accessible portfolio journey. `src/components/intro/IntroStart.jsx` renders the stage-select opening screen; pressing **Press Start** begins the requestAnimationFrame timeline in `src/hooks/useIntroEngine.js`.

The `moments` array is the single timing control: adjust an entry's `at` value (milliseconds), `stage`, `item`, and label to tune the route. It moves the world without frame-by-frame React renders, while only updating React state for stage, character pose, and HUD changes. **SKIP INTRO** always cancels the loop and returns to the existing main route (`/`).
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
