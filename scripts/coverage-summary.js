const fs = require('fs');
const path = require('path');
const covPath = path.join(process.cwd(), 'coverage', 'coverage-final.json');
if (!fs.existsSync(covPath)) {
  console.error('coverage-final.json not found at', covPath);
  process.exit(1);
}
const cov = JSON.parse(fs.readFileSync(covPath, 'utf8'));
const files = Object.entries(cov).map(([k, v]) => {
  const file = v.path || k;
  const totalStatements = Object.keys(v.s || {}).length;
  const coveredStatements = Object.values(v.s || {}).filter(n => n > 0).length;
  const totalFunctions = Object.keys(v.f || {}).length;
  const coveredFunctions = Object.values(v.f || {}).filter(n => n > 0).length;
  const percentStatements = totalStatements === 0 ? 100 : Math.round((coveredStatements / totalStatements) * 10000) / 100;
  const uncovered = totalStatements - coveredStatements;
  return { file, totalStatements, coveredStatements, uncovered, percentStatements, totalFunctions, coveredFunctions };
});
files.sort((a, b) => b.uncovered - a.uncovered || a.percentStatements - b.percentStatements);
console.log('Top 30 files by uncovered statements:');
console.log('  Pct | uncovered/total | funcs cov | file');
files.slice(0, 30).forEach(f => {
  const rel = f.file.replace(process.cwd() + path.sep, '');
  console.log(`${String(f.percentStatements).padStart(5)}% | ${String(f.uncovered).padStart(3)}/${String(f.totalStatements).padStart(3)} | ${String(f.coveredFunctions).padStart(3)}/${String(f.totalFunctions).padStart(3)} | ${rel}`);
});
console.log('\nTop app/ files (same ordering):');
const appFiles = files.filter(f => f.file.includes(path.sep + 'app' + path.sep));
appFiles.slice(0, 30).forEach(f => {
  const rel = f.file.replace(process.cwd() + path.sep, '');
  console.log(`${String(f.percentStatements).padStart(5)}% | ${String(f.uncovered).padStart(3)}/${String(f.totalStatements).padStart(3)} | ${String(f.coveredFunctions).padStart(3)}/${String(f.totalFunctions).padStart(3)} | ${rel}`);
});
const totals = files.reduce((acc, f) => { acc.total += f.totalStatements; acc.covered += f.coveredStatements; acc.funcTotal += f.totalFunctions; acc.funcCovered += f.coveredFunctions; return acc; }, { total: 0, covered: 0, funcTotal: 0, funcCovered: 0 });
const totalPct = totals.total === 0 ? 100 : Math.round((totals.covered / totals.total) * 10000) / 100;
const funcPct = totals.funcTotal === 0 ? 100 : Math.round((totals.funcCovered / totals.funcTotal) * 10000) / 100;
console.log(`\nGlobal statement coverage: ${totalPct}% (${totals.covered}/${totals.total})`);
console.log(`Global function coverage: ${funcPct}% (${totals.funcCovered}/${totals.funcTotal})`);
