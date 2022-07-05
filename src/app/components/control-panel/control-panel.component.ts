import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { map, Observable, of } from 'rxjs';
import { SERIAL_COMMAND } from '../../interfaces/SerialService.interface';
import { ElectronService } from '../../services/electron.service';
import { SerialService } from '../../services/serial.service';
import { SocketService } from '../../services/socket.service';
import { DropdownItem } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss'],
})
export class ControlPanelComponent implements OnInit {
  readonly SERIAL_COMMAND = SERIAL_COMMAND;
  private readonly minWidth = 200;
  readonly initialWidth = 450;
  _width = this.initialWidth;

  usePiConnection = false;
  piIPAddress = '192.168.1.106';
  _piPort = 8000;

  _cncPort = '';
  _cncBaud = 115200;
  _switchPort = '';
  _switchBaud = 9600;

  cncDropdownOptions: Observable<DropdownItem[]>;
  localSerialDropdownOptions: Observable<DropdownItem[]>;

  @Output() controlPanelResize = new EventEmitter<number>();

  constructor(
    public socketService: SocketService,
    public serialService: SerialService,
    private electronService: ElectronService,
    private cdr: ChangeDetectorRef
  ) {
    this.cncDropdownOptions = this.socketService.serialPorts$.pipe(
      map((ports) => ports.map((p) => ({ label: p, value: p })))
    );
    this.localSerialDropdownOptions = this.serialService.availablePorts$.pipe(
      map((ports) =>
        ports.map((p) => ({
          label: p.path,
          value: p.path,
        }))
      )
    );
    // TODO Mitigate multiple sources of truth
    this.serialService.portsUpdated.subscribe({
      next: async () => {
        this._cncPort = this.serialService.cncPort || '';
        this._cncBaud = this.serialService.cncPortBaud || 115200;
        this._switchPort = this.serialService.switchPort || '';
        this._switchBaud = this.serialService.switchPortBaud || 9600;
      },
    });
  }

  ngOnInit(): void {}

  get width() {
    return this._width;
  }

  set width(newWidth: number) {
    this._width = newWidth;
    this.controlPanelResize.emit(this._width);
  }

  onResize(event?: ResizeEvent) {
    let newWidth = event ? event.rectangle.right : this.width;
    const maxWidth = Math.floor(window.innerWidth / 2);
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
    } else if (newWidth < this.minWidth) {
      newWidth = this.minWidth;
    }
    this.width = newWidth;
  }

  resetWidth() {
    this.width = this.initialWidth;
  }

  log(a: any) {
    console.log(a);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.onResize();
  }

  connectSocket() {
    if (this.socketService.isConnected) {
      this.socketService.disconnectSocket();
    } else {
      this.socketService.createNewSocket(this.piIPAddress, this.piPort);
      this.socketService.listSerialPorts();
    }
  }

  setActiveMachine() {
    this.socketService.setActivePort(this.cncPort, this.cncBaud);
    this.socketService.getActiveMachine();
  }

  get piPort() {
    return this._piPort;
  }

  set piPort(val: any) {
    this._piPort = Number(val);
  }

  get cncPort() {
    return this._cncPort;
  }

  get cncBaud() {
    return this._cncBaud;
  }

  set cncBaud(val: any) {
    this._cncBaud = Number(val);
    this.createCNCSerial();
  }

  get switchPort() {
    return this._switchPort;
  }

  get switchBaud() {
    return this._switchBaud;
  }

  set switchBaud(val: any) {
    this._switchBaud = Number(val);
    this.createSwitchSerial();
  }

  async setCncPort(portPath: string) {
    this._cncPort = portPath;
    await this.createCNCSerial();
  }

  async createCNCSerial() {
    try {
      await this.serialService.setCNCPort(this._cncPort, this._cncBaud);
    } catch (e) {
      this._cncPort = '';
      this.cdr.detectChanges();
    }
  }

  async setSwitchPort(portPath: string) {
    this._switchPort = portPath;
    await this.createSwitchSerial();
  }

  async createSwitchSerial() {
    console.log(this._cncPort, this._cncBaud);
    try {
      await this.serialService.setSwitchPort(
        this._switchPort,
        this._switchBaud
      );
    } catch (e) {
      // console.log(e)
      this._switchPort = '';
      this.cdr.detectChanges();
    } finally {
      console.log(this._cncPort, this._cncBaud);
    }
  }

  onConnectionChange() {
    this.usePiConnection = !this.usePiConnection;
    this.cdr.detectChanges();
  }

  refreshSerialPorts() {
    // TODO Refactor to SerialService via ipcRenderer directly
    this.electronService.getAvailableSerialPorts();
  }

  home() {
    this.serialService.sendCommand(SERIAL_COMMAND.HOME);
  }
}
