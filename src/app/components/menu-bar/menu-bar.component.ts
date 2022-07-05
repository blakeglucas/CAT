import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as Mousetrap from 'mousetrap';
import { ElectronService } from '../../services/electron.service';
import { GcodeService } from '../../services/gcode.service';
import { HeightMapService } from '../../services/height-map.service';
import { ProjectService } from '../../services/project.service';

import * as packageInfo from '../../../../package.json';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss'],
})
export class MenuBarComponent implements OnInit {
  readonly packageInfo = packageInfo;
  readonly year = new Date().getFullYear();

  isMaximized = false;

  @ViewChild('aboutDialog', { read: ElementRef })
  aboutDialog: ElementRef<HTMLDialogElement>;

  licensesOpen = false;

  constructor(
    public electronService: ElectronService,
    private gCodeService: GcodeService,
    private heightMapService: HeightMapService,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService
  ) {
    this.electronService.ipcRenderer.on(
      'menubar:ismaximized',
      (event, isMaximized) => {
        this.isMaximized = isMaximized;
        this.cdr.detectChanges();
      }
    );
    this.electronService.ipcRenderer.send('menubar:ismaximized');
  }

  ngOnInit(): void {
    Mousetrap.bind(['ctrl+o', 'cmd+o'], () => {
      this.openProject();
      return false;
    });
    Mousetrap.bind(['ctrl+o h', 'cmd+o h'], () => {
      this.openHeightMap();
      return false;
    });
    Mousetrap.bind(['ctrl+o g', 'cmd+o g'], () => {
      this.openRawGCode();
      return false;
    });
    Mousetrap.bind(['ctrl+o c', 'cmd+o c'], () => {
      this.openCGCode();
      return false;
    });
    Mousetrap.bind(['ctrl+e h', 'cmd+e h'], () => {
      this.saveHeightMap();
      return false;
    });
    Mousetrap.bind(['ctrl+e g', 'cmd+e g'], () => {
      this.saveCGCode();
      return false;
    });
    Mousetrap.bind(['ctrl+s', 'cmd+s'], () => {
      this.saveProject();
      return false;
    });
    Mousetrap.bind(['ctrl+shift+s', 'cmd+shift+s'], () => {
      this.saveProjectAs();
      return false;
    });
    Mousetrap.bind(['ctrl+w', 'cmd+w'], () => {
      this.closeProject();
      return false;
    });
    Mousetrap.bind(['ctrl+q', 'cmd+q'], () => {
      this.close();
      return false;
    });
  }

  minimize() {
    this.electronService.ipcRenderer.send('minimize');
  }

  maximize() {
    if (!this.isMaximized) {
      this.electronService.ipcRenderer.send('maximize');
    } else {
      this.electronService.ipcRenderer.send('unmaximize');
    }
  }

  close() {
    // TODO confirm save
    this.electronService.ipcRenderer.send('close');
  }

  openHeightMap() {
    this.electronService.ipcRenderer.send('file:open_height_map');
  }

  openRawGCode() {
    this.electronService.ipcRenderer.send('file:open_raw_gcode');
  }

  openCGCode() {
    this.electronService.ipcRenderer.send('file:open_contoured_gcode');
  }

  saveHeightMap() {
    this.electronService.ipcRenderer.send(
      'file:save_height_map',
      JSON.stringify(this.heightMapService.createHeightMapFileContent())
    );
  }

  saveCGCode() {
    this.electronService.ipcRenderer.send(
      'file:save_cgcode',
      this.gCodeService.cGCode
    );
  }

  openProject() {
    this.electronService.ipcRenderer.send('file:open_project');
  }

  saveProject() {
    if (!this.projectService.filePath) {
      this.saveProjectAs();
    } else {
      const data = this.projectService.getProjectContents();
      this.electronService.ipcRenderer.send(
        'file:save_project',
        JSON.stringify(data),
        this.projectService.filePath
      );
    }
  }

  saveProjectAs() {
    const data = this.projectService.getProjectContents();
    this.electronService.ipcRenderer.send(
      'file:save_project_as',
      JSON.stringify(data)
    );
  }

  closeProject() {
    this.electronService.windowTitle = 'CNC Auto-Leveling Tool';
    this.projectService.closeProject();
  }

  showAbout() {
    this.aboutDialog.nativeElement.removeAttribute('hidden');
    this.aboutDialog.nativeElement.setAttribute('open', 'true');
  }

  closeAbout() {
    this.aboutDialog.nativeElement.removeAttribute('open');
    this.aboutDialog.nativeElement.setAttribute('hidden', 'true');
  }

  showLicenses() {
    this.licensesOpen = true;
  }

  hideLicenses() {
    this.licensesOpen = false;
  }
}
