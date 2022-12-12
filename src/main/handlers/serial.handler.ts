import { BrowserWindow, ipcMain } from 'electron';
import { SerialPort } from 'serialport';
import {
  SERIAL_COMMAND_MAP,
  SERIAL_COMMAND,
  SERIAL_PARAMS,
} from '../../shared/marlin';
import { readSerial, waitForOk, writeSerial } from '../utils/serial';

export class SerialHandler {
  private cncPort: SerialPort;
  private switchPort: SerialPort;

  constructor(private win: BrowserWindow) {
    this.onGetPorts = this.onGetPorts.bind(this);
    this.onConnectPort = this.onConnectPort.bind(this);
    this.onDisconnectPort = this.onDisconnectPort.bind(this);
    this.onSerialCommand = this.onSerialCommand.bind(this);
    this.onSwitchData = this.onSwitchData.bind(this);

    ipcMain.on('serial/getPorts', this.onGetPorts);
    ipcMain.on('serial/connectPort', this.onConnectPort);
    ipcMain.on('serial/disconnectPort', this.onDisconnectPort);
    ipcMain.on('serial/sendCommand', this.onSerialCommand);
  }

  async onGetPorts() {
    const ports = await SerialPort.list();
    this.send(
      'serial/getPorts',
      ports.map((p) => p.path)
    );
  }

  async onConnectPort(
    event: any,
    port: string,
    baud: number,
    portType: 'cnc' | 'switch'
  ) {
    let result = false;
    let err = undefined;
    if (
      (portType === 'cnc' && this.cncPort && this.cncPort.isOpen) ||
      (portType === 'switch' && this.switchPort && this.switchPort.isOpen)
    ) {
      this.send('serial/connectPort', undefined, true);
      return;
    }
    try {
      const newPort = await new Promise<SerialPort>((resolve, reject) => {
        const p = new SerialPort(
          {
            path: port,
            baudRate: baud,
          },
          (e) => {
            if (e) {
              reject(e);
            } else {
              p.setMaxListeners(0)
              resolve(p);
            }
          }
        );
      });
      switch (portType) {
        case 'cnc':
          this.cncPort = newPort;
          break;
        case 'switch':
          this.switchPort = newPort;
          this.switchPort.on('data', this.onSwitchData);
          break;
        default:
          throw new Error('Invalid portType');
      }
      result = true;
    } catch (e) {
      console.error(e);
      err = e;
      result = false;
    }

    this.send('serial/connectPort', err, result);
  }

  async onDisconnectPort(
    event: any,
    port: never,
    baud: never,
    portType: 'cnc' | 'switch'
  ) {
    const currentPort = portType === 'cnc' ? this.cncPort : this.switchPort;
    let nResult = true;
    let err = undefined;
    if (currentPort && currentPort.isOpen) {
      try {
        await new Promise<void>((resolve, reject) => {
          currentPort.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
        if (portType === 'cnc') {
          this.cncPort = undefined;
        } else {
          this.switchPort = undefined;
        }
        nResult = false;
      } catch (e) {
        err = e;
        console.error(err);
      }
    } else {
      nResult = false;
    }
    this.send('serial/disconnectPort', err, nResult);
  }

  async onSerialCommand(
    event: any,
    cmd: SERIAL_COMMAND,
    params: SERIAL_PARAMS
  ) {
    console.log(cmd, params)
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
          const result = await writeSerial(this.cncPort, `${c} ${paramString}`);
        } else {
          // no params
          const result = await writeSerial(this.cncPort, c.replace(/\0/g, ''));
        }
      })
    );
    if (cmd === SERIAL_COMMAND.HOME) {
      await waitForOk(this.cncPort)
    }
    const result = await readSerial(this.cncPort);
    this.send('serial/sendCommand', undefined, result);
  }

  closeAll() {
    [this.cncPort, this.switchPort].forEach(port => {
      try {
        port.close()
      } catch { /* empty */ }
    })
  }

  private onSwitchData() {
    return this.send('serial/switchTrigger');
  }

  private send(channel: string, ...args: any[]) {
    return this.win.webContents.send(channel, ...args);
  }
}
