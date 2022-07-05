import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

export interface DropdownItem {
  label: string;
  data?: any;
  value: string;
}

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit, OnChanges {
  @Input() label: string | undefined;
  @Input() items: DropdownItem[] = [];
  @Input() value: string = '';
  @Output() selectionchange = new EventEmitter<any>();

  currentSelection = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.currentSelection = changes.value.currentValue;
      this.cdr.detectChanges();
    }
  }

  onChange(_event: Event) {
    const event = _event as CustomEvent;
    this.currentSelection = event.detail.newValue as string;
    this.selectionchange.emit(this.currentSelection);
  }
}
