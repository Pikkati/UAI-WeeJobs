const fs = require('fs');
const p = 'd:/MyProjectsUAI/weejobs/android/local.properties';
try {
  const buf = fs.readFileSync(p);
  console.log('bytes:', buf.slice(0,80).toJSON().data.join(' '));
  console.log('asString:', JSON.stringify(buf.toString('utf8')));
  const codes = Array.from(buf.toString('utf8')).map(c => c.charCodeAt(0));
  console.log('charCodes:', codes.slice(0,80).join(' '));
} catch (e) {
  console.error('ERR', e && e.message);
  process.exit(1);
}
