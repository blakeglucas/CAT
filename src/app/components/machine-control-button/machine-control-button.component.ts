import { Component, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-machine-control-button',
  templateUrl: './machine-control-button.component.html',
  styleUrls: ['./machine-control-button.component.scss'],
})
export class MachineControlButtonComponent implements OnInit {
  @Input() iconName = '';
  @Input() rotate = false;
  @Input() loading = false;
  @Input() disabled = false;

  constructor() {}

  ngOnInit(): void {}
}
