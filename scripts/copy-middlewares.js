// scripts/copy-middlewares.js
// Copy src/middlewares -> dist/middlewares if the source directory exists.
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src', 'middlewares');
const distDir = path.join(root, 'dist', 'middlewares');

try {
  if (fs.existsSync(srcDir)) {
    fse.ensureDirSync(distDir);
    fse.copySync(srcDir, distDir, { overwrite: true });
    console.log(`Copied middlewares from ${srcDir} to ${distDir}`);
  } else {
    console.log(`No source middlewares to copy (${srcDir} does not exist)`);
  }
} catch (err) {
  console.error('Failed to copy middlewares:', err);
  process.exit(1);
}
