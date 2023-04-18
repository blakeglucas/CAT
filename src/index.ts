import {
  app,
  BrowserWindow,
  screen,
  Menu,
  MenuItemConstructorOptions,
} from 'electron';
import * as path from 'path';
import { SerialHandler } from './main/handlers/serial.handler';
import {
  setupTitlebar,
  attachTitlebarToWindow,
  // eslint-disable-next-line import/no-unresolved
} from 'custom-electron-titlebar/main';
import * as MenuHandler from './main/handlers/menu.handler';
import './main/handlers/gcode.handler';
import { SnapmakerScanner } from './main/cnc_wireless/Snapmaker';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

new SnapmakerScanner().scan().then(console.log);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

setupTitlebar();

let serialHandler: SerialHandler | undefined;

const createWindow = (): void => {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, '../assets/icons/CATlogo.png'),
    x: 0,
    y: 0,
    height: size.height,
    width: size.width,
    darkTheme: true,
    transparent: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false,
    },
    title: 'CNC Auto-Leveling Tool',
    // frame: false,
    titleBarStyle: 'hidden',
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.maximize();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  attachTitlebarToWindow(mainWindow);

  serialHandler = new SerialHandler(mainWindow);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  serialHandler.closeAll();
  serialHandler = undefined;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const template: MenuItemConstructorOptions[] = [
  {
    role: 'fileMenu',
    label: 'File',
    submenu: [
      {
        label: 'New Project',
        accelerator: 'CmdOrCtrl+N',
        click: MenuHandler.newProject,
      },
      {
        type: 'separator',
      },
      {
        label: 'Open Height Map',
        accelerator: 'CmdOrCtrl+H',
        click: MenuHandler.openHeightMap,
      },
      {
        label: 'Open Raw G-Code',
        accelerator: 'CmdOrCtrl+G',
        click: MenuHandler.openRawGCode,
      },
      {
        type: 'separator',
      },
      {
        label: 'Save Project',
        accelerator: 'CmdOrCtrl+S',
        click: MenuHandler.saveProject,
      },
      {
        label: 'Save Project As...',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: MenuHandler.saveProjectAs,
      },
      {
        type: 'separator',
      },
      {
        id: 'save-current-height-map',
        label: 'Save Current Height Map',
        accelerator: 'CmdOrCtrl+Shift+H',
        click: MenuHandler.saveHeightMap,
      },
      {
        id: 'save-contoured-gcode',
        label: 'Save Contoured G-Code',
        accelerator: 'CmdOrCtrl+Shift+G',
        click: MenuHandler.saveCGCode,
      },
      {
        type: 'separator',
      },
      {
        role: 'quit',
      },
    ],
  },
  {
    role: 'editMenu',
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
    ],
  },
  {
    role: 'viewMenu',
    label: 'View',
    submenu: [
      {
        role: 'reload',
      },
      {
        role: 'toggleDevTools',
      },
      {
        type: 'separator',
      },
      {
        role: 'resetZoom',
        label: 'Reset Zoom',
      },
      {
        role: 'zoomIn',
      },
      {
        role: 'zoomOut',
      },
      {
        type: 'separator',
      },
      {
        role: 'togglefullscreen',
      },
    ].slice(
      process.env.NODE_ENV === 'production' ? 2 : 0
    ) as MenuItemConstructorOptions[],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
      },
    ],
  },
];
