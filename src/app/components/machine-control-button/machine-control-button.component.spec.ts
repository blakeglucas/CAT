import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineControlButtonComponent } from './machine-control-button.component';

describe('MachineControlButtonComponent', () => {
  let component: MachineControlButtonComponent;
  let fixture: ComponentFixture<MachineControlButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MachineControlButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineControlButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
