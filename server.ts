import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy Route to bypass X-Frame-Options
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send("URL is required");
    }

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).send(`Upstream error: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      
      // If it's not HTML, just pipe it through
      if (!contentType || !contentType.includes('text/html')) {
        const arrayBuffer = await response.arrayBuffer();
        res.setHeader('Content-Type', contentType || 'application/octet-stream');
        return res.send(Buffer.from(arrayBuffer));
      }

      let body = await response.text();

      // Inject frame buster protection and base tag
      const baseUrl = new URL(targetUrl).origin;
      const baseTag = `<base href="${baseUrl}/">`;
      const frameBusterProtection = `
<script>
  (function() {
    try {
      Object.defineProperty(window, 'top', { get: function() { return window; } });
      Object.defineProperty(window, 'parent', { get: function() { return window; } });
      window.top.location = window.location; // Trick frame busters
    } catch (e) {}
  })();
</script>
`;
      
      const injection = baseTag + frameBusterProtection;
      
      if (body.match(/<head[^>]*>/i)) {
        body = body.replace(/(<head[^>]*>)/i, `$1${injection}`);
      } else if (body.match(/<html[^>]*>/i)) {
        body = body.replace(/(<html[^>]*>)/i, `$1<head>${injection}</head>`);
      } else {
        body = injection + body;
      }
      
      // Strip security headers that block iframes
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *;");
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      res.send(body);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).send("Failed to fetch page");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
