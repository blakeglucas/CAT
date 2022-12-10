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

export const SERIAL_COMMAND_MAP: Record<SERIAL_COMMAND, string | string[]> =
  {
    [SERIAL_COMMAND.NOP]: 'G4 P0\0',
    [SERIAL_COMMAND.HOME]: 'G28\0',
    [SERIAL_COMMAND.GET_POSITION]: 'M114\0',
    [SERIAL_COMMAND.SET_WORK]: 'G92 X0 Y0 Z0 B0\0',
    [SERIAL_COMMAND.MOVE_ABS]: ['G90\0', 'G0'],
    [SERIAL_COMMAND.MOVE_REL]: ['G91\0', 'G0'],
    [SERIAL_COMMAND.GO_TO_ORIGIN]: ['G90\0', 'G0 X0 Y0 Z0\0'],
    [SERIAL_COMMAND.GO_TO_ORIGIN_Z]: ['G90\0', 'G0 X0 Y0\0'],
  };
