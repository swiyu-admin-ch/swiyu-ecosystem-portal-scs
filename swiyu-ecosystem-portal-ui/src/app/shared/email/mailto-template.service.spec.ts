import {DOCUMENT} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {TranslateService} from '@ngx-translate/core';
import {MailtoTemplateService} from './mailto-template.service';

describe('MailtoTemplateService', () => {
  let service: MailtoTemplateService;
  const translateServiceMock = {
    instant: jest.fn()
  };
  const documentMock = {
    location: {
      href: 'https://service.example/handover/path',
      origin: 'https://service.example'
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MailtoTemplateService,
        {provide: TranslateService, useValue: translateServiceMock},
        {provide: DOCUMENT, useValue: documentMock}
      ]
    });

    service = TestBed.inject(MailtoTemplateService);
  });

  it('builds encoded mailto link with translated subject and body', () => {
    translateServiceMock.instant.mockImplementation((key: string, params?: Record<string, string>) => {
      if (key === 'subject.key') {
        return 'Subject with spaces';
      }
      if (key === 'body.key' && params && params['handoverUrl'] && params['servicePortalUrl']) {
        return `Body ${params['handoverUrl']} ${params['servicePortalUrl']}`;
      }
      return key;
    });

    const result = service.buildHandoverMailtoLink({
      subjectKey: 'subject.key',
      bodyKey: 'body.key'
    });

    expect(result).toBe(
      `mailto:?subject=${encodeURIComponent('Subject with spaces')}&body=${encodeURIComponent(
        `Body ${documentMock.location.href} ${documentMock.location.origin}`
      )}`
    );
  });
});
