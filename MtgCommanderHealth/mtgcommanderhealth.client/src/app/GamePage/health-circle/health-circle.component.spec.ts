import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthCircleComponent } from './health-circle.component';

describe('HealthCircleComponent', () => {
  let component: HealthCircleComponent;
  let fixture: ComponentFixture<HealthCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HealthCircleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
