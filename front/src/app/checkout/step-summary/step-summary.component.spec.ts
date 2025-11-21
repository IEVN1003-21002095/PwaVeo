import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepSummaryComponent } from './step-summary.component';

describe('StepSummaryComponent', () => {
  let component: StepSummaryComponent;
  let fixture: ComponentFixture<StepSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
