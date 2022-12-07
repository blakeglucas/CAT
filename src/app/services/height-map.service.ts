import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from './electron.service';
import { SerialService } from './serial.service';

export type HeightMap = number[][];

export type HeightMapMetadata = {
  x: number;
  y: number;
  xpoints: number;
  ypoints: number;
  timestamp: string;
  switchPort?: string;
  cncPort?: string;
};

export type HeightMapFileSchema = {
  metadata: HeightMapMetadata;
  map: HeightMap;
};

@Injectable({
  providedIn: 'root',
})
export class HeightMapService {
  private readonly _currentMetadata = new BehaviorSubject<
    HeightMapMetadata | undefined
  >(undefined);
  readonly currentMetadata$ = this._currentMetadata.asObservable();

  private readonly _currentHeightMap = new BehaviorSubject<
    HeightMap | undefined
  >(undefined);
  readonly currentHeightMap$ = this._currentHeightMap.asObservable();

  constructor(private serialService: SerialService) {
    this.processHeightMapFile = this.processHeightMapFile.bind(this);
  }

  get currentHeightMap() {
    return this._currentHeightMap.getValue();
  }

  set currentHeightMap(val: HeightMap) {
    this._currentHeightMap.next(val);
  }

  get currentMetadata() {
    return this._currentMetadata.getValue();
  }

  set currentMetadata(val: HeightMapMetadata) {
    this._currentMetadata.next(val);
  }

  processHeightMapFile(contents: string) {
    try {
      const data: HeightMapFileSchema = JSON.parse(contents);
      const nData = this.normalize(data.map);
      this._currentHeightMap.next(nData);
      this._currentMetadata.next(data.metadata);
    } catch (e) {
      console.error(e);
      // TODO notifications
    }
  }

  clearCurrentMap() {
    this._currentHeightMap.next(undefined);
  }

  private normalize(data: number[][] | number[][][]) {
    if (Array.isArray(data[0][0])) {
      return data.flat() as number[][];
    } else {
      return data as number[][];
    }
  }

  loadHeightMapFromCalibration(
    calResult: number[][][],
    metadata: HeightMapMetadata
  ) {
    console.log(calResult)
    const nData = this.normalize(calResult);
    console.log(nData)
    this._currentHeightMap.next(nData);
    this._currentMetadata.next(metadata);
  }

  createHeightMapFileContent() {
    const data: HeightMapFileSchema = {
      metadata: {
        ...this.currentMetadata,
        cncPort: this.serialService.cncPort,
        switchPort: this.serialService.switchPort,
      },
      map: this.currentHeightMap,
    };
    return data;
  }
}
