import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {RadioCardComponent} from './radio-card.component';

describe('RadioCardComponent', () => {
  let component: RadioCardComponent;
  let fixture: ComponentFixture<RadioCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RadioCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataCy', 'radio-card-test');
    fixture.componentRef.setInput('value', 'option-a');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sets aria-checked to false by default', () => {
    const card = fixture.debugElement.query(By.css('mat-card')).nativeElement as HTMLElement;

    expect(card.getAttribute('aria-checked')).toBe('false');
  });

  it('sets aria-checked to true when checked', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('mat-card')).nativeElement as HTMLElement;

    expect(card.getAttribute('aria-checked')).toBe('true');
  });

  it('emits cardSelect on click when card is not selected', () => {
    const cardSelectSpy = jest.spyOn(component.cardSelect, 'emit');

    const card = fixture.debugElement.query(By.css('mat-card'));
    card.triggerEventHandler('click');

    expect(cardSelectSpy).toHaveBeenCalledTimes(1);
  });

  it('does not emit cardSelect on click when card is already selected', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const cardSelectSpy = jest.spyOn(component.cardSelect, 'emit');

    const card = fixture.debugElement.query(By.css('mat-card'));
    card.triggerEventHandler('click');

    expect(cardSelectSpy).not.toHaveBeenCalled();
  });

  it('emits cardSelect on Enter when card is not selected', () => {
    const cardSelectSpy = jest.spyOn(component.cardSelect, 'emit');

    const card = fixture.debugElement.query(By.css('mat-card'));
    card.triggerEventHandler('keydown', new KeyboardEvent('keydown', {key: 'Enter'}));

    expect(cardSelectSpy).toHaveBeenCalledTimes(1);
  });

  it('does not emit cardSelect on Space when card is already selected', () => {
    fixture.componentRef.setInput('checked', true);
    fixture.detectChanges();

    const cardSelectSpy = jest.spyOn(component.cardSelect, 'emit');

    const card = fixture.debugElement.query(By.css('mat-card'));
    card.triggerEventHandler('keydown', new KeyboardEvent('keydown', {key: ' '}));

    expect(cardSelectSpy).not.toHaveBeenCalled();
  });
});
