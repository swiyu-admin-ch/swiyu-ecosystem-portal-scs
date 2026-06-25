import {isIntegrationEnvironment, parseEnvironmentUrl} from './environment-utils';

describe('parseEnvironmentUrl', () => {
  it('should return a URL when given a full URL with protocol', () => {
    const result = parseEnvironmentUrl('https://example.com', 'https:');
    expect(result?.origin).toBe('https://example.com');
  });

  it('should prepend protocol when URL has no protocol', () => {
    const result = parseEnvironmentUrl('example.com', 'https:');
    expect(result?.origin).toBe('https://example.com');
  });

  it('should use the provided protocol when prepending', () => {
    const result = parseEnvironmentUrl('example.com', 'http:');
    expect(result?.origin).toBe('http://example.com');
  });

  it('should return null for undefined baseUrl', () => {
    expect(parseEnvironmentUrl(undefined, 'https:')).toBeNull();
  });

  it('should return null for an invalid URL', () => {
    expect(parseEnvironmentUrl('not a valid url ://', 'https:')).toBeNull();
  });
});

describe('isIntegrationEnvironment', () => {
  const location = {origin: 'https://integration.example.com', protocol: 'https:'};

  it('should return true when current origin matches integration base URL', () => {
    expect(isIntegrationEnvironment('https://integration.example.com', location)).toBe(true);
  });

  it('should return true when integration base URL has no protocol and matches current origin', () => {
    expect(isIntegrationEnvironment('integration.example.com', location)).toBe(true);
  });

  it('should return false when current origin does not match integration base URL', () => {
    expect(isIntegrationEnvironment('https://primary.example.com', location)).toBe(false);
  });

  it('should return false when integrationBaseUrl is undefined', () => {
    expect(isIntegrationEnvironment(undefined, location)).toBe(false);
  });

  it('should return false when integrationBaseUrl is an invalid URL', () => {
    expect(isIntegrationEnvironment('not a valid url ://', location)).toBe(false);
  });
});
