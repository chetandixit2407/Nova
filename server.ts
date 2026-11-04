import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { execFile } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

// Prevent Vite from exiting when stdin reaches EOF during non-interactive pre-warming
process.env.CI = 'true';

function resolvePort(): number {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--port' || arg === '-p') && args[i + 1]) {
      const parsed = Number(args[i + 1]);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    if (arg.startsWith('--port=')) {
      const parsed = Number(arg.split('=')[1]);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  const envPort = Number(process.env.PORT);
  if (!Number.isNaN(envPort) && envPort > 0) return envPort;
  return 3000;
}

async function startServer() {
  const app = express();
  const port = resolvePort();
  const host = '0.0.0.0';

  app.use(express.json());

  app.post('/api/launch-app', (req: Request, res: Response) => {
    try {
      const { id, name, protocol, exePath, processName } = req.body ?? {};
      const isWindows = process.platform === 'win32';
      const target = protocol || exePath || processName || '';

      if (isWindows && typeof target === 'string' && target.length > 0) {
        execFile('cmd.exe', ['/c', 'start', '', target], (err) => {
          if (err) {
            console.warn(`[LaunchBridge] Command warning: ${err.message}`);
          }
        });
      }

      res.json({
        success: true,
        platform: process.platform,
        executed: target || name || id,
        message: `Launched ${name || id || 'application'} successfully.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Launch error';
      res.status(500).json({ success: false, error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distPath));
    app.use((req: Request, res: Response, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) {
        next();
        return;
      }
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found');
      }
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const httpServer = app.listen(port, host, () => {
    console.log(`Server ready at http://localhost:${port}/`);
  });

  const shutdown = () => {
    httpServer.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 500).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
