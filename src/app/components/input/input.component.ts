import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('inputElem', { read: ElementRef })
  inputElem: ElementRef<HTMLInputElement>;

  @Input() disabled = false;
  @Input() label;

  @Input() value: string | number = '';
  @Output() valueChange = new EventEmitter();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cdr.detectChanges();
  }

  onChange(event: Event) {
    if (typeof this.value === 'number') {
      const nVal = Number((event.target as HTMLInputElement).value);
      this.valueChange.emit(nVal);
    } else {
      this.valueChange.emit((event.target as HTMLInputElement).value);
    }
  }
}
