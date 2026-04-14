const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

// Launch Vite
const vite = spawn('npm', ['run', 'dev', '--', '--port', '5173'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

let electronProcess = null;

// Wait a bit for Vite to spin up, then launch Electron
setTimeout(() => {
  electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_PORT: '5173'
    }
  });

  electronProcess.on('close', () => {
    vite.kill();
    process.exit();
  });
}, 3000); // 3 seconds is usually plenty of time for Vite to start

// Cleanup if the node process itself is killed
process.on('SIGINT', () => {
  if (electronProcess) electronProcess.kill();
  vite.kill();
  process.exit();
});
