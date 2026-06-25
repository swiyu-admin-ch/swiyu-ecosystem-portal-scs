import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {DateTimeProvider, OAuthLogger, UrlHelperService} from 'angular-oauth2-oidc';
import {of} from 'rxjs';
import {CreateOrganizationComponent} from './create-organization.component';

describe('CreateOrganizationComponent', () => {
  let component: CreateOrganizationComponent;
  let fixture: ComponentFixture<CreateOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        UrlHelperService,
        OAuthLogger,
        DateTimeProvider,
        {provide: Window, useValue: window},
        provideHttpClient(),
        provideHttpClientTesting(),
        provideObliqueTestingConfiguration(),
        {
          provide: MatDialogRef,
          useValue: {
            open() {
              return {
                afterClosed() {
                  return of('your result');
                }
              };
            }
          }
        }
      ],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
