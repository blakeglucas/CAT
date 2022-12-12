import { BrowserWindow, ipcMain } from 'electron';
import { contourGCode } from '../contourGCode';

ipcMain.on(
  'gcode/contour',
  async (_, raw: string, zDepth: number, heightMap: number[][]) => {
    const result = await contourGCode(raw, zDepth, heightMap);
    console.log(result);
    BrowserWindow.getFocusedWindow().webContents.send('gcode/contour', result);
  }
);
