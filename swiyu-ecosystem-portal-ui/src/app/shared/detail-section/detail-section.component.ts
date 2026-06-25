import {CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, input, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ObButtonDirective, ObExternalLinkModule, ObUnsavedChangesDirective} from '@oblique/oblique';
import {ClipboardComponent} from '../clipboard/clipboard.component';
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
    TranslatePipe,
    ObButtonDirective,
    ObExternalLinkModule,
    ClipboardComponent,
    ObUnsavedChangesDirective
  ]
})
export class DetailSectionComponent {
  title = input.required<string>();
  group = input.required<FormGroup>();
  fields = input.required<FormField[]>();
  isEditing = input<boolean>(false);
  editable = input<boolean>(false);
  link = input<SectionLink>();
  @Output() edit = new EventEmitter<void>();
  private readonly translateService = inject(TranslateService);

  getTranslatedUrl(): string {
    const linkValue = this.link();
    return linkValue ? this.translateService.instant(linkValue.url) : '';
  }
}
