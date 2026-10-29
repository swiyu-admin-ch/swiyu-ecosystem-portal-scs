import {ComponentFixture, TestBed} from '@angular/core/testing';

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivatedRoute, convertToParamMap, ParamMap, Router, RouterModule} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {BehaviorSubject} from 'rxjs';
import {BusinessPartner} from '../../api/generated';
import {BusinessPartnerDetailComponent} from './business-partner-detail.component';

describe('BusinessPartnerDetailComponent', () => {
  let component: BusinessPartnerDetailComponent;
  let fixture: ComponentFixture<BusinessPartnerDetailComponent>;
  let queryParamMap$: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    queryParamMap$ = new BehaviorSubject(convertToParamMap({}));

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideObliqueTestingConfiguration(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable()
          }
        }
      ],
      imports: [BusinessPartnerDetailComponent, RouterModule.forRoot([]), TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessPartnerDetailComponent);
    fixture.componentRef.setInput('businessPartnerId', 'test');
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates organization display name when language changes', () => {
    const translateService = TestBed.inject(TranslateService);
    const partner: BusinessPartner = {
      id: 'test-id',
      entityName: {
        default: 'Deutsch',
        'de-CH': 'Deutsch',
        'fr-CH': 'Fran�ais'
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
    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Fran�ais');
  });

  it('updates organization display name when language changes', () => {
    const translateService = TestBed.inject(TranslateService);
    const partner = {
      id: 'test-id',
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

  it('does nothing when other url parms than notification are set', async () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentRef.setInput('notification', null);
    queryParamMap$.next(convertToParamMap({foo: 'bar'}));
    fixture.detectChanges();
    expect(component.didAddedNotificationVisible()).toBe(false);

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('removes only did-added and preserves other query params', async () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    // queryParamMap$.next(convertToParamMap({notification: 'did-added', foo: 'bar'}));
    // fixture.componentRef.setInput('notification', 'did-added');
    // fixture.detectChanges();

    fixture.componentRef.setInput('notification', 'did-added');
    fixture.detectChanges();

    expect(component.didAddedNotificationVisible()).toBe(true);

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: {notification: null},
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });
});
