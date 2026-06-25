import {ComponentFixture, TestBed} from '@angular/core/testing';

import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {IdentifierStatus} from '../../api/generated';
import {IdentifierBaseOnboardingStatusComponent} from './identifier-base-onboarding-status.component';

describe('IdentifierBaseOnboardingStatusComponent', () => {
  let component: IdentifierBaseOnboardingStatusComponent;
  let fixture: ComponentFixture<IdentifierBaseOnboardingStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideObliqueTestingConfiguration()],
      imports: [IdentifierBaseOnboardingStatusComponent, RouterModule.forRoot([]), TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(IdentifierBaseOnboardingStatusComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('identifierStatus', IdentifierStatus.Initialized);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
