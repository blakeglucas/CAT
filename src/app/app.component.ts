import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';

import { SocketService } from './services/socket.service';
import { ErrorService } from './services/error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  controlPanelWidth = 450;

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    public socketService: SocketService,
    private errorService: ErrorService
  ) {
    this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  ngAfterViewInit(): void {
    // this.gcodePreview = new GCodePreview.WebGLPreview({
    //   targetId: 'gcode-preview',
    //   buildVolume: {
    //     x: 150,
    //     y: 150,
    //     z: 150,
    //   },
    //   initialCameraPosition: [0, 400, 450],
    // })
    // this.gcodePreview.processGCode('G0 X0 Y0 Z0.2\nG1 X42 Y42')
    // this.gcodePreview.render()
    // this.socketService.listSerialPorts()
  }

  onControlPanelResize(newWidth: number) {
    this.controlPanelWidth = newWidth;
  }
}
