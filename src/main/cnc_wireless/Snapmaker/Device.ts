import { sleepAsync } from '../../utils/sleepAsync';
import { WirelessCNCDevice } from '../../../shared/interfaces/WirelessCNC';
import TokenManager, { SnapmakerToken } from './TokenManager';
import fetch from 'node-fetch';

export enum SnapmakerDeviceStatus {
  DISCONNECTED = 0,
  PENDING = 204,
  CONNECTED = 200,
  REJECTED = 401,
  EXPIRED = 403,
}

export class SnapmakerDevice
  implements WirelessCNCDevice<SnapmakerDeviceStatus>
{
  status = SnapmakerDeviceStatus.DISCONNECTED;
  private currentToken: SnapmakerToken | null = null;
  private connectivityWatcherInterval: NodeJS.Timeout;

  constructor(private readonly ipAddress: string, readonly name: string) {}

  async connect(): Promise<SnapmakerDeviceStatus> {
    if (this.connectivityWatcherInterval) {
      clearInterval(this.connectivityWatcherInterval);
    }
    this.currentToken = TokenManager.getSavedToken();
    let reqPath = `http://${
      this.ipAddress
    }:8080/api/v1/connect?_=${Date.now()}`;
    if (this.currentToken !== null) {
      reqPath += `&token=${this.currentToken.guid}`;
    }
    const response = await fetch(reqPath, { method: 'POST' });
    if (response.ok) {
      // TODO type
      const payload: any = await response.json();
      const newTokenGuid: string = payload.token;
      if (!newTokenGuid) {
        throw new Error('bad token');
      }
      if (newTokenGuid !== this.currentToken?.guid) {
        this.currentToken = await TokenManager.saveToken(newTokenGuid);
      }
      this.status = SnapmakerDeviceStatus.PENDING;
      while (this.status === SnapmakerDeviceStatus.PENDING) {
        this.status = await this.checkStatus();
        await sleepAsync(500);
      }
      if (this.status === SnapmakerDeviceStatus.CONNECTED) {
        this.connectivityWatcher();
      }
      return this.status;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectivityWatcherInterval) {
      clearInterval(this.connectivityWatcherInterval);
    }
    if (this.status !== SnapmakerDeviceStatus.CONNECTED) {
      return;
    }
    const response = await fetch(
      `http://${this.ipAddress}:8080/api/v1/disconnect?_=${Date.now()}&token=${
        this.currentToken.guid
      }`,
      { method: 'POST' }
    );
    if (!response.ok) {
      throw new Error('bad disconnect response');
    }
  }

  private async connectivityWatcher() {
    this.connectivityWatcherInterval = setInterval(() => {
      async () => {
        this.status = await this.checkStatus();
        if (this.status !== SnapmakerDeviceStatus.CONNECTED) {
          // TODO
          clearInterval(this.connectivityWatcherInterval);
        }
      };
    }, 10000);
  }

  private async checkStatus(): Promise<SnapmakerDeviceStatus> {
    const response = await fetch(
      `http://${this.ipAddress}:8080/api/v1/status?token=${
        this.currentToken.guid
      }&_=${Date.now()}`
    );
    return response.status || SnapmakerDeviceStatus.DISCONNECTED;
  }
}
