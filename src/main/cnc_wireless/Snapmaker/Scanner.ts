import { createSocket, Socket } from 'dgram';
import os from 'os';
import { zipWith } from 'lodash';
import { SnapmakerDevice } from './Device';

const DISCOVER_SERVER_PORT = 20054;
const message = Buffer.from('discover');

export class SnapmakerScanner {
  private readonly socket: Socket;
  private currentScanResults: Record<string, SnapmakerDevice> = {};
  constructor() {
    this.socket = createSocket('udp4');
    this.socket.bind(() => {
      this.socket.setBroadcast(true);
    });
    this.onDeviceFound = this.onDeviceFound.bind(this);
    this.socket.on('message', this.onDeviceFound);
  }

  onDeviceFound(msg: Buffer) {
    const message = msg.toString('utf8');
    const parts = message.split('|');
    if (parts.length === 0 || parts[0].indexOf('@') === -1) {
      // Not a valid message
      return;
    }
    const [name, address] = parts[0].split('@');
    if (!this.currentScanResults[address]) {
      this.currentScanResults[address] = new SnapmakerDevice(address, name);
    }
  }

  async scan(timeoutMillis = 10000, intervalMillis = 2000) {
    this.currentScanResults = {};
    return await new Promise<Record<string, SnapmakerDevice>>((resolve) => {
      const interval = setInterval(() => {
        const ifaces = os.networkInterfaces();
        for (const key of Object.keys(ifaces)) {
          const iface = ifaces[key];
          if (iface) {
            for (const address of iface) {
              if (address.family === 'IPv4' && !address.internal) {
                const broadcastAddress = zipWith(
                  address.address.split('.').map((d) => Number(d)),
                  address.netmask.split('.').map((d) => Number(d)),
                  (p, q) => {
                    return p | (~q & 255);
                  }
                ).join('.');
                this.socket.send(
                  message,
                  DISCOVER_SERVER_PORT,
                  broadcastAddress,
                  (err, b) => {
                    if (err) {
                      console.error(err);
                    }
                  }
                );
              }
            }
          }
        }
      }, intervalMillis - 1);
      setTimeout(() => {
        clearInterval(interval);
        resolve(this.currentScanResults);
      }, timeoutMillis);
    });
  }
}
