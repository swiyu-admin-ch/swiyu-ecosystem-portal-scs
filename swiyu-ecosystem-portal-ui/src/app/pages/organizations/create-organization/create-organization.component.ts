import {AsyncPipe} from '@angular/common';
import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslateModule} from '@ngx-translate/core';
import {ObButtonModule, ObErrorMessagesModule, ObExternalLinkDirective} from '@oblique/oblique';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {map, startWith} from 'rxjs';
import {OrganizationRegistration} from '../../../api/organization.service';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrl: './create-organization.component.scss',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxExtendedPdfViewerModule,
    MatCheckboxModule,
    ObButtonModule,
    MatButtonModule,
    MatIconModule,
    ObErrorMessagesModule,
    AsyncPipe,
    ObExternalLinkDirective
  ]
})
export class CreateOrganizationComponent {
  private readonly dialogRef =
    inject<MatDialogRef<CreateOrganizationComponent, OrganizationRegistration>>(MatDialogRef);

  private readonly fb = inject(FormBuilder);
  protected readonly maxLengthOrgName = 45;
  protected readonly form = this.fb.group({
    orgName: this.fb.control<string | undefined>(undefined, [
      Validators.required,
      Validators.maxLength(this.maxLengthOrgName)
    ]),
    technicalEmail: this.fb.control<string | undefined>(undefined, [Validators.required, Validators.email]),
    agbChecked: this.fb.control<boolean>(false, [Validators.requiredTrue])
  });
  protected readonly lengthHint$ = this.form.controls.orgName.valueChanges.pipe(
    startWith(this.form.controls.orgName.value),
    map(name => {
      const length = name?.length ?? 0;
      return `${length}/${this.maxLengthOrgName}`;
    })
  );

  public cancel() {
    this.dialogRef.close();
  }

  public save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close({
      name: this.form.controls.orgName.value!,
      contactEmailAddress: this.form.controls.technicalEmail.value!
    });
  }
}
