import * as fs from 'fs';
import {sync as globSync} from 'glob';
import {BUSINESS_ERROR_CODES, HTTP_ERROR_STATUSES} from '../app/core/interceptor/interceptor-utils';

/**
 * Recursively finds all keys in an object that have an empty string value ("").
 * Returns an array of "dot-notation" paths for those keys.
 *
 * @param {any} obj - The object, array, or value to check.
 * @param {string[]} currentPath - The path segments leading to this object.
 * @returns {string[]} - An array of paths where empty strings were found.
 */
const findEmptyStringKeys = (obj: object | string | [], currentPath: string[] = []): string[] => {
  let emptyKeyPaths: string[] = [];

  if (obj === '') {
    return [currentPath.join('.') || '(root)'];
  }

  // Recursive case: If it's an array, check every element
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const paths = findEmptyStringKeys(item, [...currentPath, String(index)]);
      emptyKeyPaths = [...emptyKeyPaths, ...paths];
    });
  }

  // Recursive case: If it's an object, check every value
  else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      // @ts-expect-error The type of `obj[key]` is not directly inferable as `obj` is typed as `object | string | []`.
      const paths = findEmptyStringKeys(obj[key], [...currentPath, key]);
      emptyKeyPaths = [...emptyKeyPaths, ...paths];
    });
  }

  // All other types (number, boolean, null, undefined) are ignored
  return emptyKeyPaths;
};

const i18nFilePattern = 'src/assets/i18n/*.json';
const i18nFiles: string[] = globSync(i18nFilePattern);
const businessCodes = BUSINESS_ERROR_CODES;

describe('i18n Translation Files (src/assets/i18n/)', () => {
  test('should find translation files', () => {
    expect(i18nFiles.length).toBeGreaterThan(0);
  });

  test.each(i18nFiles)('File: %s should not contain any empty strings ""', (filePath: string) => {
    let jsonData: unknown;

    const fileContent: string = fs.readFileSync(filePath, 'utf8');

    try {
      jsonData = JSON.parse(fileContent);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`Failed to parse JSON in ${filePath}: ${errorMessage}`);
    }

    // @ts-expect-error handling json is weird...
    const emptyKeys = findEmptyStringKeys(jsonData);

    expect(emptyKeys).toEqual([]);
  });

  test.each(i18nFiles)('File: %s should contain all business error translations', (filePath: string) => {
    const fileContent: string = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent) as Record<string, unknown>;

    for (const code of businessCodes) {
      expect(Object.prototype.hasOwnProperty.call(jsonData, `app_error_business_${code}_title`)).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(jsonData, `app_error_business_${code}_message`)).toBe(true);
    }
  });

  test.each(i18nFiles)('File: %s should contain required HTTP status error translations', (filePath: string) => {
    const fileContent: string = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent) as Record<string, unknown>;

    for (const status of HTTP_ERROR_STATUSES) {
      expect(Object.prototype.hasOwnProperty.call(jsonData, `app_error_http_${status}_title`)).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(jsonData, `app_error_http_${status}_message`)).toBe(true);
    }
  });
});
