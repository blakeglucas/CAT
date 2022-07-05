import { ipcRenderer } from 'electron';
import { Injectable } from '@angular/core';
import { PortInfo } from '@serialport/bindings-interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { SerialPort } from 'serialport';
import {
  ISerialService,
  SERIAL_COMMAND,
  SERIAL_PARAMS,
} from '../interfaces/SerialService.interface';
import { ElectronService } from './electron.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class MockSerialService implements ISerialService {
  private readonly _availablePorts = new BehaviorSubject<Partial<PortInfo>[]>([
    {
      path: 'COM3',
    },
    {
      path: 'COM10',
    },
  ]);
  readonly availablePorts$ = this._availablePorts.asObservable();

  private readonly _activeCommand = new BehaviorSubject<
    SERIAL_COMMAND | undefined
  >(undefined);
  readonly activeCommand$ = this._activeCommand.asObservable();

  cncPort: string | undefined;
  switchPort: string | undefined;

  private readonly ipcRenderer: typeof ipcRenderer;

  constructor(private n: NotificationService) {
    console.debug('USING MOCK SERIAL SERVICE');
    this.ipcRenderer = window.require('electron').ipcRenderer;
  }

  set availablePorts(ports: PortInfo[]) {
    // this._availablePorts.next(ports)
  }

  async setCNCPort(portPath: string, baud: number): Promise<void> {}

  async setSwitchPort(portPath: string, baud: number): Promise<void> {}

  async sendCommand(cmd: SERIAL_COMMAND, params?: SERIAL_PARAMS) {
    this._activeCommand.next(cmd);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, Math.random() * 8000);
    });
    this._activeCommand.next(undefined);
  }
}
