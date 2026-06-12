// Syntax-check all non-JSON inline <script> blocks in index.html
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
// match all <script ...> blocks that are NOT application/ld+json or application/json
const RE = /<script(?![^>]*type\s*=\s*["']application\/(ld\+json|json)["'])[^>]*>([\s\S]*?)<\/script>/gi;
let m, i = 0, errors = 0;
while ((m = RE.exec(html)) !== null) {
  i++;
  const code = m[2];
  if (!code.trim()) continue;
  try {
    new vm.Script(code);
  } catch (e) {
    console.error(`Block #${i}: ${e.message}`);
    errors++;
  }
}
console.log(`Checked ${i} script blocks. Errors: ${errors}`);
process.exit(errors > 0 ? 1 : 0);
