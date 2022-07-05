import { ipcRenderer } from 'electron';

export abstract class IPCRendererBase {
  protected readonly ipcRenderer: typeof ipcRenderer;
  constructor() {
    this.ipcRenderer = window.require('electron').ipcRenderer;
  }
}
