import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Local development middleware to serve /api/* serverless functions
 * without requiring the Vercel CLI.
 */
function viteApiServer() {
  return {
    name: 'vite-api-server',
    configureServer(server) {
      // Load environment variables (.env, .env.local) into process.env for local API routes
      const env = loadEnv('development', process.cwd(), '');
      Object.assign(process.env, env);

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (!url || !url.startsWith('/api/')) {
          return next();
        }

        // Buffer and parse request body for POST requests
        if (req.method === 'POST') {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf8');
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            req.body = {};
          }
        }

        const endpoint = url.replace(/^\/api\//, '');
        try {
          if (endpoint === 'auth') {
            const mod = await server.ssrLoadModule('/api/auth.js');
            return await mod.default(req, res);
          }
          if (endpoint === 'recommend') {
            const mod = await server.ssrLoadModule('/api/recommend.js');
            return await mod.default(req, res);
          }
          if (endpoint === 'nutrition') {
            const mod = await server.ssrLoadModule('/api/nutrition.js');
            return await mod.default(req, res);
          }
          if (endpoint === 'admin') {
            const mod = await server.ssrLoadModule('/api/admin.js');
            return await mod.default(req, res);
          }
        } catch (err) {
          console.error(`[Local API Error in /api/${endpoint}]:`, err);
          res.statusCode = err.status || 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { code: err.code || 'INTERNAL', message: err.message } }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), viteApiServer()],
  test: {
    environment: 'node',
    globals: true,
  },
});
