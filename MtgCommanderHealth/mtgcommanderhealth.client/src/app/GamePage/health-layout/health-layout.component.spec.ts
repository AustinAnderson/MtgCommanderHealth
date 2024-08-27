import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthLayoutComponent } from './health-layout.component';

describe('HealthLayoutComponent', () => {
  let component: HealthLayoutComponent;
  let fixture: ComponentFixture<HealthLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HealthLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
