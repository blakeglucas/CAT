export type WirelessScanResult<T = WirelessCNCDevice> = Record<string, T>;

export interface WirelessCNC {
  devices: WirelessCNCDevice[];
  connectedDevice: WirelessCNCDevice | null;
  scan(): WirelessScanResult | Promise<WirelessScanResult>;
  setConnectedDevice(device: WirelessCNCDevice): void | Promise<void>;
}

export interface WirelessCNCDevice<S = any> {
  status: S;

  connect(): Promise<S>;
  disconnect(): Promise<void>;
}

declare const WirelessCNCDevice: {
  new (ipAddress: string): WirelessCNCDevice;
};
