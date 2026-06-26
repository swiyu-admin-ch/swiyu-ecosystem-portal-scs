import {ComponentFixture, TestBed} from '@angular/core/testing';

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {BusinessPartner} from '../../api/generated';
import {BusinessPartnerDetailComponent} from './business-partner-detail.component';

describe('BusinessPartnerDetailComponent', () => {
  let component: BusinessPartnerDetailComponent;
  let fixture: ComponentFixture<BusinessPartnerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideObliqueTestingConfiguration()],
      imports: [BusinessPartnerDetailComponent, RouterModule.forRoot([]), TranslateModule.forRoot()]
    }).compileComponents();
    fixture = TestBed.createComponent(BusinessPartnerDetailComponent);
    fixture.componentRef.setInput('businessPartnerId', 'test');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates organization display name when language changes', () => {
    const translateService = TestBed.inject(TranslateService);
    const partner: BusinessPartner = {
      id: 'test-id',
      name: 'Fallback Name',
      entityName: {
        default: 'Deutsch',
        'de-CH': 'Deutsch',
        'fr-CH': 'Français'
      },
      contactEmailAddress: 'test@example.com',
      contactPhone: '+41 12 345 67 89',
      type: BusinessPartner.TypeEnum.Business
    };

    component.businessPartner.set(partner);
    translateService.use('de');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Deutsch');

    translateService.use('fr');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Français');
  });
});
