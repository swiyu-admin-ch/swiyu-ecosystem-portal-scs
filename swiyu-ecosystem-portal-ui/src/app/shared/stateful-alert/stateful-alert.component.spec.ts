import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {TranslateModule} from '@ngx-translate/core';
import {StatefulAlertComponent} from './stateful-alert.component';

describe('NotificationComponent', () => {
  let component: StatefulAlertComponent;
  let fixture: ComponentFixture<StatefulAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatefulAlertComponent, TranslateModule.forRoot(), MatIconTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StatefulAlertComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('storageKey', 'test');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
