import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GcodeService } from '../../services/gcode.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-tabs-view',
  templateUrl: './tabs-view.component.html',
  styleUrls: ['./tabs-view.component.scss'],
})
export class TabsViewComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() controlPanelOffset = 450;

  @ViewChild('rootContainer') rootContainer: ElementRef<HTMLDivElement>;
  @ViewChild('tabsContainer') tabsContainer: ElementRef<HTMLDivElement>;

  contentWidth = 620;
  contentHeight = 480;

  constructor(
    public socketService: SocketService,
    public gCodeService: GcodeService,
    private cdr: ChangeDetectorRef
  ) {}

  currentTab = 'calibration';

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    setTimeout(() => {
      this.getContentSize();
    }, 50);
  }

  @HostListener('window:resize')
  getContentSize() {
    if (this.rootContainer && this.tabsContainer) {
      const rootRect = this.rootContainer.nativeElement.getBoundingClientRect();
      const tabsRect = this.tabsContainer.nativeElement.getBoundingClientRect();
      this.contentWidth = rootRect.width;
      this.contentHeight = rootRect.height - tabsRect.height;
      this.cdr.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => this.getContentSize(), 10);
  }

  onTabChange(a: Event) {
    const event = a as CustomEvent;
    this.currentTab = event.detail.value;
  }

  setTab(name: string) {
    this.currentTab = name;
  }
}
