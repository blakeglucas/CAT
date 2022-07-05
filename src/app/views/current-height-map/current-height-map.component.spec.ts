import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentHeightMapComponent } from './current-height-map.component';

describe('CurrentHeightMapComponent', () => {
  let component: CurrentHeightMapComponent;
  let fixture: ComponentFixture<CurrentHeightMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentHeightMapComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentHeightMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
