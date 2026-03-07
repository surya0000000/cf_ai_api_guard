const HTML_PAGE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>API Guard - Analyze</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    textarea { width: 100%; height: 150px; padding: 0.5rem; font-family: monospace; resize: vertical; }
    button { padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; background: #f6821f; color: white; border: none; border-radius: 4px; }
    button:hover { background: #e5730f; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    #result { margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 4px; white-space: pre-wrap; min-height: 100px; }
    .error { color: #c00; }
  </style>
</head>
<body>
  <h1>API Guard</h1>
  <p>Paste your API description below for security, performance, and Cloudflare feature analysis.</p>
  <textarea id="apiDesc" placeholder="e.g. REST API with /users endpoint, JWT auth..."></textarea>
  <br><br>
  <button id="analyzeBtn">Analyze API</button>
  <div id="result"></div>
  <script>
    document.getElementById('analyzeBtn').onclick = async () => {
      const btn = document.getElementById('analyzeBtn');
      const result = document.getElementById('result');
      const desc = document.getElementById('apiDesc').value.trim();
      if (!desc) { result.textContent = 'Please enter an API description.'; result.className = 'error'; return; }
      btn.disabled = true;
      result.textContent = 'Analyzing...';
      result.className = '';
      try {
        const res = await fetch('/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: desc }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        result.textContent = data.analysis || data.response || JSON.stringify(data);
      } catch (e) {
        result.textContent = 'Error: ' + e.message;
        result.className = 'error';
      }
      btn.disabled = false;
    };
  </script>
</body>
</html>`;

const PROMPT = `Analyze the following API description and provide a structured response with these three sections:

1. **Security Risks**: Identify potential security vulnerabilities, authentication/authorization issues, and best practice violations.

2. **Performance Improvements**: Suggest optimizations for latency, throughput, caching, and scalability.

3. **Cloudflare Feature Suggestions**: Recommend relevant Cloudflare products (Workers, KV, D1, R2, Cache, WAF, etc.) that could improve this API.

API Description:
---
{{DESCRIPTION}}
---`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HTML_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    if (url.pathname === '/analyze' && request.method === 'POST') {
      return handleAnalyze(request, env);
    }
    return new Response('Not Found', { status: 404 });
  },
};

async function handleAnalyze(request, env) {
  try {
    const body = await request.json();
    const description = body?.description || body?.apiDescription || '';
    if (!description) {
      return jsonResponse({ error: 'Missing API description' }, 400);
    }

    const prompt = PROMPT.replace('{{DESCRIPTION}}', description);

    const response = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
      prompt,
      max_tokens: 2048,
    });

    const analysis = response?.response || (typeof response === 'string' ? response : JSON.stringify(response));

    const key = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await env.API_HISTORY.put(key, JSON.stringify({
      timestamp: new Date().toISOString(),
      description: description.slice(0, 500),
      analysis: analysis.slice(0, 2000),
    }), { expirationTtl: 86400 * 30 });

    return jsonResponse({ analysis });
  } catch (e) {
    return jsonResponse({ error: e.message || 'Analysis failed' }, 500);
  }
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
