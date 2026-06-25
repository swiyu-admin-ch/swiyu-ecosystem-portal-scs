import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {OrganizationUpdate} from '../../../api/organization.service';
import {EditOrganizationComponent} from './edit-organization.component';

describe('EditOrganizationComponent', () => {
  let component: EditOrganizationComponent;
  let fixture: ComponentFixture<EditOrganizationComponent>;
  beforeEach(async () => {
    const organizationUpdate: OrganizationUpdate = {
      id: '123',
      name: 'Test',
      contactEmailAddress: 'test@test.ch'
    };
    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: organizationUpdate
        },
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
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
