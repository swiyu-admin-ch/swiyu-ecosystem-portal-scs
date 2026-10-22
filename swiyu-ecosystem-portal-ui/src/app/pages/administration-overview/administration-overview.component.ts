import {AfterViewInit, ChangeDetectionStrategy, Component, inject, signal, ViewChild} from '@angular/core';
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
import {catchError, forkJoin, merge, Observable, of, startWith, switchMap, tap} from 'rxjs';
import {BusinessPartnerApi, BusinessPartnerListItem, VerificationProgress} from '../../api/generated';
import {AppRoutes} from '../../app.routes';
import {AppConfigService} from '../../core/appconfig/app-config.service';
import {BusinessPartnerTrustChipComponent} from '../../shared/business-partner-trust-chip/business-partner-trust-chip.component';
import {StatefulAlertComponent} from '../../shared/stateful-alert/stateful-alert.component';

@Component({
  selector: 'app-administration-overview',
  templateUrl: './administration-overview.component.html',
  styleUrl: './administration-overview.component.scss',
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
    StatefulAlertComponent,
    RouterModule,
    BusinessPartnerTrustChipComponent
  ]
})
export class AdministrationOverviewComponent implements AfterViewInit {
  readonly appConfigService = inject(AppConfigService);
  readonly router = inject(Router);

  @ViewChild(StatefulAlertComponent)
  maxOrganizationAmountBeenReached!: StatefulAlertComponent;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<BusinessPartnerListItem>([]);
  protected totalElements = 0;
  protected readonly AppRoutes = AppRoutes;
  protected readonly progressByPartner = signal<Record<string, VerificationProgress | undefined>>({});
  private readonly businessPartnerApi = inject(BusinessPartnerApi);

  ngAfterViewInit(): void {
    this.checkBusinessPartnersAndInitialize();
  }

  private checkBusinessPartnersAndInitialize() {
    this.businessPartnerApi.hasBusinessPartners().subscribe(businessPartnersExist => {
      if (!businessPartnersExist) {
        this.router.navigate(AppRoutes.baseOnboardingIntroduction(), {replaceUrl: true});
      } else {
        this.initializeTable();
      }
    });
  }

  private initializeTable() {
    this.reloadDataOnTableChanges().subscribe();
  }

  public get hasMaxOrganizationAmountBeenReached() {
    return this.totalElements >= (this.appConfigService.maxBusinessPartnerPerCustomer ?? 0);
  }

  navigateToBusinessPartnerRegistration() {
    if (this.hasMaxOrganizationAmountBeenReached) {
      this.maxOrganizationAmountBeenReached.markActive();
    } else {
      this.router.navigate(AppRoutes.baseOnboardingWizard());
    }
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
        return this.businessPartnerApi.getBusinessPartners({
          page: this.paginator.pageIndex,
          size: this.paginator.pageSize,
          sort: [`${this.sort.active},${this.sort.direction}`]
        });
      }),
      tap(result => {
        this.dataSource.data = result.content || [];
        this.totalElements = result.page?.totalElements ?? 0;
      }),
      switchMap(result => this.fetchVerificationProgress(result.content || []))
    );
  }

  // The verification progress is fetched asynchronously per row so that the table
  // fills up quickly while the (potentially slow) status calls complete in the background.
  private fetchVerificationProgress(
    partners: BusinessPartnerListItem[]
  ): Observable<(VerificationProgress | undefined)[]> {
    if (partners.length === 0) {
      this.progressByPartner.set({});
      return of([]);
    }
    return forkJoin(
      partners.map(partner =>
        this.businessPartnerApi
          .getVerificationProgress({businessPartnerId: partner.id})
          .pipe(catchError(() => of(undefined)))
      )
    ).pipe(
      tap(progressList => {
        const map: Record<string, VerificationProgress | undefined> = {};
        partners.forEach((partner, index) => {
          map[partner.id] = progressList[index];
        });
        this.progressByPartner.set(map);
      })
    );
  }
}
