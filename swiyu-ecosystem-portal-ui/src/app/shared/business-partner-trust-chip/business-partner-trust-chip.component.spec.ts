import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {VerificationProgressStatus} from '../../api/generated';
import {BusinessPartnerTrustChipComponent} from './business-partner-trust-chip.component';

describe('StatusChipComponent', () => {
  let component: BusinessPartnerTrustChipComponent;
  let fixture: ComponentFixture<BusinessPartnerTrustChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, BusinessPartnerTrustChipComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessPartnerTrustChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be loading while no progress is provided', () => {
    fixture.componentRef.setInput('progress', undefined);
    fixture.detectChanges();
    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('verification_progress_loading');
  });

  it('should not be loading once progress is provided', () => {
    fixture.componentRef.setInput('progress', {status: VerificationProgressStatus.VerificationSucceeded});
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('VerificationSucceeded');
  });

  it('should expose daysRemainingForVerification from maxDateForStatus', () => {
    const inTenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    fixture.componentRef.setInput('progress', {
      status: VerificationProgressStatus.VerificationStarted,
      maxDateForStatus: inTenDays
    });
    fixture.detectChanges();
    expect(component.daysRemainingForVerification()).toBe(10);
  });

  it('should expose null daysRemainingForVerification when no deadline is provided', () => {
    fixture.componentRef.setInput('progress', {
      status: VerificationProgressStatus.VerificationStarted
    });
    fixture.detectChanges();
    expect(component.daysRemainingForVerification()).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('NaN');
  });
});
