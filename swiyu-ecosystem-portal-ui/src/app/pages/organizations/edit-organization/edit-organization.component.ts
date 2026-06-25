import {AsyncPipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ObAlertModule, ObButtonModule, ObErrorMessagesModule} from '@oblique/oblique';
import {map, Observable, startWith} from 'rxjs';
import {OrganizationUpdate} from '../../../api/organization.service';

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrl: './edit-organization.component.scss',
  imports: [
    TranslateModule,
    ObAlertModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    ObButtonModule,
    MatIcon,
    ObErrorMessagesModule,
    AsyncPipe
  ]
})
export class EditOrganizationComponent {
  translate = inject(TranslateService);
  private readonly dialogRef = inject<MatDialogRef<EditOrganizationComponent, OrganizationUpdate>>(MatDialogRef);
  private readonly data = inject<OrganizationUpdate>(MAT_DIALOG_DATA);

  private readonly fb = inject(FormBuilder);
  protected readonly maxLengthOrgName = 45;
  protected readonly form = this.fb.group({
    orgName: this.fb.control<string | undefined>(undefined, [
      Validators.required,
      Validators.maxLength(this.maxLengthOrgName)
    ]),
    technicalEmail: this.fb.control<string | undefined>(undefined, [Validators.required, Validators.email])
  });
  protected readonly lengthHint$: Observable<string>;

  constructor() {
    const data = this.data;

    this.form.setValue({
      orgName: data.name,
      technicalEmail: data.contactEmailAddress
    });
    this.form.markAsPristine();
    this.lengthHint$ = this.form.controls.orgName.valueChanges.pipe(
      startWith(this.form.controls.orgName.value),
      map(name => {
        const length = name?.length ?? 0;
        return `${length}/${this.maxLengthOrgName}`;
      })
    );
  }

  public cancel() {
    this.dialogRef.close();
  }

  public save() {
    this.form.markAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close({
      id: this.data.id,
      contactEmailAddress: this.form.controls.technicalEmail.value!,
      name: this.form.controls.orgName.value!
    });
  }
}
