export enum EventTypes {
  GetActiveMachine = 'GETMACH',
  ArbitraryCommand = 'ARBCMD',
  MachineHome = 'MACHHOME',
  ListSerialPorts = 'LISTDEVTTYUSB',
  SetActivePort = 'SETPORT',
  MachineMove = 'MACHMOVE',
  GetMachinePosition = 'GETMACHPOS',
  BeginJob = 'JOBSTART',
}
