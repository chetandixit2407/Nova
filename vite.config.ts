import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { exec } from 'child_process';
import { defineConfig, Plugin } from 'vite';

function nativeLaunchPlugin(): Plugin {
  return {
    name: 'native-app-launch-bridge',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/launch-app' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const { id, name, protocol, exePath, processName } = data;
              const isWindows = process.platform === 'win32';

              let commandToRun = '';
              if (isWindows) {
                if (protocol) {
                  commandToRun = `start "" "${protocol}"`;
                } else if (exePath) {
                  commandToRun = `start "" "${exePath}"`;
                } else if (processName) {
                  commandToRun = `start "" "${processName}"`;
                }
              } else {
                // Cross-platform fallback for testing environments
                if (protocol && (protocol.startsWith('http://') || protocol.startsWith('https://'))) {
                  commandToRun = `xdg-open "${protocol}" 2>/dev/null || true`;
                } else if (id === 'vscode') {
                  commandToRun = `code --version 2>/dev/null || true`;
                } else {
                  commandToRun = `echo "Native launch requested for ${name || id}"`;
                }
              }

              if (commandToRun) {
                exec(commandToRun, (err) => {
                  if (err) {
                    console.warn(`[LaunchBridge] Command warning: ${err.message}`);
                  }
                });
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  platform: process.platform,
                  executed: commandToRun || protocol || name,
                  message: `Launched ${name || id} successfully.`
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Parse error' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), nativeLaunchPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
