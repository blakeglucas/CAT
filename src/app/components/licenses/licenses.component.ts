import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ElectronService } from '../../services/electron.service';

type LicenseEntry = {
  name: string;
  licenseType: string;
  link: string;
  author: string;
  installedVersion: string;
};

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.component.html',
  styleUrls: ['./licenses.component.scss'],
})
export class LicensesComponent implements OnInit, OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter();

  @ViewChild('dialog', { read: ElementRef })
  dialog: ElementRef<HTMLDialogElement>;

  licenses: LicenseEntry[] = [];

  constructor(private electronService: ElectronService) {}

  ngOnInit(): void {
    this.electronService.ipcRenderer.on('licenses', (event, licenseList) => {
      this.licenses = JSON.parse(licenseList);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.open) {
      if (changes.open.currentValue) {
        this.show();
      } else if (changes.open.previousValue !== undefined) {
        this.closeDialog();
      }
    }
  }

  show() {
    this.electronService.ipcRenderer.send('licenses');
    this.dialog.nativeElement.removeAttribute('hidden');
    this.dialog.nativeElement.setAttribute('open', 'true');
  }

  private closeDialog() {
    this.dialog.nativeElement.removeAttribute('open');
    this.dialog.nativeElement.setAttribute('hidden', 'true');
  }

  getLink(rawLink: string) {
    return rawLink.replace(/git\+/g, '').replace(/git:/g, 'https:');
  }
}
