import { SerialPort, SerialPortOpenOptions } from 'serialport';

export type SendFunction = (channel: string, ...args: any[]) => void;

export class Switch {
  private readonly eventTag = 'serial:switch_trigger';
  private serialPort: SerialPort;
  private readonly send: SendFunction;

  constructor(
    private portOptions: SerialPortOpenOptions<any>,
    send: SendFunction
  ) {
    // No bind to retain sendfn's original context
    this.send = send;

    this.errorHandler = this.errorHandler.bind(this);
    this.dataHandler = this.dataHandler.bind(this);
  }

  get isOpen() {
    return this.serialPort && this.serialPort.isOpen;
  }

  get serialOptions() {
    return this.portOptions;
  }

  async init() {
    this.serialPort = await new Promise<SerialPort>((resolve, reject) => {
      const a = new SerialPort(this.portOptions, (err) => {
        if (err) {
          // console.error(err);
          reject(err);
        } else {
          resolve(a);
        }
      });
    });
    this.serialPort.setMaxListeners(0);
    this.serialPort.on('error', this.errorHandler);
    this.serialPort.on('data', this.dataHandler);
  }

  errorHandler(err: any, err2: any) {
    console.error(err, err2);
  }

  dataHandler(data: Buffer) {
    this.send(this.eventTag, data.toString());
  }

  async close() {
    if (this.isOpen) {
      await new Promise<void>((resolve, reject) => {
        this.serialPort.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }
}
