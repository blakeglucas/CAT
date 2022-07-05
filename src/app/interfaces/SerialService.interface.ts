import { Observable } from 'rxjs';
import { PortInfo } from '@serialport/bindings-interface';
import { SerialPort } from 'serialport';

export enum SERIAL_COMMAND {
  NOP = 0,
  SET_WORK,
  HOME,
  MOVE_ABS,
  MOVE_REL,
  GO_TO_ORIGIN,
  GO_TO_ORIGIN_Z,
  GET_POSITION,
}

export type SERIAL_PARAMS = Partial<{
  x: number;
  y: number;
  z: number;
  f: number;
  s: number;
  e: never;
  b: never;
}>;

export interface ISerialService {
  availablePorts: PortInfo[];
  availablePorts$: Observable<(PortInfo | Partial<PortInfo>)[]>;
  activeCommand$: Observable<SERIAL_COMMAND | undefined>;

  cncPort: string | undefined;
  switchPort: string | undefined;

  setCNCPort(portPath: string, baud: number): Promise<void>;
  setSwitchPort(portPath: string, baud: number): Promise<void>;

  sendCommand(cmd: SERIAL_COMMAND, params?: SERIAL_PARAMS): Promise<void>;
}
