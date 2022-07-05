import { Injectable } from '@angular/core';
import { IPCRendererBase } from '../utils/IPCRendererBase';
import { CalibrationService } from './calibration.service';
import { NotificationService } from './notification.service';
import { SerialService } from './serial.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorService extends IPCRendererBase {
  private readonly channels = ['error:process'];

  constructor(
    private calibrationService: CalibrationService,
    private notificationService: NotificationService,
    private serialService: SerialService
  ) {
    super();
    this.errorHandler = this.errorHandler.bind(this);
    this.registerChannels();
  }

  private registerChannels() {
    this.channels.forEach((channel) => {
      this.ipcRenderer.on(channel, this.errorHandler);
    });
  }

  private errorHandler(event: any, err: Error | string) {
    console.warn(err);
    this.notificationService.showError(`ERROR: "${err}"`);
    if (this.calibrationService.running) {
      this.calibrationService.stop(err);
      this.notificationService.showError(
        'Error detected during calibration. Calibration has been stopped.'
      );
    }
  }
}
