import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = __dirname;
const destDir = path.join(__dirname, 'dist');

console.log('[Build] Starting build process...');

// Ensure dist directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Function to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Read all files in root and copy to dist
const entries = fs.readdirSync(srcDir, { withFileTypes: true });
for (let entry of entries) {
  const name = entry.name;
  if (name === 'dist' || name === 'node_modules' || name === '.git' || name === 'package-lock.json') {
    continue;
  }
  const srcPath = path.join(srcDir, name);
  const destPath = path.join(destDir, name);

  if (entry.isDirectory()) {
    copyDir(srcPath, destPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}

console.log('[Build] Build complete: All files successfully copied to dist/');
