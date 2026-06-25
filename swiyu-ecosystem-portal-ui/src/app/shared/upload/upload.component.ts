import {Component, input, output} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {
  ObButtonDirective,
  ObDropZoneComponent,
  ObEUploadEventType,
  ObIUploadEvent,
  ObSpinnerComponent
} from '@oblique/oblique';

export interface UploadedFile {
  id?: string;
  name?: string;
  canBeDeleted?: boolean;
}

export interface UploadItem {
  file: File;
  state: 'uploading' | 'success' | 'error';
}

@Component({
  selector: 'app-upload',
  imports: [
    MatIcon,
    MatIconButton,
    MatTooltip,
    ObButtonDirective,
    ObDropZoneComponent,
    ObSpinnerComponent,
    TranslatePipe
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  readonly uploadedFiles = input<UploadedFile[]>([]);
  readonly uploadItem = input<UploadItem | undefined>(undefined);

  readonly filesChosen = output<File>();
  readonly retryUpload = output<void>();
  readonly removeUpload = output<void>();
  readonly deleteDocument = output<UploadedFile>();

  onFilesChosen(event: ObIUploadEvent): void {
    if (event.type !== ObEUploadEventType.CHOSEN) {
      return;
    }
    const files = event.files as File[];
    const file = files[0];
    if (file) {
      this.filesChosen.emit(file);
    }
  }
}
