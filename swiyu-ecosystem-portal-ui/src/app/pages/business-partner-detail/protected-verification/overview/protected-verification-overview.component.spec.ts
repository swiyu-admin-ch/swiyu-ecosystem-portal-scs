import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {of} from 'rxjs';
import {ProtectedVerificationSubmissionApi, ProtectedVerificationSubmissionListItem} from '../../../../api/generated';
import {ProtectedVerificationOverviewComponent} from './protected-verification-overview.component';

describe('ProtectedVerificationOverviewComponent', () => {
  let component: ProtectedVerificationOverviewComponent;
  let fixture: ComponentFixture<ProtectedVerificationOverviewComponent>;
  let getAllSubmissionsMock: jest.Mock;

  const listItem: ProtectedVerificationSubmissionListItem = {
    id: 'pv-1',
    partnerId: 'partner-001',
    entityName: 'Test Corp',
    category: ProtectedVerificationSubmissionListItem.CategoryEnum.PersonalAdministrativeNumber,
    status: ProtectedVerificationSubmissionListItem.StatusEnum.Submitted,
    submittedAt: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    getAllSubmissionsMock = jest.fn().mockReturnValue(of({content: [listItem]}));

    await TestBed.configureTestingModule({
      imports: [ProtectedVerificationOverviewComponent, RouterModule.forRoot([]), TranslateModule.forRoot()],
      providers: [
        provideObliqueTestingConfiguration(),
        {
          provide: ProtectedVerificationSubmissionApi,
          useValue: {getAllProtectedVerificationSubmissions: getAllSubmissionsMock}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtectedVerificationOverviewComponent);
    fixture.componentRef.setInput('businessPartnerId', 'partner-001');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fetches submissions scoped to the given partner', () => {
    expect(getAllSubmissionsMock).toHaveBeenCalledWith({
      businessPartnerId: 'partner-001',
      page: 0,
      size: 100,
      sort: ['submittedAt,desc']
    });
    expect(component['submissions']()).toEqual([listItem]);
  });

  it('maps a category to its frontend-only category group key', () => {
    expect(
      component['categoryGroupKey'](ProtectedVerificationSubmissionListItem.CategoryEnum.PersonalAdministrativeNumber)
    ).toBe('eportal_protectedVerificationCategoryGroup_PERSONAL_ADMINISTRATIVE_NUMBER');
  });

  describe('hasActiveSubmission', () => {
    it('is true and hides the request button when a submission is SUBMITTED', () => {
      expect(component['hasActiveSubmission']()).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-cy="btnRequestProtectedVerification"]')).toBeNull();
    });

    it('is true when a submission is APPROVED', () => {
      component['submissions'].set([
        {...listItem, status: ProtectedVerificationSubmissionListItem.StatusEnum.Approved}
      ]);
      fixture.detectChanges();

      expect(component['hasActiveSubmission']()).toBe(true);
      expect(fixture.nativeElement.querySelector('[data-cy="btnRequestProtectedVerification"]')).toBeNull();
    });

    it('is false and shows the request button when the only submission is REJECTED', () => {
      component['submissions'].set([
        {...listItem, status: ProtectedVerificationSubmissionListItem.StatusEnum.Rejected}
      ]);
      fixture.detectChanges();

      expect(component['hasActiveSubmission']()).toBe(false);
      expect(fixture.nativeElement.querySelector('[data-cy="btnRequestProtectedVerification"]')).not.toBeNull();
    });

    it('is false and shows the request button when there are no submissions', () => {
      component['submissions'].set([]);
      fixture.detectChanges();

      expect(component['hasActiveSubmission']()).toBe(false);
      expect(fixture.nativeElement.querySelector('[data-cy="btnRequestProtectedVerification"]')).not.toBeNull();
    });
  });
});
