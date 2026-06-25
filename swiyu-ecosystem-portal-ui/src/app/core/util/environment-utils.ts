export function parseEnvironmentUrl(baseUrl: string | undefined, protocol: string): URL | null {
  if (!baseUrl) {
    return null;
  }
  const urlWithProtocol = /^https?:\/\//.test(baseUrl) ? baseUrl : `${protocol}//${baseUrl}`;
  try {
    return new URL(urlWithProtocol);
  } catch {
    return null;
  }
}

export function isIntegrationEnvironment(
  integrationBaseUrl: string | undefined,
  location: {origin: string; protocol: string}
): boolean {
  if (!integrationBaseUrl) {
    return false;
  }
  return parseEnvironmentUrl(integrationBaseUrl, location.protocol)?.origin === location.origin;
}
