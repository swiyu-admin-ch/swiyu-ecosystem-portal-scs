import {BreakpointObserver} from '@angular/cdk/layout';
import {HttpErrorResponse} from '@angular/common/http';
import {Component, inject, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatDrawer, MatDrawerContainer, MatDrawerMode, MatSidenavModule} from '@angular/material/sidenav';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule, ObCollapseComponent, ObExternalLinkDirective} from '@oblique/oblique';
import {filter, mergeMap} from 'rxjs';
import {ApiError, Page, RegistrationResponse} from '../../api/generated';
import {OrganizationRegistration, OrganizationService, OrganizationUpdate} from '../../api/organization.service';
import {AppConfigService} from '../../core/appconfig/app-config.service';
import {StatefulAlertComponent} from '../../shared/stateful-alert/stateful-alert.component';
import {CreateOrganizationComponent} from './create-organization/create-organization.component';
import {EditOrganizationComponent} from './edit-organization/edit-organization.component';

export interface ErrorNotification {
  id: string;
  error: ApiError;
}

@Component({
  selector: 'app-organization-overview',
  templateUrl: './organization-overview.component.html',
  styleUrl: './organization-overview.component.scss',
  imports: [
    TranslateModule,
    MatCardModule,
    MatTableModule,
    MatTooltipModule,
    ObButtonModule,
    MatButtonModule,
    MatIconModule,
    ObCollapseComponent,
    MatPaginator,
    ObExternalLinkDirective,
    StatefulAlertComponent,
    MatDrawerContainer,
    MatSidenavModule,
    MatDrawer
  ]
})
export class OrganizationOverviewComponent implements OnInit {
  readonly appConfigService = inject(AppConfigService);
  public dataSource = new MatTableDataSource<RegistrationResponse>([]);
  public displayedColumns = ['name', 'contactEmailAddress', 'organizationId', 'actions'];
  public baseRegistryInfoActive = false;
  public trustRegistryInfoActive = false;
  errorNotifications: ErrorNotification[] = [];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  isCreateOrgNotificationVisible = signal(false);
  isUpdateOrgNotificationVisible = signal(false);
  drawerStyle: MatDrawerMode = 'side';
  drawerOpened = true;
  drawerIconVisible = false;
  private readonly organisationService = inject(OrganizationService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);

  constructor() {
    this.breakpointObserver.observe(['(max-width:906px)']).subscribe(result => {
      if (result.matches) {
        this.drawerStyle = 'over';
        this.drawerOpened = false;
        this.drawerIconVisible = true;
      } else {
        this.drawerStyle = 'side';
        this.drawerOpened = true;
        this.drawerIconVisible = false;
      }
    });
  }

  get drawerIcon() {
    return this.drawerOpened ? 'chevron-right' : 'chevron-left';
  }

  public get someOrganization() {
    return this.dataSource.data.length > 0;
  }

  public get hasMaxOrganizationAmountBeenReached() {
    return this.totalItems >= 40 + (this.appConfigService.maxBusinessPartnerPerCustomer ?? 0);
  }

  ngOnInit(): void {
    this.loadItems();
  }

  public removeErrorNotification(notification: ErrorNotification) {
    this.errorNotifications = this.errorNotifications.filter(err => err.id !== notification.id);
  }

  public addOrganization() {
    const dialogRef: MatDialogRef<CreateOrganizationComponent, OrganizationRegistration> = this.dialog.open(
      CreateOrganizationComponent,
      {
        height: 'auto',
        maxHeight: '80vh'
      }
    );
    this.isCreateOrgNotificationVisible.set(false);
    this.isUpdateOrgNotificationVisible.set(false);

    dialogRef
      .afterClosed()
      .pipe(
        filter(registration => !!registration),
        mergeMap(registration => this.organisationService.registerOrganization(registration))
      )
      .subscribe({
        next: () => {
          this.isCreateOrgNotificationVisible.set(true);
          this.loadItems();
          // This is a workaround to force reauthentication after business partners have been modified
          setTimeout(() => {
            sessionStorage.clear();
            window.location.reload();
          }, 2500);
        },
        error: e => this.handleError(e)
      });
  }

  public editOrganization(org: OrganizationUpdate) {
    this.isCreateOrgNotificationVisible.set(false);
    this.isUpdateOrgNotificationVisible.set(false);
    const dialogRef: MatDialogRef<EditOrganizationComponent, OrganizationUpdate> = this.dialog.open(
      EditOrganizationComponent,
      {
        data: org,
        minWidth: '33vw'
      }
    );

    dialogRef
      .afterClosed()
      .pipe(
        filter(update => !!update),
        mergeMap(update => this.organisationService.updateOrganization(update))
      )
      .subscribe({
        next: res => {
          this.dataSource.data = [...this.dataSource.data.filter(o => o.id !== res.id), res];
          this.isUpdateOrgNotificationVisible.set(true);
        },
        error: e => this.handleError(e)
      });
  }

  public changeCollapse(status: boolean, component: string) {
    if (status) {
      if (component === 'trustRefCollapse') {
        this.baseRegistryInfoActive = false;
      } else if (component === 'baseRefCollapse') {
        this.trustRegistryInfoActive = false;
      }
    }
  }

  public loadItems() {
    this.organisationService
      .getRegistrations({
        page: this.currentPage,
        size: this.pageSize
      })
      .subscribe({
        next: (org: Page) => {
          if (org?.content) {
            this.dataSource.data = [...org.content];
            this.totalItems = org.totalElements ?? 0;
          }
        },
        error: e => this.handleError(e)
      });
  }

  public onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadItems();
  }

  private handleError(e: HttpErrorResponse) {
    this.errorNotifications.push({
      id: crypto.randomUUID(),
      error: e.error ?? {
        message: e.message,
        errorCode: e.statusText,
        additionalDetails: []
      }
    });
  }
}
