import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {By} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';

import {UploadComponent} from './upload.component';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadComponent, TranslateModule.forRoot(), MatIconTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows spinner while upload is in progress', () => {
    fixture.componentRef.setInput('uploadItem', {
      file: new File(['dummy'], 'document.pdf', {type: 'application/pdf'}),
      state: 'uploading'
    });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('ob-spinner'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[aria-label="eportal_global_retry"]'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[aria-label="eportal_global_remove"]'))).toBeFalsy();
  });

  it('shows retry and remove actions when upload failed', () => {
    fixture.componentRef.setInput('uploadItem', {
      file: new File(['dummy'], 'document.pdf', {type: 'application/pdf'}),
      state: 'error'
    });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('ob-spinner'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[aria-label="eportal_global_retry"]'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('[aria-label="eportal_global_remove"]'))).toBeTruthy();
  });

  it('shows uploaded file without status actions when upload succeeded', () => {
    fixture.componentRef.setInput('uploadItem', {
      file: new File(['dummy'], 'document.pdf', {type: 'application/pdf'}),
      state: 'success'
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('document.pdf');
    expect(fixture.debugElement.query(By.css('ob-spinner'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[aria-label="eportal_global_retry"]'))).toBeFalsy();
    expect(fixture.debugElement.query(By.css('[aria-label="eportal_global_remove"]'))).toBeFalsy();
  });
});
