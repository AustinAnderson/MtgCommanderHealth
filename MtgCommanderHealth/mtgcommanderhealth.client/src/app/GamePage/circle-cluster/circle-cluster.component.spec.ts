import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleClusterComponent } from './circle-cluster.component';

describe('CircleClusterComponent', () => {
  let component: CircleClusterComponent;
  let fixture: ComponentFixture<CircleClusterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircleClusterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CircleClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
