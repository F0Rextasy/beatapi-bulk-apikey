#!/usr/bin/env node
'use strict';
/**
 * Interactive launcher for beatapi-bulk-apikey.
 *
 * It asks for the few things the CLI needs, remembers them in
 * `launcher.config.json` (current directory, git-ignored) and then runs
 * `src/cli.js` with those answers.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const CONFIG = path.join(process.cwd(), 'launcher.config.json');
const CLI = path.join(__dirname, 'cli.js');
const defaults = {
  count: 30,
  out: 'keys.txt',
  prefix: 'beatapi-bulk',
  delay: 16000,
  proxy: process.env.BEATAPI_PROXY || '',
  proxyFile: '',
};

function loadConfig() {
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG, 'utf8')) };
  } catch (e) {
    return { ...defaults };
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n');
  } catch (err) {
    console.error(`  ! could not write ${path.basename(CONFIG)}: ${err.message}`);
  }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question, fallback) =>
  new Promise((resolve) => {
    const shown = fallback ? ` [${String(fallback).slice(0, 30)}${String(fallback).length > 30 ? '…' : ''}]` : '';
    rl.question(`  ${question}${shown}: `, (answer) => resolve(answer.trim() || fallback || ''));
  });

function run(args) {
  console.log('');
  const child = spawnSync(process.execPath, [CLI, ...args], { cwd: process.cwd(), stdio: 'inherit' });
  if (child.status !== 0) console.log(`  ! exited with code ${child.status}`);
}

const BANNER_LOGO = String.raw`
███████╗ ██████╗ ██████╗ ███████╗██╗  ██╗████████╗ █████╗ ███████╗██╗   ██╗
██╔════╝██╔═████╗██╔══██╗██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔════╝╚██╗ ██╔╝
█████╗  ██║██╔██║██████╔╝█████╗   ╚███╔╝    ██║   ███████║███████╗ ╚████╔╝
██╔══╝  ████╔╝██║██╔══██╗██╔══╝   ██╔██╗    ██║   ██╔══██║╚════██║  ╚██╔╝
██║     ╚██████╔╝██║  ██║███████╗██╔╝ ██╗   ██║   ██║  ██║███████║   ██║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝
`;

function banner() {
  const cyan = '\x1b[36m';
  const dim = '\u001b[2m';
  const bold = '\x1b[1m';
  const reset = '\u001b[0m';
  const lines = BANNER_LOGO.replace(/^\n/, '').replace(/\n$/, '').split('\n');
  const width = Math.max(...lines.map((line) => [...line].length));
  const pad = (text) => text + ' '.repeat(width - [...text].length);
  const inner = width + 4;
  console.log('');
  console.log(cyan + '╔' + '═'.repeat(inner) + '╗' + reset);
  console.log(cyan + '║' + ' '.repeat(inner) + '║' + reset);
  for (const line of lines) console.log(cyan + '║' + reset + '  ' + bold + pad(line) + reset + '  ' + cyan + '║' + reset);
  console.log(cyan + '║' + ' '.repeat(inner) + '║' + reset);
  console.log(cyan + '║' + reset + '  ' + pad('beatapi-bulk-apikey') + '  ' + cyan + '║' + reset);
  console.log(cyan + '║' + reset + '  ' + dim + pad('mint BeatAPI keys, one fresh account per key') + reset + '  ' + cyan + '║' + reset);
  console.log(cyan + '║' + ' '.repeat(inner) + '║' + reset);
  console.log(cyan + '╚' + '═'.repeat(inner) + '╝' + reset);
  console.log('  ' + dim + 'github.com/F0Rextasy · x.com/bigbullapp' + reset);
  console.log('');
}

async function mintFlow(config) {
  config.count = parseInt(await ask('How many keys in the list', config.count), 10) || config.count;
  config.out = await ask('Key list file (one key per line)', config.out);
  config.prefix = await ask('Key name prefix', config.prefix);
  config.delay = parseInt(await ask('Pause between accounts, ms', config.delay), 10) || config.delay;
  config.proxy = await ask('Single HTTP proxy (host:port, blank = none)', config.proxy);
  config.proxyFile = await ask('Proxy list file (one per line, rotated per account)', config.proxyFile);
  saveConfig(config);
  const args = ['--count', String(config.count), '--out', config.out, '--prefix', config.prefix, '--delay', String(config.delay)];
  if (config.proxyFile && fs.existsSync(config.proxyFile)) args.push('--proxy-file', config.proxyFile);
  else if (config.proxy) args.push('--proxy', config.proxy);
  run(args);
}

async function verifyFlow(config) {
  const file = await ask('Key list to verify', config.out);
  if (!fs.existsSync(file)) {
    console.log(`  ! ${file} not found`);
    return;
  }
  const args = ['--verify-only', file];
  if (config.proxyFile && fs.existsSync(config.proxyFile)) args.push('--proxy-file', config.proxyFile);
  else if (config.proxy) args.push('--proxy', config.proxy);
  run(args);
}

async function main() {
  const config = loadConfig();
  banner();
  console.log('  1) Mint keys      — create a fresh list, one account per key');
  console.log('  2) Verify keys    — check every key in a list (GET /v1/usage)');
  console.log('  3) Settings       — show what this launcher remembers');
  console.log('  4) Help           — CLI options and notes');
  console.log('  q) Quit\n');
  const choice = (await ask('Choose', '1')).toLowerCase();
  if (choice === '1') await mintFlow(config);
  else if (choice === '2') await verifyFlow(config);
  else if (choice === '3') console.log('\n' + JSON.stringify(config, null, 2));
  else if (choice === '4') run(['--help']);
  rl.close();
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Interactive launcher: run `node src/launcher.js` and pick a menu item.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[fatal]', err.message);
  process.exit(1);
});
