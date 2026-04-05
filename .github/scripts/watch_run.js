const { execSync } = require('child_process');
const runId = process.argv[2];
const repo = process.argv[3] || 'getnudged/weejobs';
(async function () {
  while (true) {
    try {
      const out = execSync(
        `gh run view ${runId} --repo ${repo} --json conclusion,status,url`,
        { encoding: 'utf8' },
      );
      const obj = JSON.parse(out);
      console.log(
        `status=${obj.status} conclusion=${obj.conclusion} url=${obj.url}`,
      );
      if (obj.conclusion && obj.conclusion !== '') {
        console.log('FINAL OUTPUT:\n', out);
        break;
      }
    } catch (err) {
      console.error('error:', err.message);
    }
    await new Promise((r) => setTimeout(r, 10000));
  }
})();
