import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GCodeObject } from '../utils/contourGCode';
import { IPCRendererBase } from '../utils/IPCRendererBase';
import { CalibrationService } from './calibration.service';
import { GcodeService } from './gcode.service';
import {
  HeightMap,
  HeightMapMetadata,
  HeightMapService,
} from './height-map.service';
import { NotificationService } from './notification.service';
import { SerialService } from './serial.service';

export type ProjectMetadata = {
  lastSaved?: string;
  created: string;
};

export type ProjectCalibration = {
  x: number;
  y: number;
  xpoints: number;
  ypoints: number;
  zstep: number;
  ztrav: number;
  data: number[][];
};

export type ProjectHeightMapData = {
  filepath?: string;
  map: HeightMap;
  metadata: HeightMapMetadata;
};

export type GCodeData = {
  filepath: string;
  filecontent: string;
};

export type ProjectGCodeData = {
  raw?: GCodeData;
  contoured?: GCodeData;
};

export type ProjectControlData = {
  cncPort: string;
  switchPort: string;
  cncPortBaud: number;
  switchPortBaud: number;
};

export type ProjectFileSchema = {
  metadata: ProjectMetadata;
  calibration: ProjectCalibration;
  heightMap: ProjectHeightMapData;
  gcode: ProjectGCodeData;
  control: ProjectControlData;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectService extends IPCRendererBase {
  private readonly _openedProject = new BehaviorSubject<
    ProjectFileSchema | undefined
  >(undefined);
  readonly openedProject$ = this._openedProject.asObservable();

  filePath = '';

  constructor(
    private calibrationService: CalibrationService,
    private gcodeService: GcodeService,
    private heightMapService: HeightMapService,
    private serialService: SerialService,
    private notificationService: NotificationService
  ) {
    super();

    this.ipcRenderer.on(
      'file:open_project',
      (event, pFileContent, filePath) => {
        this.openProject(pFileContent);
        this.filePath = filePath;
      }
    );

    this.ipcRenderer.on('file:save_project_as', (event, filePath) => {
      this.filePath = filePath;
    });
  }

  get openedProject() {
    return this._openedProject.getValue();
  }

  openProject(pFileContent: string) {
    try {
      const data: ProjectFileSchema = JSON.parse(pFileContent);
      this._openedProject.next(data);
      this.calibrationService.xDim = data.calibration.x;
      this.calibrationService.yDim = data.calibration.y;
      this.calibrationService.xDiv = data.calibration.xpoints;
      this.calibrationService.yDiv = data.calibration.ypoints;
      this.calibrationService.zStep = data.calibration.zstep;
      this.calibrationService.zTrav = data.calibration.ztrav;
      this.calibrationService.points = data.calibration.data || [];

      this.heightMapService.currentHeightMap = data.heightMap.map;
      this.heightMapService.currentMetadata = data.heightMap.metadata;

      // TODO Check file paths
      this.gcodeService.rawGCode = data.gcode.raw.filecontent || '';
      this.gcodeService.cGCode = data.gcode.contoured.filecontent || '';

      this.serialService.setCNCPort(
        data.control.cncPort,
        data.control.cncPortBaud
      );
      this.serialService.setSwitchPort(
        data.control.switchPort,
        data.control.switchPortBaud
      );
    } catch (e) {
      console.error(e);
      this.notificationService.showError(
        'There was an error loading the project. Project may be loaded incompletely. There may be an error with the project file.'
      );
    }
  }

  getProjectContents() {
    const data: ProjectFileSchema = {
      metadata: {
        created: new Date().toUTCString(),
      },
      calibration: {
        x: this.calibrationService.xDim,
        y: this.calibrationService.yDim,
        xpoints: this.calibrationService.xDiv,
        ypoints: this.calibrationService.yDiv,
        zstep: this.calibrationService.zStep,
        ztrav: this.calibrationService.zTrav,
        data: this.calibrationService.points,
      },
      heightMap: {
        // TODO Filepath
        map: this.heightMapService.currentHeightMap,
        metadata: this.heightMapService.currentMetadata,
      },
      gcode: {
        raw: {
          filepath: this.gcodeService.rawFilePath,
          filecontent: this.gcodeService.rawGCode,
        },
        contoured: {
          filepath: this.gcodeService.cFilePath,
          filecontent: this.gcodeService.cGCode,
        },
      },
      control: {
        cncPort: this.serialService.cncPort,
        switchPort: this.serialService.switchPort,
        cncPortBaud: this.serialService.cncPortBaud,
        switchPortBaud: this.serialService.switchPortBaud,
      },
    };
    return data;
  }

  closeProject() {
    this.filePath = '';
    this._openedProject.next(undefined);
  }
}
