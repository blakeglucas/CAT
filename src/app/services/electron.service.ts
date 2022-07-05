import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { HeightMapService } from './height-map.service';
import { GcodeService } from './gcode.service';
import { SerialService } from './serial.service';
import type { PortInfo } from '@serialport/bindings-interface';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;

  windowTitle = 'CNC Auto-Leveling Tool';

  constructor(
    private heightMapService: HeightMapService,
    private gCodeService: GcodeService,
    private serialService: SerialService
  ) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      this.ipcRenderer.on('file:open_height_map', (event, fileContents) => {
        this.heightMapService.processHeightMapFile(fileContents);
      });

      this.ipcRenderer.on(
        'file:open_raw_gcode',
        (event, fileContents, filePath) => {
          this.gCodeService.setRawGCode(fileContents, filePath);
        }
      );

      this.ipcRenderer.on(
        'file:open_contoured_gcode',
        (event, fileContents, filePath) => {
          this.gCodeService.setCGCode(fileContents, filePath);
        }
      );

      // TODO Refactor to SerialService via ipcRenderer directly
      this.ipcRenderer.on('serial:list_ports', (event, ports: PortInfo[]) => {
        this.serialService.availablePorts = ports;
      });

      this.ipcRenderer.on('web:title', (event, newTitle) => {
        this.windowTitle = newTitle;
      });

      this.getAvailableSerialPorts();

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  // TODO Refactor to SerialService via ipcRenderer directly
  getAvailableSerialPorts() {
    this.ipcRenderer.send('serial:list_ports');
  }
}
