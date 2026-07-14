import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {TranslateModule} from '@ngx-translate/core';
import {WINDOW} from '@oblique/oblique';
import {OrganizationOverviewComponent} from './organization-overview.component';

describe('OrganizationOverviewComponent', () => {
  let component: OrganizationOverviewComponent;
  let fixture: ComponentFixture<OrganizationOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: WINDOW, useValue: window}],
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
