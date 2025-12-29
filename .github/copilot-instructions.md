# Copilot / AI Agent Instructions for ApexStore

Purpose: help AI coding agents become immediately productive in this repository.

- Big picture
  - This is a small mono-repo with two primary apps:
    - Server: an Express + Mongoose API located under `server/src` (ES modules).
      - Entry point: `server/src/index.js` (loads `server/.env`, connects MongoDB, starts server).
      - App router: `server/src/app.js` — all API route mounts live here (e.g. `/api/products`, `/api/auth`).
      - Controllers: `server/src/controller/*.js` implement route handlers (e.g. `auth.controller.js`, `vendor.controller.js`).
      - Models: `server/models/*.js` define Mongo schemas.
      - DB config: `server/src/config/db.js` contains Mongo connection logic (connect before starting server).
    - Client: a Vite + React app in `client/`.
      - Entry: `client/src/main.jsx`; components live in `client/src/components/`.
      - State: Redux slices in `client/src/redux/slices/`.

- Run & dev workflows (explicit)
  - Server (API): from repo root run `npm run dev` (uses `nodemon` and `server/src/index.js`). Ensure `server/.env` has `MONGODB_URL` and other env vars. Default server port is `5000` if `PORT` not set.
  - Client (frontend): `cd client && npm run dev` (Vite serves on `5173`). The server CORS is already configured for `localhost:5173` in `server/src/app.js`.
  - Full local dev: open two terminals — one for the server (`npm run dev`) and the other for the client (`cd client && npm run dev`).

- Node / module conventions
  - Project uses native ES modules (`"type": "module"` in root `package.json`). Use `import`/`export` syntax when modifying server code.
  - `server/src/index.js` resolves `server/.env` explicitly — edits that change env loading must keep that path behavior.

- API structure & important patterns
  - Route → Controller → Model mapping is consistent: example `/api/auth` → `server/src/routes/authRoutes.js` → `server/src/controller/auth.controller.js` → `server/models/User.model.js`.
  - Middleware and auth: auth middleware lives under `server/middleware/` (e.g. `auth.js`, `vendorAuth.js`). Controller code expects `req.user` when routes are protected.
  - Error handling: controllers generally throw or return JSON errors; preserve existing logging patterns (index.js logs startup and environment path).

- Project-specific dependencies / integrations
  - Google generative AI: `@google/generative-ai` is included and AI endpoints exist under `server/src/routes/ai.routes.js` + `server/src/controller/ai.controller.js` / test helpers in `server/*test*.js`. Treat these as experimental — changes should keep API keys and env use in `server/.env`.
  - Email: `nodemailer` used in `server/helpers/email.helper.js`.
  - Payment helpers in `server/helpers/payment.helper.js` (verify before changing financial flows).

- Code-edit guidance (examples)
  - Add a new API endpoint: update `server/src/app.js` to mount the route, add `server/src/routes/<name>.js`, implement `server/src/controller/<name>.js`, and wire models in `server/models`.
  - Change DB schema: update `server/models/*.js` then update controllers to use `await Model.save()` patterns already present.
  - Frontend API calls: client uses `client/src/utils/api.js` — keep endpoint paths under `/api/*` consistent with `app.js` mounts.

- Tests & linting
  - Frontend dev dependencies include `vitest` and testing-library — tests (if added) should run from `client/` using `npm run test` (not defined currently but `vitest` is available).
  - ESLint config located at `client/eslint.config.js` — mirror project style when adding client code.

- Safety notes & environment
  - `server/src/index.js` explicitly loads `server/.env` — do not commit secrets. Keep secrets in `.env` or CI secrets.
  - Mongo connection must be available when running server; some controllers assume an initialized connection.

- Files to inspect when asked about behavior (quick jump list)
  - Server start: [server/src/index.js](server/src/index.js)
  - Server router: [server/src/app.js](server/src/app.js)
  - Auth controller: [server/src/controller/auth.controller.js](server/src/controller/auth.controller.js)
  - Routes: [server/src/routes/authRoutes.js](server/src/routes/authRoutes.js)
  - DB config: [server/src/config/db.js](server/src/config/db.js)
  - Client entry: [client/src/main.jsx](client/src/main.jsx)
  - Client API helper: [client/src/utils/api.js](client/src/utils/api.js)

- When you are unsure
  - Prefer minimal, reversible changes (open a PR for code changes).
  - If modifying runtime behavior, run the server locally with `npm run dev` and confirm logs printed by `server/src/index.js`.

If anything here is unclear or you'd like the instructions to include more examples (tests, CI, or deployment), tell me which area to expand.
