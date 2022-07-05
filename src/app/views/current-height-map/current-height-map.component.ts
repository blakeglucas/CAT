import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import colorNames from 'colornames';
import { map, Observable, Subscription } from 'rxjs';
import { HeightMapService } from '../../services/height-map.service';

@Component({
  selector: 'app-current-height-map',
  templateUrl: './current-height-map.component.html',
  styleUrls: ['./current-height-map.component.scss'],
})
export class CurrentHeightMapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() width = -1;
  @Input() height = -1;

  currentView: 'points' | 'surface' = 'points';

  constructor(
    public heightMapService: HeightMapService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {}

  changeView() {
    this.currentView = this.currentView === 'points' ? 'surface' : 'points';
  }
}
