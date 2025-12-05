import { describe, it, expect } from 'vitest';
import { normalizeURL } from './crawl';

describe('normalizeURL', () => {
    it('should remove trailing slash from URL', () => {
        const input = 'https://example.com/path/';
        const expected = 'https://example.com/path';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should keep root domain without trailing slash', () => {
        const input = 'https://example.com/';
        const expected = 'https://example.com';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should remove trailing slash from URL with multiple paths', () => {
        const input = 'https://example.com/path/to/page/';
        const expected = 'https://example.com/path/to/page';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should normalize HTTP URLs', () => {
        const input = 'http://example.com/path/';
        const expected = 'http://example.com/path';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should handle URLs without trailing slash (already normalized)', () => {
        const input = 'https://example.com/path';
        const expected = 'https://example.com/path';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should handle URLs with query parameters', () => {
        const input = 'https://example.com/path/?param=value';
        const expected = 'https://example.com/path?param=value';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should handle URLs with multiple query parameters', () => {
        const input = 'https://example.com/path/?param1=value1&param2=value2';
        const expected = 'https://example.com/path?param1=value1&param2=value2';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should handle URLs with ports', () => {
        const input = 'https://example.com:8080/path/';
        const expected = 'https://example.com:8080/path';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should handle URLs with hash fragments', () => {
        const input = 'https://example.com/path/#section';
        const expected = 'https://example.com/path#section';
        expect(normalizeURL(input)).toBe(expected);
    });

    it('should handle complex URLs with all components', () => {
        const input = 'https://example.com:8080/path/to/page/?param=value#section';
        const expected = 'https://example.com:8080/path/to/page?param=value#section';
        expect(normalizeURL(input)).toBe(expected);
    });
});

