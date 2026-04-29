
import fs from 'fs';
import path from 'path';

const appPath = './src/App.tsx';
const publicDir = './public';

const content = fs.readFileSync(appPath, 'utf-8');

// Match paths starting with /Units, /Enemys, /map
const regex = /['"]\/(Units|Enemys|map)\/[^'"]+['"]/g;
const matches = content.match(regex) || [];

console.log(`Found ${matches.length} asset references.`);

const missing = [];
const checked = new Set();

for (const match of matches) {
    const rawPath = match.substring(1, match.length - 1); // remove quotes
    if (checked.has(rawPath)) continue;
    checked.add(rawPath);

    // Skip paths with template interpolation for now
    if (rawPath.includes('${')) {
        console.log(`Skipping dynamic path: ${rawPath}`);
        continue;
    }

    const fullPath = path.join(process.cwd(), 'public', rawPath.replace(/^\/(Units|Enemys|map)/, '$1'));
    
    // Careful: rawPath already starts with /, and path.join might handle it differently.
    // Let's do it manually to be safe.
    const fsPath = path.join(process.cwd(), 'public', rawPath);

    if (!fs.existsSync(fsPath)) {
        missing.push(rawPath);
    }
}

if (missing.length > 0) {
    console.log('\nMISSING ASSETS:');
    missing.forEach(m => console.log(m));
} else {
    console.log('\nAll static assets found!');
}

// Check some common dynamic patterns
const dynamicPatterns = [
    '/Enemys/Normal/NormalAnim',
    '/Enemys/Slow/SlowAnim',
    '/Enemys/Speedy/SpeedyAnim',
];

console.log('\nChecking dynamic patterns:');
for (const pattern of dynamicPatterns) {
    let found = false;
    for (let i = 1; i <= 3; i++) {
        const p = `${pattern}${i}.webp`;
        if (fs.existsSync(path.join(process.cwd(), 'public', p))) {
            console.log(`[OK] ${p}`);
            found = true;
        }
    }
    if (!found) console.log(`[!!] No files found for pattern ${pattern}`);
}
