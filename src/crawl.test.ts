import { test, expect } from 'vitest';
import { normalizeURL, getH1FromHTML, getFirstParagraphFromHTML, getURLsFromHTML, getImagesFromHTML } from './crawl';

test('normalizeURL should remove trailing slash from URL', () => {
    const input = 'https://example.com/path/';
    const expected = 'https://example.com/path';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should keep root domain without trailing slash', () => {
    const input = 'https://example.com/';
    const expected = 'https://example.com';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should remove trailing slash from URL with multiple paths', () => {
    const input = 'https://example.com/path/to/page/';
    const expected = 'https://example.com/path/to/page';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should normalize HTTP URLs', () => {
    const input = 'http://example.com/path/';
    const expected = 'http://example.com/path';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should handle URLs without trailing slash (already normalized)', () => {
    const input = 'https://example.com/path';
    const expected = 'https://example.com/path';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should handle URLs with query parameters', () => {
    const input = 'https://example.com/path/?param=value';
    const expected = 'https://example.com/path?param=value';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should handle URLs with multiple query parameters', () => {
    const input = 'https://example.com/path/?param1=value1&param2=value2';
    const expected = 'https://example.com/path?param1=value1&param2=value2';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should handle URLs with ports', () => {
    const input = 'https://example.com:8080/path/';
    const expected = 'https://example.com:8080/path';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should handle URLs with hash fragments', () => {
    const input = 'https://example.com/path/#section';
    const expected = 'https://example.com/path#section';
    expect(normalizeURL(input)).toBe(expected);
});

test('normalizeURL should handle complex URLs with all components', () => {
    const input = 'https://example.com:8080/path/to/page/?param=value#section';
    const expected = 'https://example.com:8080/path/to/page?param=value#section';
    expect(normalizeURL(input)).toBe(expected);
});

test('getH1FromHTML should extract h1 text from basic HTML', () => {
    const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
    const actual = getH1FromHTML(inputBody);
    const expected = "Test Title";
    expect(actual).toEqual(expected);
});

test('getH1FromHTML should extract h1 text with nested elements', () => {
    const inputBody = `<html><body><h1>Test <span>Title</span></h1></body></html>`;
    const actual = getH1FromHTML(inputBody);
    const expected = "Test Title";
    expect(actual).toEqual(expected);
});

test('getH1FromHTML should return first h1 when multiple h1s exist', () => {
    const inputBody = `<html><body><h1>First Title</h1><h1>Second Title</h1></body></html>`;
    const actual = getH1FromHTML(inputBody);
    const expected = "First Title";
    expect(actual).toEqual(expected);
});

test('getH1FromHTML should handle h1 with whitespace', () => {
    const inputBody = `<html><body><h1>   Test Title   </h1></body></html>`;
    const actual = getH1FromHTML(inputBody);
    const expected = "Test Title";
    expect(actual.trim()).toBe("Test Title");
});

test('getH1FromHTML should handle empty h1', () => {
    const inputBody = `<html><body><h1></h1></body></html>`;
    const actual = getH1FromHTML(inputBody);
    expect(actual).toBe("");
});

test('getH1FromHTML should handle HTML without h1', () => {
    const inputBody = `<html><body><p>No heading here</p></body></html>`;
    const actual = getH1FromHTML(inputBody);
    expect(actual).toBe("");
});

test('getFirstParagraphFromHTML should prefer paragraph inside main over outside', () => {
    const inputBody = `
      <html><body>
        <p>Outside paragraph.</p>
        <main>
          <p>Main paragraph.</p>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "Main paragraph.";
    expect(actual).toEqual(expected);
});

test('getFirstParagraphFromHTML should return first paragraph from main when multiple paragraphs in main', () => {
    const inputBody = `
      <html><body>
        <p>Outside paragraph.</p>
        <main>
          <p>First main paragraph.</p>
          <p>Second main paragraph.</p>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "First main paragraph.";
    expect(actual).toEqual(expected);
});

test('getFirstParagraphFromHTML should return first paragraph outside when no main exists', () => {
    const inputBody = `
      <html><body>
        <p>First outside paragraph.</p>
        <p>Second outside paragraph.</p>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "First outside paragraph.";
    expect(actual).toEqual(expected);
});

test('getFirstParagraphFromHTML should handle paragraph with nested elements', () => {
    const inputBody = `
      <html><body>
        <main>
          <p>Main <strong>paragraph</strong> with <em>formatting</em>.</p>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "Main paragraph with formatting.";
    expect(actual).toEqual(expected);
});

test('getFirstParagraphFromHTML should handle paragraph with whitespace', () => {
    const inputBody = `
      <html><body>
        <main>
          <p>   Main paragraph with whitespace.   </p>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    expect(actual.trim()).toBe("Main paragraph with whitespace.");
});

test('getFirstParagraphFromHTML should handle empty paragraph', () => {
    const inputBody = `
      <html><body>
        <main>
          <p></p>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    expect(actual).toBe("");
});

test('getFirstParagraphFromHTML should return empty string when no paragraphs exist', () => {
    const inputBody = `
      <html><body>
        <main>
          <div>No paragraphs here</div>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    expect(actual).toBe("");
});

test('getFirstParagraphFromHTML should prioritize main over article', () => {
    const inputBody = `
      <html><body>
        <article>
          <p>Article paragraph.</p>
        </article>
        <main>
          <p>Main paragraph.</p>
        </main>
      </body></html>
    `;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "Main paragraph.";
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should extract absolute URLs from anchor tags', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><a href="https://blog.boot.dev"><span>Boot.dev</span></a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should convert relative URLs to absolute URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><a href="/path/to/page">Link</a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/path/to/page"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle relative URLs without leading slash', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><a href="path/to/page">Link</a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/path/to/page"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should extract multiple URLs from multiple anchor tags', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <a href="https://example.com">External</a>
        <a href="/internal">Internal</a>
        <a href="relative">Relative</a>
      </body></html>
    `;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://example.com", "https://blog.boot.dev/internal", "https://blog.boot.dev/relative"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle anchor tags without href attribute', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><a>No href link</a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected: string[] = [];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle empty href attributes', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><a href="">Empty href</a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle HTML without anchor tags', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><p>No links here</p></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected: string[] = [];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle fragment-only URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><a href="#section">Section</a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev#section"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle mixed absolute and relative URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <a href="https://external.com">External</a>
        <a href="/local">Local</a>
        <a href="https://blog.boot.dev/same-domain">Same Domain</a>
      </body></html>
    `;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://external.com", "https://blog.boot.dev/local", "https://blog.boot.dev/same-domain"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle base URL with path', () => {
    const inputURL = "https://blog.boot.dev/posts";
    const inputBody = `<html><body><a href="article">Article</a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/posts/article"];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should convert relative image URLs to absolute URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/logo.png"];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should extract absolute image URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><img src="https://example.com/image.jpg" alt="Image"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://example.com/image.jpg"];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle relative image URLs without leading slash', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><img src="images/photo.png" alt="Photo"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/images/photo.png"];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should extract multiple images from multiple img tags', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <img src="https://example.com/image1.jpg" alt="Image 1">
        <img src="/image2.png" alt="Image 2">
        <img src="images/image3.gif" alt="Image 3">
      </body></html>
    `;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = [
      "https://example.com/image1.jpg",
      "https://blog.boot.dev/image2.png",
      "https://blog.boot.dev/images/image3.gif"
    ];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle img tags without src attribute', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><img alt="No src"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected: string[] = [];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle empty src attributes', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><img src="" alt="Empty src"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev"];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle HTML without img tags', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><p>No images here</p></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected: string[] = [];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle mixed absolute and relative image URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <img src="https://cdn.example.com/image.jpg" alt="CDN Image">
        <img src="/local/image.png" alt="Local Image">
        <img src="https://blog.boot.dev/same-domain/image.gif" alt="Same Domain">
      </body></html>
    `;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = [
      "https://cdn.example.com/image.jpg",
      "https://blog.boot.dev/local/image.png",
      "https://blog.boot.dev/same-domain/image.gif"
    ];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle base URL with path', () => {
    const inputURL = "https://blog.boot.dev/posts";
    const inputBody = `<html><body><img src="thumbnail.jpg" alt="Thumbnail"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/posts/thumbnail.jpg"];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle data URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><img src="data:image/png;base64,iVBORw0KGgo=" alt="Data Image"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["data:image/png;base64,iVBORw0KGgo="];
  
    expect(actual).toEqual(expected);
});