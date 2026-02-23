import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'node:fs';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

const distDir = path.join(__dirname, 'dist');
// If deployed as a repo root with build output in ./dist
const serveDir = existsSync(path.join(distDir, 'index.html')) ? distDir : __dirname;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Serve static files
app.use(express.static(serveDir));

// Handle client-side routing - send all requests to index.html
app.get('*', limiter, (req, res) => {
  res.sendFile(path.join(serveDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Skills Ready server is running on port ${PORT}`);
  console.log(`Serving files from: ${serveDir}`);
});
