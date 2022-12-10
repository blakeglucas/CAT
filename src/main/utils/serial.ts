import { ReadlineParser, SerialPort } from 'serialport';

export async function writeSerial(port: SerialPort, x: any) {
  return await new Promise<void>((resolve, reject) => {
    if (!port) {
      reject('Serial port is not open or initialized')
    }
    port.write(x + '\n', (err) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        port.drain((err) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

export async function readSerial(port: SerialPort) {
  return await new Promise<any>((resolve, reject) => {
    const lineParser = new ReadlineParser({ delimiter: '\n' });
    lineParser.setMaxListeners(0);
    lineParser.once('data', (line) => {
      resolve(line);
    });
    lineParser.once('error', (err) => {
      reject(err);
    });
    port.pipe(lineParser);
  });
}

export async function waitForOk(port: SerialPort) {
  const result = await readSerial(port);
  return (result as string).trim() === 'ok';
}
