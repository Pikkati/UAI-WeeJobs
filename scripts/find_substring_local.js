const fs = require('fs');
const p = 'd:/MyProjectsUAI/weejobs/android/app/src/main/assets/index.android.bundle';
if (!fs.existsSync(p)) { console.log('MISSING', p); process.exit(0); }
const s = fs.readFileSync(p, 'utf8');
console.log('INDEX_LOCAL:', s.indexOf('[expo-router] getDirectoryTree: using fallback manifest'));
