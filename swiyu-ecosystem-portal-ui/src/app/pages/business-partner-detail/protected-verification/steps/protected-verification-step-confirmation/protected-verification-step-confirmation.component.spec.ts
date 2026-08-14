import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideObliqueTestingConfiguration} from '@oblique/oblique';
import {AppRoutes} from '../../../../../app.routes';
import {ProtectedVerificationWizardService} from '../../wizard/protected-verification-wizard.service';
import {ProtectedVerificationStepConfirmationComponent} from './protected-verification-step-confirmation.component';

describe('ProtectedVerificationStepConfirmationComponent', () => {
  let fixture: ComponentFixture<ProtectedVerificationStepConfirmationComponent>;
  let routerNavigateSpy: jest.SpyInstance;

  function setup(wizardServiceMock: {
    partnerId: string | null;
    submission: () => unknown;
    businessPartner: () => unknown;
  }) {
    TestBed.configureTestingModule({
      imports: [ProtectedVerificationStepConfirmationComponent, RouterModule.forRoot([]), TranslateModule.forRoot()],
      providers: [
        provideObliqueTestingConfiguration(),
        {provide: ProtectedVerificationWizardService, useValue: wizardServiceMock}
      ]
    });

    routerNavigateSpy = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ProtectedVerificationStepConfirmationComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('should create when a submission exists', () => {
    const component = setup({
      partnerId: 'partner-001',
      submission: () => ({id: 'pv-1'}),
      businessPartner: () => ({id: 'partner-001', name: 'Test Corp'})
    });

    expect(component).toBeTruthy();
    expect(routerNavigateSpy).not.toHaveBeenCalled();
  });

  it('validate() always resolves true', async () => {
    const component = setup({
      partnerId: 'partner-001',
      submission: () => ({id: 'pv-1'}),
      businessPartner: () => ({id: 'partner-001', name: 'Test Corp'})
    });

    expect(await component.validate()).toBe(true);
  });

  it('displays the selected business partner name', () => {
    setup({
      partnerId: 'partner-001',
      submission: () => ({id: 'pv-1'}),
      businessPartner: () => ({id: 'partner-001', name: 'Test Corp'})
    });

    expect(fixture.nativeElement.textContent).toContain('Test Corp');
  });

  it('redirects back to the category step when reached without a submission', () => {
    setup({
      partnerId: 'partner-001',
      submission: () => undefined,
      businessPartner: () => ({id: 'partner-001', name: 'Test Corp'})
    });

    expect(routerNavigateSpy).toHaveBeenCalledWith([
      ...AppRoutes.protectedVerificationWizard('partner-001'),
      'category'
    ]);
  });

  it('does not redirect when there is no submission but also no partnerId', () => {
    setup({
      partnerId: null,
      submission: () => undefined,
      businessPartner: () => undefined
    });

    expect(routerNavigateSpy).not.toHaveBeenCalled();
  });
});
