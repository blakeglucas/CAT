/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { IPCRendererBase } from '../utils/IPCRendererBase';
import { SerialService, SerialTimeoutError } from './serial.service';
import { SERIAL_COMMAND } from '../interfaces/SerialService.interface';
import { sleep } from '../utils/sleep';
import { BehaviorSubject } from 'rxjs';
import { HeightMap, HeightMapService } from './height-map.service';
import { ErrorService } from './error.service';
import { NotificationService } from './notification.service';

enum CALIBRATION_STATE {
  IDLE = 0,
  RUNNING,
  STOPPING,
  STOPPED,
  PAUSED,
}

type CalibrationParams = {
  x: number;
  y: number;
  xn: number;
  yn: number;
  zstep: number;
  ztrav: number;
  onComplete: () => void;
  onError: (err: Error | string) => void;
};

@Injectable({
  providedIn: 'root',
})
export class CalibrationService extends IPCRendererBase {
  private state: CALIBRATION_STATE = CALIBRATION_STATE.IDLE;

  private cY = 0;
  private cX = 0;
  private heightMap: number[][][] = [];
  private rowMap: number[][] = [];
  private dX = 0;
  private dY = 0;

  private _calParams: CalibrationParams;

  private switchTrigger = false;
  private abortController: AbortController;

  private readonly _points = new BehaviorSubject<number[][]>([]);

  readonly points$ = this._points.asObservable();

  xDim = 20;
  yDim = 20;
  xDiv = 5;
  yDiv = 5;
  zStep = 0.1;
  zTrav = 1;

  get points() {
    return this._points.getValue();
  }

  set points(val: HeightMap) {
    this._points.next(val);
  }

  get running() {
    return this.state === CALIBRATION_STATE.RUNNING;
  }

  get calParams() {
    return this._calParams;
  }

  set calParams(val: CalibrationParams) {
    this._calParams = { ...val };
  }

  get hasResults() {
    return this.heightMap.length > 0;
  }

  constructor(
    private serialService: SerialService,
    private heightMapService: HeightMapService,
    private notificationService: NotificationService
  ) {
    super();
    this.start = this.start.bind(this);
    this.run = this.run.bind(this);
    this.ipcRenderer.on('serial:switch_trigger', (event, value) => {
      this.switchTrigger = true;
    });
    this.abortController = new AbortController();
    this.abortController.signal.addEventListener('abort', () => {
      this.state = CALIBRATION_STATE.STOPPED;
    });
  }

  async start(params: CalibrationParams) {
    this.calParams = {
      ...params,
    };
    this.dX = this.calParams.x / (this.calParams.xn - 1);
    this.dY = this.calParams.y / (this.calParams.yn - 1);
    await this.serialService.sendCommand(SERIAL_COMMAND.GO_TO_ORIGIN_Z, {
      z: this.calParams.ztrav,
    });
    await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
      z: this.calParams.ztrav,
    });
    // Number(null) === 0, no need for default
    this.cY = Number(localStorage.getItem('cY'));
    this.cX = Number(localStorage.getItem('cX'));
    this.rowMap = localStorage.getItem('rowMap')
      ? JSON.parse(localStorage.getItem('rowMap'))
      : [];
    this.heightMap = localStorage.getItem('heightMap')
      ? JSON.parse(localStorage.getItem('heightMap'))
      : [];
    this.switchTrigger = false;
    this.state = CALIBRATION_STATE.RUNNING;
    this.run();
  }

  async run() {
    // TODO: why?
    if (this.state !== CALIBRATION_STATE.RUNNING) {
      return;
    }
    const DEBUG_heightMap = localStorage.getItem('DEBUG_heightMap');
    if (!DEBUG_heightMap) {
      this.setHeightMap([]);
      let accurateWorkOriginSet = false;
      while (
        this.cY <= this.calParams.y &&
        this.state === CALIBRATION_STATE.RUNNING
      ) {
        try {
          localStorage.setItem('cY', `${this.cY}`);
          this.rowMap = [];
          while (
            this.cX <= this.calParams.x &&
            this.state === CALIBRATION_STATE.RUNNING
          ) {
            localStorage.setItem('cX', `${this.cX}`);
            await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
              z: this.calParams.ztrav,
            });
            await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
              x: this.cX,
            });
            // Required to prevent skipping position bc switch race condition
            await sleep(1500);
            this.switchTrigger = false;
            let i = 0;
            while (
              !this.switchTrigger &&
              this.state === CALIBRATION_STATE.RUNNING
            ) {
              await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
                z: -1 * Math.abs(this.calParams.zstep),
              });
              await sleep(500);
              i++;
            }
            if (this.state !== CALIBRATION_STATE.RUNNING) {
              return;
            }
            this.switchTrigger = false;
            const rawPosition: string = await this.serialService.sendCommand(
              SERIAL_COMMAND.GET_POSITION
            );
            const position = rawPosition
              .split(' ')
              .slice(0, 3)
              .map((x) => {
                const parts = x.split(':');
                return Number(parts[parts.length - 1]);
              });
            if (this.cX === 0 && this.cY === 0 && !accurateWorkOriginSet) {
              await this.serialService.sendCommand(SERIAL_COMMAND.SET_WORK);
              await sleep(1000);
              accurateWorkOriginSet = true;
              continue;
            }
            this.appendToPoints([this.cX, this.cY, position[2]]);
            this.rowMap.push([this.cX, this.cY, position[2]]);
            this.cX += this.dX;
          }
          if (this.state !== CALIBRATION_STATE.RUNNING) {
            return;
          }
          this.cY += this.dY;
          this.pushHeightMap(this.rowMap);
          if (this.cY > this.calParams.y) {
            await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
              z: 15,
            });
            break;
          } else {
            this.cX = 0;
            await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
              z: this.calParams.ztrav,
            });
            await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
              y: this.cY,
            });
          }
        } catch (e) {
          if (e instanceof SerialTimeoutError) {
            console.error(e);
            this.stop(e);
            return;
          } else {
            throw e;
          }
        }
      }
    } else {
      this.setHeightMap(JSON.parse(DEBUG_heightMap));
    }
    console.log(this.heightMap);
    localStorage.removeItem('cX');
    localStorage.removeItem('cY');
    localStorage.removeItem('rowMap');
    // localStorage.removeItem('DEBUG_heightMap');
    // localStorage.setItem('DEBUG_heightMap', JSON.stringify(this.heightMap));
    this.sendToHeightMapService();
    localStorage.removeItem('heightMap');
    this.state = CALIBRATION_STATE.STOPPED;
    this.calParams.onComplete();
  }

  appendToPoints(point: number[]) {
    this._points.next([...this._points.getValue(), point]);
  }

  stop(error: Error | string | undefined = undefined) {
    this.abortController.abort();
    this.abortController = new AbortController();
    if (error) {
      this.calParams.onError(error);
      this.notificationService.showError(error.toString());
    }
  }

  clear() {
    this._points.next([]);
  }

  sendToHeightMapService() {
    const metadata = {
      x: this.calParams.x,
      y: this.calParams.y,
      xpoints: this.calParams.xn,
      ypoints: this.calParams.yn,
      timestamp: new Date().toUTCString(),
    };
    const DEBUG_metadata = localStorage.getItem('DEBUG_metadata');
    this.heightMapService.loadHeightMapFromCalibration(
      this.heightMap,
      DEBUG_metadata ? JSON.parse(DEBUG_metadata) : metadata
    );
    // localStorage.setItem('DEBUG_metadata', JSON.stringify(metadata));
  }

  private saveHeightMap() {
    localStorage.setItem('heightMap', JSON.stringify(this.heightMap));
  }

  private setHeightMap(hm: number[][][]) {
    this.heightMap = hm;
    this.saveHeightMap();
  }

  private pushHeightMap(item: number[][]) {
    this.heightMap.push(item);
    this.saveHeightMap();
  }
}
