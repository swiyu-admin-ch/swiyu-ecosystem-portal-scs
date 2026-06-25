import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ObButtonDirective} from '@oblique/oblique';
import {ClipboardComponent} from '../../../../../shared/clipboard/clipboard.component';

export interface OauthMockRoleDialogData {
  roleValues: string[];
}

@Component({
  selector: 'app-oauth-mock-role-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ClipboardComponent,
    ObButtonDirective
  ],
  templateUrl: './oauth-mock-role-dialog.component.html',
  styleUrl: './oauth-mock-role-dialog.component.scss'
})
export class OauthMockRoleDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<OauthMockRoleDialogComponent, boolean>);
  readonly data = inject<OauthMockRoleDialogData>(MAT_DIALOG_DATA);
  readonly displayRoles = this.data.roleValues.join('\n');
  readonly clipboardRoles = this.data.roleValues.join(' ');

  close(): void {
    this.dialogRef.close(true);
  }
}
