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
});
