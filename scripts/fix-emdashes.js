const fs = require('fs');
const path = require('path');

const root = 'c:\\Users\\TECNO PC\\Desktop\\Pulse';

const files = [
  'src/app/compare/[pair]/page.tsx',
  'src/app/compare/data/pairs.ts',
  'src/app/top-sites/[country]/page.tsx',
  'src/app/top-sites/data/countries.ts',
];

// Replacements: [pattern, replacement]
// Order matters - most specific first
const replacements = [
  // Page titles: "X - Pulse" => "X | Pulse"
  [/ - Pulse/g, ' | Pulse'],
  // JSON-LD description: "site.name - site.baseline" => "site.name: site.baseline"
  [/\$\{site\.name\} - \$\{site\.baseline\}/g, '${site.name}: ${site.baseline}'],
  // All remaining em-dashes in prose (between spaces) => comma+space
  [/ - /g, ', '],
];

for (const rel of files) {
  const fullPath = path.join(root, rel);
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${rel}`);
  } else {
    console.log(`No changes: ${rel}`);
  }
}

console.log('Done.');
