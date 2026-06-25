export interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'readonly' | 'array';
  canCopy?: boolean;
}

export interface SectionLink {
  label: string; // Translation key for link text
  url: string; // Translation key for URL (will be translated to get actual URL)
}
