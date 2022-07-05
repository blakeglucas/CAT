import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalibrationGridComponent } from './calibration-grid.component';

describe('CalibrationGridComponent', () => {
  let component: CalibrationGridComponent;
  let fixture: ComponentFixture<CalibrationGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalibrationGridComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalibrationGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
