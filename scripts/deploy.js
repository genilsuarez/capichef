#!/usr/bin/env node
/**
 * CapiChef — build:full
 * Build + commit + push → GitHub Actions despliega a GitHub Pages
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { colors, log, logHeader, logSuccess, logError, logWarning, logInfo } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const rootDir = dirname(dirname(__filename));

const PAGES_URL = 'https://gsphome.github.io/capichef/';
const REPO = 'gsphome/capichef';

function run(cmd, desc) {
  const start = Date.now();
  log(`🔄 ${desc}...`, colors.cyan);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: rootDir });
    const s = ((Date.now() - start) / 1000).toFixed(1);
    logSuccess(`${desc} (${s}s)`);
    return true;
  } catch {
    const s = ((Date.now() - start) / 1000).toFixed(1);
    logError(`${desc} falló (${s}s)`);
    return false;
  }
}

function runCapture(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: rootDir, stdio: 'pipe' }).trim();
  } catch {
    return '';
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForDeploy(maxMinutes = 5) {
  logInfo(`Esperando que GitHub Actions complete el deploy...`);
  const maxAttempts = maxMinutes * 4; // cada 15s

  for (let i = 1; i <= maxAttempts; i++) {
    await sleep(15000);

    const status = runCapture(
      `gh run list --repo ${REPO} --branch main --limit 1 --json status,conclusion,displayTitle --jq '.[0]'`
    );

    if (!status) {
      logWarning(`Intento ${i}/${maxAttempts}: no se pudo obtener estado`);
      continue;
    }

    let run;
    try { run = JSON.parse(status); } catch { continue; }

    const elapsed = (i * 15);
    log(`  [${elapsed}s] ${run.displayTitle} → ${run.status}${run.conclusion ? ' / ' + run.conclusion : ''}`, colors.white);

    if (run.status === 'completed') {
      if (run.conclusion === 'success') {
        logSuccess(`Deploy completado exitosamente`);
        return true;
      } else {
        logError(`Deploy terminó con: ${run.conclusion}`);
        return false;
      }
    }
  }

  logWarning(`Timeout esperando deploy (${maxMinutes} min)`);
  return false;
}

async function main() {
  const start = Date.now();
  logHeader('🦫 CapiChef — Full Build & Deploy');

  // 1. Commit previo (limpia working directory)
  const hasChanges = runCapture('git status --porcelain').length > 0;
  if (hasChanges) {
    if (!run('git add -A && git commit -m "chore: pre-build snapshot"', 'Pre-build commit')) {
      process.exit(1);
    }
  } else {
    logInfo('Working directory limpio, saltando pre-build commit');
  }

  // 2. Sync con remote
  if (!run('git pull --rebase', 'Sync con remote')) {
    process.exit(1);
  }

  // 3. Build
  if (!run('npm run build', 'Build')) {
    process.exit(1);
  }

  // 4. Commit + push (trigger GitHub Actions)
  const sha = runCapture('git rev-parse --short HEAD');
  const postMsg = `chore: deploy build ${sha}`;
  run(`git add -A && git diff --cached --quiet || git commit -m "${postMsg}"`, 'Post-build commit');

  if (!run('git push', 'Push a GitHub')) {
    process.exit(1);
  }

  // 5. Monitorear deploy
  const ghAvailable = runCapture('which gh').length > 0;
  let deployOk = false;

  if (ghAvailable) {
    deployOk = await waitForDeploy(5);
  } else {
    logWarning('gh CLI no disponible — no se puede monitorear el deploy automáticamente');
    logInfo('Instala gh CLI: https://cli.github.com/');
    deployOk = true; // asumimos que el push fue exitoso
  }

  // Resumen
  const total = ((Date.now() - start) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(50));
  if (deployOk) {
    log('✅ Deploy exitoso', colors.bright + colors.green);
  } else {
    log('⚠️  Build pusheado — verificar deploy manualmente', colors.yellow);
  }
  log(`  🔗 ${PAGES_URL}`, colors.cyan);
  log(`  📝 Commit: ${runCapture('git rev-parse --short HEAD')}`, colors.white);
  log(`  ⏱️  Tiempo total: ${total}s`, colors.white);
  console.log('='.repeat(50) + '\n');
}

main().catch(err => {
  logError('Script falló: ' + err.message);
  process.exit(1);
});
