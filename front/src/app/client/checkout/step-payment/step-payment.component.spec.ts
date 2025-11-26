import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepPaymentComponent } from './step-payment.component';

describe('StepPaymentComponent', () => {
  let component: StepPaymentComponent;
  let fixture: ComponentFixture<StepPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
