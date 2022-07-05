import { app, BrowserWindow, screen, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { SerialPort } from 'serialport';
import { ReadlineParser } from 'serialport';
import {
  SERIAL_COMMAND_MAP,
  UI_SERIAL_COMMAND,
  UI_SERIAL_PARAMS,
} from './marlin';
import { writeSerial, readSerial } from './serial';
import { SwitchPort } from './SwitchPort';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some((val) => val === '--serve');

function createWindow(): BrowserWindow {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    icon: path.join(__dirname, '../src/assets/icons/CATlogo.png'),
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false,
      contextIsolation: false, // false if you want to run e2e test with Spectron,
      devTools: serve ? true : false,
    },
    darkTheme: true,
    frame: false,
    transparent: false,
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(
      url.format({
        pathname: path.join(__dirname, pathIndex),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  win.setTitle('CNC Auto-Leveling Tool')

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

function errorHandler(err: Error) {
  if (win) {
    win.webContents.send('error:process', err);
  } else {
    throw err;
  }
}

ipcMain.setMaxListeners(0);
process.setMaxListeners(0);
process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', errorHandler);
ipcMain.on('unhandledRejection', (evt, err) => {
  console.log('ipcuhr', evt, err);
});

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('minimize', () => {
    if (win) {
      win.blur();
      win.minimize();
    }
  });

  ipcMain.on('menubar:ismaximized', () => {
    if (win) {
      win.webContents.send('menubar:ismaximized', win.isMaximized());
    }
  });

  ipcMain.on('maximize', () => {
    if (win) {
      win.maximize();
      win.webContents.send('menubar:ismaximized', true);
    }
  });

  ipcMain.on('unmaximize', () => {
    if (win) {
      win.unmaximize();
      win.webContents.send('menubar:ismaximized', false);
    }
  });

  ipcMain.on('close', () => {
    if (win) {
      win.close();
    }
  });

  ipcMain.on('file:open_height_map', async () => {
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        title: 'Open Height Map',
        properties: ['openFile'],
        filters: [
          { name: 'Height Map Files', extensions: ['json', 'map', 'hmap'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const contents = await fs.promises.readFile(result.filePaths[0]);
        win.webContents.send('file:open_height_map', contents.toString());
      }
    }
  });

  ipcMain.on('file:open_raw_gcode', async () => {
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        title: 'Open Raw G-Code',
        properties: ['openFile'],
        filters: [
          { name: 'G-Code Files', extensions: ['gcode', 'cnc', 'nc'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const contents = await fs.promises.readFile(result.filePaths[0]);
        win.webContents.send(
          'file:open_raw_gcode',
          contents.toString(),
          result.filePaths[0]
        );
      }
    }
  });

  ipcMain.on('file:open_contoured_gcode', async () => {
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        title: 'Open Contoured G-Code',
        properties: ['openFile'],
        filters: [
          {
            name: 'G-Code Files',
            extensions: ['cgcode', 'gcode', 'cnc', 'nc'],
          },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const contents = await fs.promises.readFile(result.filePaths[0]);
        win.webContents.send(
          'file:open_contoured_gcode',
          contents.toString(),
          result.filePaths[0]
        );
      }
    }
  });

  ipcMain.on('file:open_project', async () => {
    if (win) {
      const result = await dialog.showOpenDialog(win, {
        title: 'Open Project',
        properties: ['openFile'],
        filters: [
          {
            name: 'Project Files',
            extensions: ['catproj', 'chmproj', 'cnclevelproj'],
          },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const contents = await fs.promises.readFile(result.filePaths[0]);
        win.webContents.send(
          'file:open_project',
          contents.toString(),
          result.filePaths[0]
        );
        const newTitle = `CNC Auto-Leveling Tool - ${result.filePaths[0]}`;
        win.webContents.send('web:title', newTitle);
        win.setTitle(newTitle);
      }
    }
  });

  ipcMain.on('file:save_project', async (event, projectContents, filePath) => {
    await fs.promises.writeFile(filePath, projectContents);
  });

  ipcMain.on('file:save_project_as', async (event, projectContents) => {
    if (win) {
      const result = await dialog.showSaveDialog(win, {
        title: 'Save Project As',
        filters: [
          {
            name: 'Project Files',
            extensions: ['catproj', 'chmproj', 'cnclevelproj'],
          },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const fpath = result.filePath;
        await fs.promises.writeFile(fpath, projectContents);
        win.webContents.send('file:save_project_as', fpath);
        const newTitle = `CNC Auto-Leveling Tool - ${fpath}`;
        win.webContents.send('web:title', newTitle);
        win.setTitle(newTitle);
      }
    }
  });

  ipcMain.on('file:save_height_map', async (event, mapString) => {
    if (win) {
      const result = await dialog.showSaveDialog(win, {
        title: 'Save Current Height Map',
        filters: [
          { name: 'Height Map Files', extensions: ['json', 'map', 'hmap'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });
      if (!result.canceled) {
        const fpath = result.filePath;
        await fs.promises.writeFile(fpath, mapString);
      }
    }
  });

  ipcMain.on('file:save_cgcode', async (event, gcode) => {
    if (win) {
      const result = await dialog.showSaveDialog(win, {
        title: 'Save Contoured G-Code',
        filters: [
          { name: 'Contoured G-Code File', extensions: ['cgcode'] },
          {
            name: 'G-Code File',
            extensions: ['gcode'],
          },
          {
            name: 'CNC File',
            extensions: ['cnc'],
          },
          {
            name: 'Laser Engraving File',
            extensions: ['nc'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
      });
      if (!result.canceled) {
        const fpath = result.filePath;
        await fs.promises.writeFile(fpath, gcode);
      }
    }
  });

  let cncPort: SerialPort | undefined;
  let switchPort: SwitchPort | undefined;

  ipcMain.on('serial:list_ports', async () => {
    const ports = await SerialPort.list();
    if (win) {
      win.webContents.send('serial:list_ports', ports);
    }
  });

  ipcMain.on(
    'serial:set_cnc_port',
    async (event, path: string, baud: number) => {
      try {
        if (cncPort && cncPort.isOpen) {
          await new Promise<void>((resolve, reject) => {
            cncPort.close((err) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                resolve();
              }
            });
          });
        }
        await new Promise<void>((resolve, reject) => {
          cncPort = new SerialPort(
            {
              path,
              baudRate: baud,
            },
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
        cncPort.setMaxListeners(0);
        win.webContents.send('serial:set_cnc_port');
      } catch (e) {
        win.webContents.send('serial:set_cnc_port', e.toString());
      }
    }
  );

  ipcMain.on(
    'serial:set_switch_port',
    async (event, path: string, baud: number) => {
      if (switchPort && switchPort.isOpen) {
        await switchPort.close();
      }
      switchPort = new SwitchPort(
        {
          path,
          baudRate: baud,
        },
        win.webContents.send.bind(win.webContents)
      );
      try {
        await switchPort.init();
        win.webContents.send('serial:set_switch_port');
      } catch (e) {
        win.webContents.send('serial:set_switch_port', e.toString());
      }
    }
  );

  ipcMain.on(
    'serial:command',
    async (event, cmd: UI_SERIAL_COMMAND, params: UI_SERIAL_PARAMS) => {
      const c = SERIAL_COMMAND_MAP[cmd];
      if (!c) {
        throw new Error('Invalid serial command');
      }
      const cmds = Array.isArray(c) ? c : [c];
      await Promise.all(
        cmds.map(async (c) => {
          if (!c.endsWith('\0')) {
            // Params
            const givenParams = Object.entries(params).filter(
              (x) => x !== undefined && x !== null
            );
            const paramString = givenParams
              .map(
                (paramPair) =>
                  `${paramPair[0].toUpperCase()}${paramPair[1].toFixed(8)}`
              )
              .join(' ');
            const result = await writeSerial(cncPort, `${c} ${paramString}`);
            // win.webContents.send('serial:command', undefined, result)
          } else {
            // no params
            const result = await writeSerial(cncPort, c.replace(/\0/g, ''));
            // win.webContents.send('serial:command', undefined, result)
          }
        })
      );
      const result = await readSerial(cncPort);
      win.webContents.send('serial:command', undefined, result);
    }
  );

  ipcMain.on('licenses', async () => {
    const data = await fs.promises.readFile(
      path.join(__dirname, './licenses.json')
    );
    win.webContents.send('licenses', data.toString());
  });
} catch (e) {
  // Catch Error
  // throw e;
}
