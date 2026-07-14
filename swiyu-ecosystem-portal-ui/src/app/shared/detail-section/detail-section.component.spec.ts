import {Clipboard} from '@angular/cdk/clipboard';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl, FormGroup} from '@angular/forms';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {By} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';
import {ObNotificationService, WINDOW} from '@oblique/oblique';
import {DetailSectionComponent} from './detail-section.component';

describe('DetailSectionComponent', () => {
  let component: DetailSectionComponent;
  let fixture: ComponentFixture<DetailSectionComponent>;

  const mockObNotificationService = {
    success: jest.fn()
  };

  const mockClipboard = {
    copy: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconTestingModule, TranslateModule.forRoot(), DetailSectionComponent],
      providers: [
        {provide: ObNotificationService, useValue: mockObNotificationService},
        {provide: WINDOW, useValue: window},
        {provide: Clipboard, useValue: mockClipboard}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailSectionComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('title', 'Test Section');
    fixture.componentRef.setInput(
      'group',
      new FormGroup({
        testField: new FormControl('Test Value')
      })
    );
    fixture.componentRef.setInput('fields', [{key: 'testField', label: 'Test Label', type: 'text'}]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title', () => {
    const titleElement = fixture.debugElement.query(By.css('mat-card-title'));
    expect(titleElement.nativeElement.textContent).toContain('Test Section');
  });

  it('should display input field in edit mode', () => {
    fixture.componentRef.setInput('isEditing', true);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input'));
    expect(input).toBeTruthy();
    expect(input.nativeElement.value).toBe('Test Value');
  });
});
