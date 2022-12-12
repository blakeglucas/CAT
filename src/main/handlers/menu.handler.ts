import { ipcMain, dialog } from 'electron';
import * as fs from 'fs/promises';

export function newProject(
  _: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow
) {
  browserWindow.webContents.send('menu/newProject');
}

export function saveProject(
  _: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow
) {
  browserWindow.webContents.send('menu/saveProject');
}

export function saveProjectAs(
  _: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow
) {
  browserWindow.webContents.send('menu/saveProject');
}

export async function openHeightMap(
  _: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow
) {
  const openResult = await dialog.showOpenDialog(browserWindow, {
    title: 'Open Height Map',
    filters: [
      { name: 'Height Map Files', extensions: ['json', 'map', 'hmap'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });
  if (!openResult.canceled && openResult.filePaths.length > 0) {
    const fileContent = await fs.readFile(openResult.filePaths[0]);
    const heightMap = JSON.parse(fileContent.toString());
    browserWindow.webContents.send('menu/openHeightMap', heightMap);
  }
}

export function openRawGCode(
  _: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow
) {
  browserWindow.webContents.send('menu/openGCode');
}

export async function saveHeightMap(
  _: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow
) {
  const heightMap = await new Promise((resolve) => {
    ipcMain.once('menu/saveHeightMap', (_, heightMap) => {
      resolve(heightMap);
    });
    browserWindow.webContents.send('menu/saveHeightMap');
  });
  const saveResult = await dialog.showSaveDialog(browserWindow, {
    title: 'Save Height Map As',
    filters: [
      { name: 'Height Map Files', extensions: ['json', 'map', 'hmap'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['showOverwriteConfirmation'],
  });
  if (!saveResult.canceled && saveResult.filePath) {
    fs.writeFile(saveResult.filePath, JSON.stringify(heightMap));
  }
}

export function saveCGCode(
  _: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow
) {
  browserWindow.webContents.send('menu/saveGCode');
}
