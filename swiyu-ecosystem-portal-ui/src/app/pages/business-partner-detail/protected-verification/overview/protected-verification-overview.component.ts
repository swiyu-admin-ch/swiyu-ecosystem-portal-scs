import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {RouterModule} from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';
import {ProtectedVerificationSubmissionApi, ProtectedVerificationSubmissionListItem} from '../../../../api/generated';
import {AppRoutes} from '../../../../app.routes';

// Frontend-only placeholder grouping until swiyu-core-business-service exposes a real category-group field.
const PROTECTED_VERIFICATION_CATEGORY_GROUP: Record<ProtectedVerificationSubmissionListItem.CategoryEnum, string> = {
  [ProtectedVerificationSubmissionListItem.CategoryEnum.PersonalAdministrativeNumber]:
    'eportal_protectedVerificationCategoryGroup_PERSONAL_ADMINISTRATIVE_NUMBER'
};

@Component({
  selector: 'app-protected-verification-overview',
  templateUrl: './protected-verification-overview.component.html',
  styleUrl: './protected-verification-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, MatButtonModule, MatIconModule, MatTableModule, RouterModule, ObButtonModule, DatePipe]
})
export class ProtectedVerificationOverviewComponent {
  businessPartnerId = input.required<string>();

  protected readonly AppRoutes = AppRoutes;
  protected readonly displayColumns = ['category', 'attribute', 'requestDate', 'status'];
  protected readonly submissions = signal<ProtectedVerificationSubmissionListItem[]>([]);
  // A rejected request may be resubmitted; an already submitted or approved one may not (spec Q9).
  protected readonly hasActiveSubmission = computed(() =>
    this.submissions().some(
      submission =>
        submission.status === ProtectedVerificationSubmissionListItem.StatusEnum.Submitted ||
        submission.status === ProtectedVerificationSubmissionListItem.StatusEnum.Approved
    )
  );
  private readonly protectedVerificationSubmissionApi = inject(ProtectedVerificationSubmissionApi);
  private readonly lang = inject(TranslateService);

  constructor() {
    effect(onCleanup => {
      const sub = this.protectedVerificationSubmissionApi
        .getAllProtectedVerificationSubmissions({
          businessPartnerId: this.businessPartnerId(),
          page: 0,
          size: 100,
          sort: ['submittedAt,desc']
        })
        .subscribe(result => this.submissions.set(result.content ?? []));
      onCleanup(() => sub.unsubscribe());
    });
    this.translateSetup();
  }

  protected categoryGroupKey(category: ProtectedVerificationSubmissionListItem.CategoryEnum): string {
    return PROTECTED_VERIFICATION_CATEGORY_GROUP[category];
  }

  private translateSetup() {
    this.lang.instant('eportal_protectedVerificationAttribute_PERSONAL_ADMINISTRATIVE_NUMBER');
    this.lang.instant('eportal_protectedVerificationCategoryGroup_PERSONAL_ADMINISTRATIVE_NUMBER');
    this.lang.instant('eportal_protectedVerificationStatus_APPROVED');
    this.lang.instant('eportal_protectedVerificationStatus_REJECTED');
    this.lang.instant('eportal_protectedVerificationStatus_SUBMITTED');
  }
}
