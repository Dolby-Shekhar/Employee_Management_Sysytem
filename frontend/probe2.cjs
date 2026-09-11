const fs = require('fs');
const txt = fs.readFileSync('src/components/Layout.tsx', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
  for (let j = 0; j < l.length; j++) {
    if (l[j] === '`') console.log(`backtick at line ${i + 1}, col ${j + 1}`);
  }
});
