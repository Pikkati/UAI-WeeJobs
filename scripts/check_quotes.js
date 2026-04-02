const fs = require('fs');
const p = process.argv[2] || 'd:/MyProjectsUAI/weejobs/android/tmp_pulled_base_extracted_round2/assets/index.android.bundle';
const s = fs.readFileSync(p,'utf8');
function countUnescaped(ch) {
  let c = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === ch && s[i - 1] !== '\\') c++;
  }
  return c;
}
console.log('path', p);
console.log('backticks', countUnescaped('`'));
console.log('singleQuotes', countUnescaped("'"));
console.log('doubleQuotes', countUnescaped('"'));
