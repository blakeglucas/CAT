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

  @Input() value = '';
  @Input() isNumber = false;
  @Output() valueChange = new EventEmitter();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.value = changes['value'].currentValue
    }
    this.cdr.detectChanges();
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value
  }

  blur(event: FocusEvent) {
    if (this.isNumber) {
      const nVal = Number(this.value)
      this.valueChange.emit(nVal)
    } else {
      this.valueChange.emit(this.value)
    }
  }
}
