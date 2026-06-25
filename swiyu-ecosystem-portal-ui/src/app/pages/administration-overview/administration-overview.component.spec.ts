import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideRouter, Router} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {BusinessPartnerApi, BusinessPartnerListItem} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {AppConfigService} from '../../core/appconfig/app-config.service';
import {AdministrationOverviewComponent} from './administration-overview.component';

describe('AdministrationOverviewComponent', () => {
  let component: AdministrationOverviewComponent;
  let fixture: ComponentFixture<AdministrationOverviewComponent>;
  let router: Router;

  const appConfigMock = {
    featureToggles: {EIDARTFE_1122: true},
    maxBusinessPartnerPerCustomer: 999999
  };

  const createBusinessPartnerPage = (totalElements: number) => ({
    content: Array.from({length: 10}, (_, i) => ({
      id: `bp-${i}`,
      name: `Business Partner ${i}`,
      type: BusinessPartnerListItem.TypeEnum.Business
    })),
    page: {
      totalElements,
      number: 0,
      size: 10
    }
  });

  const businessPartnerApiMock = {
    hasBusinessPartners: jest.fn(),
    getBusinessPartners: jest.fn()
  };

  beforeEach(async () => {
    businessPartnerApiMock.getBusinessPartners.mockReset();
    businessPartnerApiMock.hasBusinessPartners.mockReset();

    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, AdministrationOverviewComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        {provide: AppConfigService, useValue: appConfigMock},
        {provide: BusinessPartnerApi, useValue: businessPartnerApiMock}
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(AdministrationOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  };

  it('should create', fakeAsync(() => {
    businessPartnerApiMock.hasBusinessPartners.mockReturnValue(of(false));
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    createComponent();

    expect(component).toBeTruthy();
    expect(navigateSpy).toHaveBeenCalledWith(AppRoutes.baseOnboardingIntroduction(), {replaceUrl: true});
    expect(businessPartnerApiMock.getBusinessPartners).not.toHaveBeenCalled();
  }));

  it('sets paginator length from page.totalElements', fakeAsync(() => {
    const totalElements = 3421;
    businessPartnerApiMock.hasBusinessPartners.mockReturnValue(of(true));
    businessPartnerApiMock.getBusinessPartners.mockReturnValue(of(createBusinessPartnerPage(totalElements)));

    createComponent();

    expect(component.paginator.length).toBe(totalElements);
    expect(component['totalElements']).toBe(totalElements);
  }));

  it('resets to first page when sorting changes', fakeAsync(() => {
    const totalElements1 = 100;
    const totalElements2 = 200;

    businessPartnerApiMock.hasBusinessPartners.mockReturnValue(of(true));
    businessPartnerApiMock.getBusinessPartners
      .mockReturnValueOnce(of(createBusinessPartnerPage(totalElements1)))
      .mockReturnValueOnce(of(createBusinessPartnerPage(totalElements2)));

    createComponent();

    // Simulate user being on a later page.
    component.paginator.pageIndex = 2;

    component.sort.active = 'id';
    component.sort.direction = 'asc';
    component.sort.sortChange.emit({active: 'id', direction: 'asc'});
    tick();
    fixture.detectChanges();

    expect(businessPartnerApiMock.getBusinessPartners).toHaveBeenCalledTimes(2);
    expect(businessPartnerApiMock.getBusinessPartners.mock.calls[1][0]).toEqual(expect.objectContaining({page: 0}));
  }));
});
