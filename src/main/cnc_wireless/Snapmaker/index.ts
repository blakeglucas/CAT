import {
  WirelessCNC,
  WirelessCNCDevice,
  WirelessScanResult,
} from '../../../shared/interfaces/WirelessCNC';
import { SnapmakerDevice, SnapmakerDeviceStatus } from './Device';
import { SnapmakerScanner } from './Scanner';

export { SnapmakerScanner } from './Scanner';

export class SnapmakerWirelessCNC implements WirelessCNC {
  devices: SnapmakerDevice[];
  connectedDevice: SnapmakerDevice | null = null;

  private readonly scanner = new SnapmakerScanner();

  async scan(): Promise<WirelessScanResult<SnapmakerDevice>> {
    const scanResults = await this.scanner.scan();
    this.devices = Object.values(scanResults);
    return scanResults;
  }

  async setConnectedDevice(device: SnapmakerDevice): Promise<void> {
    if (
      this.connectedDevice &&
      this.connectedDevice.status === SnapmakerDeviceStatus.CONNECTED
    ) {
      await this.connectedDevice.disconnect();
    }
    this.connectedDevice = device;
    const result = await this.connectedDevice.connect();
    if (result !== SnapmakerDeviceStatus.CONNECTED) {
      this.connectedDevice = null;
      // TODO throw or return false?
    }
  }
}
