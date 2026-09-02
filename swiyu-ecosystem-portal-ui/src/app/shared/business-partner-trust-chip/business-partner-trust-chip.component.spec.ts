import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {BusinessPartnerTrustStatus} from '../../api/generated';
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
    fixture.componentRef.setInput('businessPartner', {
      maxDateForTrustVerificationStatus: 1,
      trustVerificationStatus: BusinessPartnerTrustStatus.Verified
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose daysRemainingForVerification from the business partner', () => {
    fixture.componentRef.setInput('businessPartner', {
      maxDateForTrustVerificationStatus: 1,
      trustVerificationStatus: BusinessPartnerTrustStatus.InformationRequested,
      daysRemainingForVerification: 29
    });
    fixture.detectChanges();
    expect(component.daysRemainingForVerification()).toBe(29);
  });

  it('should expose null daysRemainingForVerification when not provided', () => {
    fixture.componentRef.setInput('businessPartner', {
      maxDateForTrustVerificationStatus: 1,
      trustVerificationStatus: BusinessPartnerTrustStatus.InformationRequested
    });
    fixture.detectChanges();
    expect(component.daysRemainingForVerification()).toBeNull();
  });

  it('should render the noDays fallback (not NaN) for VerificationStarted without a deadline', () => {
    fixture.componentRef.setInput('businessPartner', {
      maxDateForTrustVerificationStatus: 1,
      trustVerificationStatus: BusinessPartnerTrustStatus.VerificationStarted
    });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('NaN');
    expect(text).toContain('VerificationStarted_noDays');
  });

  it('should render the noDays fallback (not NaN) for InformationRequested without a deadline', () => {
    fixture.componentRef.setInput('businessPartner', {
      maxDateForTrustVerificationStatus: 1,
      trustVerificationStatus: BusinessPartnerTrustStatus.InformationRequested
    });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('NaN');
    expect(text).toContain('InformationRequested_noDays');
  });
});
