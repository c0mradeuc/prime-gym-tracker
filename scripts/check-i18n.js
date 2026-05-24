const fs = require('fs');
const path = require('path');
const en = require('../src/i18n/en.json');

function flat(obj, prefix = '') {
  const out = new Set();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object') for (const x of flat(v, key)) out.add(x);
    else out.add(key);
  }
  return out;
}

const keys = flat(en);
const baseKeys = new Set(
  Array.from(keys).map((k) => k.replace(/_one$|_other$|_zero$|_two$|_few$|_many$/, '')),
);
const allKeys = new Set([...keys, ...baseKeys]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(path.join(__dirname, '..', 'src'));
const missing = new Map();
const reSimple = /\bt\(\s*'([^'${}]+)'/g;
const reTpl = /\bt\(\s*`([^`${}]+)`/g;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(reSimple)) {
    const k = m[1];
    if (!allKeys.has(k)) {
      if (!missing.has(k)) missing.set(k, []);
      missing.get(k).push(f);
    }
  }
  for (const m of src.matchAll(reTpl)) {
    const k = m[1];
    if (!allKeys.has(k)) {
      if (!missing.has(k)) missing.set(k, []);
      missing.get(k).push(f);
    }
  }
}

if (missing.size === 0) {
  console.log('All static t() keys resolve.');
} else {
  console.log('Missing keys referenced in code:');
  for (const [k, srcs] of missing) {
    const refs = srcs.map((p) => p.split(path.sep).join('/')).join(', ');
    console.log('  ' + k + ' <- ' + refs);
  }
}
