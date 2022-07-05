import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-machine-control',
  templateUrl: './machine-control.component.html',
  styleUrls: ['./machine-control.component.scss'],
})
export class MachineControlComponent implements OnInit {
  @Input() disabled = false;
  @Input() homing = false;

  @Output() up = new EventEmitter<void>();
  @Output() left = new EventEmitter<void>();
  @Output() right = new EventEmitter<void>();
  @Output() down = new EventEmitter<void>();
  @Output() home = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  onHome() {
    this.home.emit();
  }

  onLeft() {
    this.left.emit();
  }

  onRight() {
    this.right.emit();
  }

  onUp() {
    this.up.emit();
  }

  onDown() {
    this.down.emit();
  }
}
