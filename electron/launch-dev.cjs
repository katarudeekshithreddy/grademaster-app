// This script launches the Electron app in dev mode.
// It's used by the electron:dev npm script as a cross-platform launcher.
const { spawn } = require('child_process');
const path = require('path');

const electronPath = require('electron');

const proc = spawn(electronPath, ['.'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit'
});

proc.on('close', (code) => {
  process.exit(code);
});
