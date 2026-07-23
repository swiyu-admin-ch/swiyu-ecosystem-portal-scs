import {HttpContext} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, ViewChild} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Router, RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule} from '@oblique/oblique';
import {catchError, concatMap, forkJoin, map, merge, of, startWith, switchMap, tap, throwError} from 'rxjs';
import {
  BusinessPartner,
  BusinessPartnerApi,
  IdentifierApi,
  IdentifierResponse,
  ProofOfPossession,
  TrustOnboardingApi,
  TrustOnboardingSubmission
} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {AppConfigService} from '../../core/appconfig/app-config.service';
import {SUPPRESS_ERROR_ALERT_STATUSES} from '../../core/interceptor/error-http-interceptor';
import {BusinessPartnerTrustChipComponent} from '../../shared/business-partner-trust-chip/business-partner-trust-chip.component';
import {LocalizeService} from '../../shared/i18n/localize.service';
import {IdentifierBaseOnboardingStatusComponent} from '../../shared/identifier-base-onboarding-status/identifier-base-onboarding-status.component';
import {InfoIconComponent} from '../../shared/info-icon/info-icon.component';
import {StatefulAlertComponent} from '../../shared/stateful-alert/stateful-alert.component';
import {BusinessPartnerDetailActionsComponent} from './business-partner-detail-actions/business-partner-detail-actions.component';

@Component({
  selector: 'app-business-partner-detail',
  templateUrl: './business-partner-detail.component.html',
  styleUrl: './business-partner-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    MatCardModule,
    MatTableModule,
    MatTooltipModule,
    ObButtonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSidenavModule,
    RouterModule,
    BusinessPartnerTrustChipComponent,
    StatefulAlertComponent,
    IdentifierBaseOnboardingStatusComponent,
    InfoIconComponent,
    BusinessPartnerDetailActionsComponent
  ]
})
export class BusinessPartnerDetailComponent {
  businessPartnerId = input.required<string>();
  readonly appConfigService = inject(AppConfigService);
  readonly router = inject(Router);
  @ViewChild(StatefulAlertComponent)
  alertNoDIDs!: StatefulAlertComponent;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<IdentifierResponse>([]);
  businessPartner = signal<BusinessPartner | undefined>(undefined);
  remainingDidSlots = signal<number>(0);
  trustOnboardingSubmission = signal<TrustOnboardingSubmission | undefined>(undefined);
  alertNoDIDsVisible = signal<boolean>(false);
  totalDIDs = signal(0);
  alertProofContinueVisible = computed(
    () =>
      // if TrustOnboardingSubmission is Unsubmitted
      this.trustOnboardingSubmission()?.status === TrustOnboardingSubmission.StatusEnum.Unsubmitted &&
      // and only contains Valid proofs
      this.trustOnboardingSubmission()?.proofOfPossessionList.filter(
        tos => tos.status !== ProofOfPossession.StatusEnum.Valid
      ).length === 0 &&
      // and contains at least one proof
      (this.trustOnboardingSubmission()?.proofOfPossessionList.length ?? 0) > 0
  );
  alertTrustOnboardingSuccessfulVisible = computed(
    () =>
      // if TrustOnboardingSubmission is Unsubmitted
      this.trustOnboardingSubmission()?.status === TrustOnboardingSubmission.StatusEnum.Succeeded
  );
  alertTrustOnboardingInformationRequestedVisible = computed(
    () => this.trustOnboardingSubmission()?.status === TrustOnboardingSubmission.StatusEnum.InformationRequested
  );
  protected readonly AppRoutes = AppRoutes;
  private readonly businessPartnerApi = inject(BusinessPartnerApi);
  private readonly trustOnboardingApi = inject(TrustOnboardingApi);
  private readonly identifierApi = inject(IdentifierApi);
  private readonly localization = inject(LocalizeService);
  protected readonly entityName = this.localization.localize(() => this.businessPartner()?.entityName);

  constructor() {
    effect(onCleanup => {
      const sub = forkJoin([
        this.businessPartnerApi.getBusinessPartner({
          businessPartnerId: this.businessPartnerId()
        }),
        this.trustOnboardingApi
          .getLatestTrustOnboardingSubmission(
            {
              latestTrustOnboardingSubmissionRequest: {
                businessPartnerId: this.businessPartnerId()
              }
            },
            undefined,
            undefined,
            {context: new HttpContext().set(SUPPRESS_ERROR_ALERT_STATUSES, new Set([404]))}
          )
          .pipe(
            catchError(err => {
              if (err.status == 404) {
                return of(undefined);
              }
              return throwError(() => err);
            })
          )
      ])
        .pipe(
          tap(([businessPartner, latestTrustOnboardingSubmission]) => {
            this.businessPartner.set(businessPartner);
            this.trustOnboardingSubmission.set(latestTrustOnboardingSubmission);
          }),
          concatMap(() => this.reloadDataOnTableChanges())
        )
        .subscribe();

      onCleanup(() => sub.unsubscribe());
    });
  }

  get noDids() {
    return this.totalDIDs() === 0;
  }

  private reloadDataOnTableChanges() {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const sort$ = this.sort.sortChange.pipe(
      tap(() => {
        this.paginator.pageIndex = 0;
      })
    );
    return merge(this.paginator.page, sort$).pipe(
      startWith({}),
      switchMap(() => {
        return this.identifierApi
          .getAllIdentifiersOfPartner({
            page: this.paginator?.pageIndex ?? 0,
            size: this.paginator?.pageSize ?? 10,
            sort: [`${this.sort?.active},${this.sort?.direction}`],
            partnerId: this.businessPartnerId()
          })
          .pipe(
            map(result => {
              this.dataSource.data = result.content || [];
              this.alertNoDIDsVisible.set(this.dataSource.data.length === 0);
              const total = result.page?.totalElements ?? this.dataSource.data.length;
              this.totalDIDs.set(total);
              this.remainingDidSlots.set((this.businessPartner()?.payedForDIDSlots ?? 0) - total);
              if (this.paginator) {
                this.paginator.length = total;
              }
            })
          );
      })
    );
  }
}
