import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {OrganizationOverviewComponent} from './organization-overview.component';

describe('OrganizationOverviewComponent', () => {
  let component: OrganizationOverviewComponent;
  let fixture: ComponentFixture<OrganizationOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting()],
      imports: [MatIconTestingModule, TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
