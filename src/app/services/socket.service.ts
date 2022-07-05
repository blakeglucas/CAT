import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';

import { EventTypes } from '../types/EventTypes';

const DEFAULT_EMPTY_STRING = '';
const DEFAULT_EMPTY_ARRAY = [];

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private _currentSocket: Socket | undefined = undefined;
  private _isConnected = false;

  private readonly _serialPorts = new BehaviorSubject<string[]>(
    DEFAULT_EMPTY_ARRAY
  );
  readonly serialPorts$ = this._serialPorts.asObservable();

  private readonly _activeMachine = new BehaviorSubject<string>(
    DEFAULT_EMPTY_STRING
  );
  readonly activeMachine$ = this._activeMachine.asObservable();

  private readonly _machinePosition = new BehaviorSubject<number[]>(
    DEFAULT_EMPTY_ARRAY
  );
  readonly machinePosition$ = this._machinePosition.asObservable();

  private readonly _homing = new BehaviorSubject<boolean>(false);
  readonly homing$ = this._homing.asObservable();

  constructor() {
    this.checkOk = this.checkOk.bind(this);
  }

  get currentSocket() {
    return this._currentSocket;
  }

  get isConnected() {
    return this._isConnected;
  }

  createNewSocket(ip: string, port: number) {
    this.disconnectSocket();
    this._currentSocket = new Socket({
      url: `http://${ip}:${port}`,
    });

    this._currentSocket.on('connect', () => {
      this._isConnected = true;
    });

    this._currentSocket.on('disconnect', () => {
      this._isConnected = false;
    });

    this._currentSocket.on(EventTypes.ListSerialPorts, (ports: string[]) => {
      this._serialPorts.next(ports);
    });

    this._currentSocket.on(EventTypes.GetActiveMachine, (machine: string) => {
      if (machine) {
        this._activeMachine.next(machine);
      }
    });

    this._currentSocket.on(
      EventTypes.GetMachinePosition,
      (isOk: string, pos: number[] | null) => {
        if (pos) {
          this._machinePosition.next(pos);
        }
      }
    );

    this._currentSocket.on(EventTypes.SetActivePort, this.checkOk);
    this._currentSocket.on(EventTypes.MachineHome, (msg: string) => {
      this.checkOk(msg);
      this._homing.next(false);
    });
    this._currentSocket.on(EventTypes.MachineMove, this.checkOk);
  }

  disconnectSocket() {
    if (this._currentSocket) {
      this._currentSocket.disconnect();
    }

    this._serialPorts.next(DEFAULT_EMPTY_ARRAY);
    this._activeMachine.next(DEFAULT_EMPTY_STRING);
    this._machinePosition.next(DEFAULT_EMPTY_ARRAY);

    this._currentSocket = undefined;
  }

  checkOk(msg: string) {
    console.log(msg);
  }

  listSerialPorts() {
    if (this._currentSocket) {
      this._currentSocket.emit(EventTypes.ListSerialPorts);
    }
  }

  getActiveMachine() {
    if (this._currentSocket) {
      this._currentSocket.emit(EventTypes.GetActiveMachine);
    }
  }

  getMachinePosition() {
    if (this._currentSocket) {
      this._currentSocket.emit(EventTypes.GetMachinePosition);
    }
  }

  setActivePort(port: string, baud: number | undefined) {
    if (this._currentSocket && port) {
      this._currentSocket.emit(EventTypes.SetActivePort, { port, baud });
    }
  }

  machineHome() {
    if (this._currentSocket) {
      this._currentSocket.emit(EventTypes.MachineHome);
      this._homing.next(true);
    }
  }

  machineMove(x: number, y: number, z: number, rel = true) {
    if (this._currentSocket) {
      this._currentSocket.emit(EventTypes.MachineMove, { x, y, z, rel });
    }
  }
}
