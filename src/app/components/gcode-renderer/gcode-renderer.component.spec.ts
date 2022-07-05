import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GcodeRendererComponent } from './gcode-renderer.component';

describe('GcodeRendererComponent', () => {
  let component: GcodeRendererComponent;
  let fixture: ComponentFixture<GcodeRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GcodeRendererComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GcodeRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
