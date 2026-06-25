export interface ExplainerStep {
  title: string;
  step: string;
  hint: string;
  links: ExplainerStepLink[];
}

export interface ExplainerStepLink {
  title: string;
  url: string;
}

export enum SetupVariant {
  EXPERT = 'expert',
  SELF = 'self'
}
