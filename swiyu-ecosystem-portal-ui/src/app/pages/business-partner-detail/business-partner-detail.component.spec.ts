import {ComponentFixture, TestBed} from '@angular/core/testing';

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
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
});
