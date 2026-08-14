import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {BusinessPartnerApi, ProtectedVerificationSubmissionApi} from '../../../../api/generated';
import {ProtectedVerificationWizardComponent} from './protected-verification-wizard.component';
import {ProtectedVerificationWizardService} from './protected-verification-wizard.service';

describe('ProtectedVerificationWizardComponent', () => {
  let component: ProtectedVerificationWizardComponent;
  let fixture: ComponentFixture<ProtectedVerificationWizardComponent>;
  let service: ProtectedVerificationWizardService;
  let businessPartnerApi: BusinessPartnerApi;
  const mockSnapshot = {
    paramMap: convertToParamMap({})
  };

  beforeEach(async () => {
    const businessPartnerApiSpy = {
      getBusinessPartner: jest.fn().mockReturnValue(of({id: 'partner-001', name: 'Test Corp'}))
    };
    const protectedVerificationSubmissionApiSpy = {
      getProtectedVerificationCategories: jest.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [ProtectedVerificationWizardComponent, MatIconTestingModule, TranslateModule.forRoot()],
      providers: [
        {provide: ActivatedRoute, useValue: {snapshot: mockSnapshot}},
        {provide: BusinessPartnerApi, useValue: businessPartnerApiSpy},
        {provide: ProtectedVerificationSubmissionApi, useValue: protectedVerificationSubmissionApiSpy},
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedVerificationWizardComponent);
    component = fixture.componentInstance;
    service = component['service'];
    businessPartnerApi = TestBed.inject(BusinessPartnerApi);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not initialize the wizard when businessPartnerId is missing from route params', fakeAsync(() => {
    tick();
    fixture.detectChanges();

    expect(businessPartnerApi.getBusinessPartner).not.toHaveBeenCalled();
    expect(service.partnerId).toBeNull();
  }));

  it('initializes the wizard when businessPartnerId is present in route params', fakeAsync(() => {
    mockSnapshot.paramMap = convertToParamMap({businessPartnerId: 'partner-001'});

    tick();
    fixture.detectChanges();

    expect(businessPartnerApi.getBusinessPartner).toHaveBeenCalledWith({businessPartnerId: 'partner-001'});
    expect(service.partnerId).toBe('partner-001');
  }));
});
