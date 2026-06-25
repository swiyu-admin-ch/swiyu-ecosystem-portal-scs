import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {ObAlertComponent, ObButtonDirective} from '@oblique/oblique';

@Component({
  selector: 'app-unsaved-changes-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslateModule, ObAlertComponent, ObButtonDirective],
  template: `
    <h2 mat-dialog-title>{{ 'eportal_global_unsavedChanges_title' | translate }}</h2>
    <mat-dialog-content>
      <ob-alert [type]="'warning'">{{ 'eportal_global_unsavedChanges_body' | translate }}</ob-alert>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button obButton="primary" (click)="leave()">
        {{ 'eportal_global_unsavedChanges_btnPrim_leave' | translate }}
      </button>
      <button mat-button obButton="secondary" (click)="stay()">
        {{ 'eportal_global_unsavedChanges_btnSec_stay' | translate }}
      </button>
    </mat-dialog-actions>
  `
})
export class UnsavedChangesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<UnsavedChangesDialogComponent>);

  stay(): void {
    this.dialogRef.close(false);
  }

  leave(): void {
    this.dialogRef.close(true);
  }
}
