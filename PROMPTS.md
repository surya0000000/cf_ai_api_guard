# PROMPTS.md

This project was developed using AI-assisted coding tools including Cursor and ChatGPT.

Below are the key prompts used during development.

---

Prompt 1 — Project scaffolding

Create a minimal Cloudflare Workers AI project called cf_ai_api_guard.

Requirements:
- Cloudflare Worker backend
- Endpoint /analyze
- Accept POST request with API description
- Use Workers AI model @cf/meta/llama-3.1-8b-instruct
- Return analysis including security risks, performance improvements, and Cloudflare feature suggestions
- Store request history using a KV namespace called API_HISTORY

Frontend:
- simple HTML page
- textarea for API description
- button "Analyze API"
- display AI response

---

Prompt 2 — Worker implementation

Write a Cloudflare Worker in JavaScript that receives a POST request containing an API description, sends it to Workers AI Llama 3.1, and returns the generated analysis.

---

Prompt 3 — KV storage integration

Show how to store user requests in a Cloudflare KV namespace from a Worker to maintain simple state or request history.

---

Prompt 4 — Frontend interface

Create a minimal HTML page with a textarea input and a button that sends the API description to a backend endpoint and displays the response.

---

Prompt 5 — Deployment guidance

Explain how to deploy a Cloudflare Worker using Wrangler CLI and configure KV namespaces in wrangler.toml.
