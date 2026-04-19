import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const anthropicPlugin = (env: Record<string, string>) => ({
  name: 'anthropic-api',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/api/anthropic' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body);
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'x-api-key': env.VITE_ANTHROPIC_API_KEY || payload.apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: payload.model || 'claude-haiku-4-5-20251001',
                max_tokens: payload.max_tokens || 1024,
                system: payload.system,
                messages: payload.messages,
              }),
            });

            if (!response.ok) {
              const err = await response.text();
              res.statusCode = response.status;
              res.end(err);
              return;
            }

            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
        });
      } else {
        next();
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), anthropicPlugin(env)],
    server: {
      host: true,
      port: 5173,
    },
  };
});
