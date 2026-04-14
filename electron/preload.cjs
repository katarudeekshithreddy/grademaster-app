// Preload script — runs in a sandboxed context before the renderer
// Exposes only safe, controlled APIs to the React renderer
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDesktop: true
});
