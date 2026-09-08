import {CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, input, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ObAlertComponent, ObButtonDirective, ObExternalLinkModule, ObUnsavedChangesDirective} from '@oblique/oblique';
import {ClipboardComponent} from '../clipboard/clipboard.component';
import {FullLangPipe} from '../full-lang/full-lang.pipe';
import {FormField, SectionLink} from './form-field.model';

/**
 * This component displays a section with details, typically used for displaying form fields in a read-only or editable manner.
 * It supports copying field values to the clipboard and emitting an edit event.
 */
@Component({
  selector: 'app-detail-section',
  templateUrl: './detail-section.component.html',
  styleUrl: './detail-section.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
    ObButtonDirective,
    ObExternalLinkModule,
    ClipboardComponent,
    FullLangPipe,
    ObAlertComponent,
    ObUnsavedChangesDirective
  ]
})
export class DetailSectionComponent {
  title = input.required<string>();
  group = input.required<FormGroup>();
  fields = input.required<FormField[]>();
  isEditing = input<boolean>(false);
  editable = input<boolean>(false);
  sectionId = input.required<string>();
  link = input<SectionLink>();
  /** When true and isEditing, shows the orange re-verification warning alert and cost summary */
  showActiveIdentityWarning = input<boolean>(false);
  /** When true and isEditing, replaces checkmark/xmark with "Aktualisierung starten" + "Abbrechen" text buttons */
  showStartUpdateButton = input<boolean>(false);

  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() discard = new EventEmitter<void>();
  /** Emitted when the user clicks "Aktualisierung starten" (stub for S2, full flow in EID-6621) */
  @Output() startUpdate = new EventEmitter<void>();

  private readonly translateService = inject(TranslateService);

  /** Exposed for template use — iterates error key/i18n-key pairs on a FormField */
  readonly objectEntries = Object.entries;

  isReadOnlyType(type: FormField['type']): boolean {
    return type === 'readonly' || type === 'date' || type === 'datetime';
  }

  formatDatetime(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      return value;
    }
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  getTranslatedUrl(): string {
    const linkValue = this.link();
    return linkValue ? this.translateService.instant(linkValue.url) : '';
  }
}
