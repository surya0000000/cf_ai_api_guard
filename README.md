# cf_ai_api_guard

Minimal Cloudflare Workers AI project that analyzes API descriptions for security risks, performance improvements, and Cloudflare feature suggestions.

## Setup

1. **Create KV namespace** (required before deploy):
   ```bash
   npx wrangler kv namespace create API_HISTORY
   ```
   Copy the `id` from the output and replace `REPLACE_WITH_KV_NAMESPACE_ID` in `wrangler.toml`.

2. **Deploy**:
   ```bash
   npx wrangler deploy
   ```

3. **Local dev**:
   ```bash
   npx wrangler dev
   ```
   Open http://localhost:8787

## Usage

- **GET /** – Serves the frontend (or open `index.html` directly)
- **POST /analyze** – Accepts `{ "description": "your API description" }`, returns AI analysis

## Files

- `wrangler.toml` – Worker config (AI + KV bindings)
- `src/index.js` – Worker (serves HTML, handles /analyze)
- `index.html` – Standalone frontend
