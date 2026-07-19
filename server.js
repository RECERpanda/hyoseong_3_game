import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Determine where static files are located
// If a dist folder exists, serve from dist. Otherwise serve from the root.
const distPath = path.join(__dirname, 'dist');
const staticPath = fs.existsSync(distPath) ? distPath : __dirname;

console.log(`[Server] Serving static files from: ${staticPath}`);

// Intercept requests for 0-byte files to prevent Range Not Satisfiable errors
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  const filePath = path.join(staticPath, req.path);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile() && stats.size === 0) {
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.mp3') contentType = 'audio/mpeg';
      else if (ext === '.wav') contentType = 'audio/wav';
      else if (ext === '.gif') contentType = 'image/gif';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', '0');
      res.writeHead(200);
      return res.end();
    }
    next();
  });
});

app.use(express.static(staticPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Express error handler to gracefully catch Range Not Satisfiable or other static file errors
app.use((err, req, res, next) => {
  if (err.status === 416 || err.name === 'RangeNotSatisfiableError' || err.code === 'RangeNotSatisfiableError') {
    if (!res.headersSent) {
      res.status(416).send('Range Not Satisfiable');
    }
    return;
  }
  console.error('[Server Error]', err);
  if (!res.headersSent) {
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[Server] Server is running at http://0.0.0.0:${port}`);
});
