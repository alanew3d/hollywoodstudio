/**
 * hsai_check.cjs — Syntax-checks all non-LD+JSON inline <script> blocks in index.html.
 * Usage: node hsai_check.cjs
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const htmlFile = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlFile, 'utf8');

// Match <script ...>...</script> blocks, skip type="application/ld+json"
const scriptRe = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let blockIndex = 0;
let errors = 0;

while ((match = scriptRe.exec(html)) !== null) {
  const attrs = match[1] || '';
  const code = match[2] || '';

  // Skip LD+JSON and empty
  if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) continue;
  if (/src\s*=/i.test(attrs)) continue; // external src, no inline code
  if (!code.trim()) continue;

  blockIndex++;
  const tmpFile = path.join(os.tmpdir(), `hsai_block_${blockIndex}.js`);
  fs.writeFileSync(tmpFile, code, 'utf8');

  try {
    execSync(`node --check "${tmpFile}"`, { stdio: 'pipe' });
  } catch (e) {
    const errMsg = (e.stderr || e.stdout || '').toString().replace(tmpFile, `index.html block #${blockIndex}`);
    console.error(`SYNTAX ERROR in block #${blockIndex}:\n${errMsg}`);
    errors++;
  }

  fs.unlinkSync(tmpFile);
}

if (errors === 0) {
  console.log(`✅ All ${blockIndex} inline script block(s) passed syntax check.`);
  process.exit(0);
} else {
  console.error(`❌ ${errors} block(s) failed syntax check.`);
  process.exit(1);
}
