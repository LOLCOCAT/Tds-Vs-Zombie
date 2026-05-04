import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const existingFiles = new Set();

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      existingFiles.add(fullPath.replace(publicDir, '').replace(/\\/g, '/'));
    }
  });
}
walk(publicDir);

const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
// match things like /Units/... or /Enemys/... or /map/...
const pathRegex = /['"](\/(Units|Enemys|map)\/[^'"]+)['"]/g;
let match;
const missing = [];
const caseMismatch = [];

while ((match = pathRegex.exec(appContent)) !== null) {
  const p = match[1];
  if (p.includes('${')) continue; // Skip dynamic templates for now
  
  if (!existingFiles.has(p)) {
    const lowerP = p.toLowerCase();
    const found = [...existingFiles].find(f => f.toLowerCase() === lowerP);
    if (found) {
      caseMismatch.push({ code: p, fs: found });
    } else {
      missing.push(p);
    }
  }
}

console.log('--- MISSING ASSETS ---');
console.log([...new Set(missing)].join('\n'));
console.log('\n--- CASE MISMATCHES ---');
caseMismatch.forEach(m => console.log(`Code: ${m.code} -> FS: ${m.fs}`));
