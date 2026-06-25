import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconRegistry} from '@angular/material/icon';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ActivatedRoute} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObNotificationService, WINDOW} from '@oblique/oblique';
import {of, throwError} from 'rxjs';
import {BusinessPartnerApi, IdentifierApi, IdentifierStatus} from '../../../api/generated';
import {AppConfigService} from '../../../core/appconfig/app-config.service';
import {DidDetailsComponent} from './did-details.component';

describe('DidDetailsComponent', () => {
  let component: DidDetailsComponent;
  let fixture: ComponentFixture<DidDetailsComponent>;
  let identifierApiMock: jest.Mocked<Partial<IdentifierApi>>;
  let businessPartnerApiMock: jest.Mocked<Partial<BusinessPartnerApi>>;
  let notificationServiceMock: jest.Mocked<Partial<ObNotificationService>>;
  let matIconRegistryMock: jest.Mocked<Partial<MatIconRegistry>>;

  const mockPartnerId = 'test-partner-id';
  const mockIdentifierId = 'test-identifier-id';
  const mockDid = 'did:tdw:test:123';
  const mockDescription = 'Test description';
  const mockBusinessPartnerName = 'Test Organization';
  const mockIdentifierRegistryUrl = 'https://identifier-registry.test.com';
  const mockIdentifierRegistryApiUrl = 'https://identifier-registry-api.test.com';
  const mockStatusRegistryApiUrl = 'https://status-registry.test.com';
  const mockApiGatewayAuthUrl = 'https://auth.test.com';
  const mockBaseRegistryDocUrl = 'https://docs.test.com/base-registry';
  const mockApiKeysDocUrl = 'https://docs.test.com/api-keys';

  beforeEach(async () => {
    identifierApiMock = {
      getIdentifierOfPartner: jest.fn().mockReturnValue(
        of({
          id: mockIdentifierId,
          did: mockDid,
          description: mockDescription,
          status: IdentifierStatus.Initialized
        })
      ),
      updateIdentifierDescription: jest.fn().mockReturnValue(of({}))
    };

    businessPartnerApiMock = {
      getBusinessPartner: jest.fn().mockReturnValue(
        of({
          name: mockBusinessPartnerName,
          trustVerificationStatus: 'VERIFIED'
        })
      )
    };

    notificationServiceMock = {
      success: jest.fn(),
      error: jest.fn()
    };

    // Mock MatIconRegistry to prevent icon loading errors
    matIconRegistryMock = {
      getNamedSvgIcon: jest.fn().mockReturnValue(of(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))),
      addSvgIcon: jest.fn().mockReturnThis(),
      addSvgIconSet: jest.fn().mockReturnThis()
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), DidDetailsComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: ActivatedRoute, useValue: {}},
        {provide: WINDOW, useValue: window},
        {provide: IdentifierApi, useValue: identifierApiMock},
        {provide: BusinessPartnerApi, useValue: businessPartnerApiMock},
        {provide: ObNotificationService, useValue: notificationServiceMock},
        {provide: MatIconRegistry, useValue: matIconRegistryMock},
        {
          provide: AppConfigService,
          useValue: {
            identifierRegistryUrl: mockIdentifierRegistryUrl,
            identifierRegistryApiUrl: mockIdentifierRegistryApiUrl,
            statusRegistryApiUrl: mockStatusRegistryApiUrl,
            apiGatewayAuthUrl: mockApiGatewayAuthUrl
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    // Configure TranslateService mock after TestBed setup
    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => {
      if (key === 'app_site_did-details_card_did-information_docs-link_base-registry-doc-url') {
        return mockBaseRegistryDocUrl;
      }
      if (key === 'app_site_did-details_card_did-information_docs-link_api-keys-doc-url') {
        return mockApiKeysDocUrl;
      }
      return key as string;
    });

    fixture = TestBed.createComponent(DidDetailsComponent);
    component = fixture.componentInstance;

    // Set required inputs (replaces ActivatedRoute mock)
    fixture.componentRef.setInput('businessPartnerId', mockPartnerId);
    fixture.componentRef.setInput('identifierEntryId', mockIdentifierId);

    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load route params on init', () => {
      expect(component.businessPartnerId()).toBe(mockPartnerId);
      expect(component.identifierEntryId()).toBe(mockIdentifierId);
    });

    it('should load identifier details on init', () => {
      expect(identifierApiMock.getIdentifierOfPartner).toHaveBeenCalledWith({
        partnerId: mockPartnerId,
        identifierId: mockIdentifierId
      });
      expect(component.didInformationForm.get('did')?.value).toBe(mockDid);
      expect(component.description()).toBe(mockDescription);
    });

    it('should load business partner on init', () => {
      expect(businessPartnerApiMock.getBusinessPartner).toHaveBeenCalledWith({
        businessPartnerId: mockPartnerId
      });
    });
  });

  describe('Description editing', () => {
    it('should enable edit mode when editDescription is called', () => {
      component.editDescription();
      expect(component.isEditingDescription()).toBe(true);
    });

    it('should store original description when entering edit mode', () => {
      const original = 'Original description';
      component.description.set(original);
      component.editDescription();
      component.description.set('Modified');
      component.cancelEditDescription();
      expect(component.description()).toBe(original);
    });

    it('should revert description when cancelEditDescription is called', () => {
      component.description.set('Original');
      component.editDescription();
      component.description.set('Modified');
      component.cancelEditDescription();
      expect(component.description()).toBe('Original');
      expect(component.isEditingDescription()).toBe(false);
    });

    it('should save description and show success notification', () => {
      component.editDescription();
      component.description.set('New description');
      component.saveDescription();

      expect(identifierApiMock.updateIdentifierDescription).toHaveBeenCalledWith({
        partnerId: mockPartnerId,
        identifierId: mockIdentifierId,
        identifierUpdateRequest: {
          description: 'New description'
        }
      });
      expect(component.isEditingDescription()).toBe(false);
      expect(notificationServiceMock.success).toHaveBeenCalledWith(
        'app.site.did-details.notification.description-saved'
      );
    });

    it('should revert description and show error on save failure', () => {
      const errorMessage = 'Save failed';
      identifierApiMock.updateIdentifierDescription = jest
        .fn()
        .mockReturnValue(throwError(() => ({message: errorMessage})));

      component.description.set('Original');
      component.editDescription();
      component.description.set('Modified');
      component.saveDescription();

      expect(component.description()).toBe('Original');
      expect(component.isEditingDescription()).toBe(false);
      expect(notificationServiceMock.error).not.toHaveBeenCalled();
    });

    it('should not save if description is invalid (too long)', () => {
      component.editDescription();
      component.description.set('a'.repeat(256)); // exceeds maxDescriptionLength of 255
      component.saveDescription();

      expect(identifierApiMock.updateIdentifierDescription).not.toHaveBeenCalled();
    });

    it('should validate description length correctly', () => {
      component.description.set('a'.repeat(255));
      expect(component.isDescriptionValid()).toBe(true);

      component.description.set('a'.repeat(256));
      expect(component.isDescriptionValid()).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should not show local error notification when loading data fails', () => {
      const errorMessage = 'Failed to load';

      // Reset mocks to return errors
      identifierApiMock.getIdentifierOfPartner = jest.fn().mockReturnValue(throwError(() => ({message: errorMessage})));

      // Create a new component instance
      const newFixture = TestBed.createComponent(DidDetailsComponent);
      newFixture.componentRef.setInput('businessPartnerId', mockPartnerId);
      newFixture.componentRef.setInput('identifierEntryId', mockIdentifierId);
      newFixture.detectChanges();

      expect(notificationServiceMock.error).not.toHaveBeenCalled();
    });
  });
});
