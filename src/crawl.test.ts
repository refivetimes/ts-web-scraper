import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeURL, getH1FromHTML, getFirstParagraphFromHTML, getURLsFromHTML, getImagesFromHTML, extractPageData, getHTML, crawlPage } from './crawl';

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
    const expected = ["https://blog.boot.dev/"];
  
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
    const expected = ["https://example.com/", "https://blog.boot.dev/internal", "https://blog.boot.dev/relative"];
  
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
    const expected = ["https://blog.boot.dev/#section"];
  
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
    const expected = ["https://external.com/", "https://blog.boot.dev/local", "https://blog.boot.dev/same-domain"];
  
    expect(actual).toEqual(expected);
});

test('getURLsFromHTML should handle base URL with path', () => {
    const inputURL = "https://blog.boot.dev/posts";
    const inputBody = `<html><body><a href="article">Article</a></body></html>`;
  
    const actual = getURLsFromHTML(inputBody, inputURL);
    const expected = ["https://blog.boot.dev/article"];
  
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
    const expected = ["https://blog.boot.dev/thumbnail.jpg"];
  
    expect(actual).toEqual(expected);
});

test('getImagesFromHTML should handle data URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body><img src="data:image/png;base64,iVBORw0KGgo=" alt="Data Image"></body></html>`;
  
    const actual = getImagesFromHTML(inputBody, inputURL);
    const expected = ["data:image/png;base64,iVBORw0KGgo="];
  
    expect(actual).toEqual(expected);
});

test('extractPageData should extract all page data from basic HTML', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>This is the first paragraph.</p>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: ["https://blog.boot.dev/link1"],
      image_urls: ["https://blog.boot.dev/image1.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle missing h1', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <p>This is the first paragraph.</p>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: ["https://blog.boot.dev/link1"],
      image_urls: ["https://blog.boot.dev/image1.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle missing paragraph', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "",
      outgoing_links: ["https://blog.boot.dev/link1"],
      image_urls: ["https://blog.boot.dev/image1.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should return empty arrays when no links or images exist', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>This is the first paragraph.</p>
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: [],
      image_urls: [],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should extract multiple links and images', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>This is the first paragraph.</p>
        <a href="/link1">Link 1</a>
        <a href="https://external.com">External</a>
        <a href="relative">Relative</a>
        <img src="/image1.jpg" alt="Image 1">
        <img src="https://cdn.example.com/image2.png" alt="Image 2">
        <img src="images/local.gif" alt="Local">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: ["https://blog.boot.dev/link1", "https://external.com/", "https://blog.boot.dev/relative"],
      image_urls: ["https://blog.boot.dev/image1.jpg", "https://cdn.example.com/image2.png", "https://blog.boot.dev/images/local.gif"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should prefer paragraph in main over outside', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>Outside paragraph.</p>
        <main>
          <p>Main paragraph.</p>
        </main>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "Main paragraph.",
      outgoing_links: ["https://blog.boot.dev/link1"],
      image_urls: ["https://blog.boot.dev/image1.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle empty HTML', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `<html><body></body></html>`;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "",
      first_paragraph: "",
      outgoing_links: [],
      image_urls: [],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle links without href and images without src', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>This is the first paragraph.</p>
        <a>Link without href</a>
        <a href="/valid">Valid link</a>
        <img alt="Image without src">
        <img src="/valid.jpg" alt="Valid image">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: ["https://blog.boot.dev/valid"],
      image_urls: ["https://blog.boot.dev/valid.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle mixed absolute and relative URLs', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>This is the first paragraph.</p>
        <a href="https://example.com">Absolute</a>
        <a href="/relative">Relative</a>
        <img src="https://cdn.example.com/image.jpg" alt="Absolute">
        <img src="/relative.png" alt="Relative">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: ["https://example.com/", "https://blog.boot.dev/relative"],
      image_urls: ["https://cdn.example.com/image.jpg", "https://blog.boot.dev/relative.png"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle base URL with path', () => {
    const inputURL = "https://blog.boot.dev/posts";
    const inputBody = `
      <html><body>
        <h1>Post Title</h1>
        <p>Post content.</p>
        <a href="next">Next post</a>
        <img src="thumbnail.jpg" alt="Thumbnail">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev/posts",
      h1: "Post Title",
      first_paragraph: "Post content.",
      outgoing_links: ["https://blog.boot.dev/next"],
      image_urls: ["https://blog.boot.dev/thumbnail.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle h1 with nested elements', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test <span>Title</span> with <em>formatting</em></h1>
        <p>This is the first paragraph.</p>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title with formatting",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: ["https://blog.boot.dev/link1"],
      image_urls: ["https://blog.boot.dev/image1.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('extractPageData should handle paragraph with nested elements', () => {
    const inputURL = "https://blog.boot.dev";
    const inputBody = `
      <html><body>
        <h1>Test Title</h1>
        <p>This is <strong>the first</strong> paragraph with <em>formatting</em>.</p>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body></html>
    `;
  
    const actual = extractPageData(inputBody, inputURL);
    const expected = {
      url: "https://blog.boot.dev",
      h1: "Test Title",
      first_paragraph: "This is the first paragraph with formatting.",
      outgoing_links: ["https://blog.boot.dev/link1"],
      image_urls: ["https://blog.boot.dev/image1.jpg"],
    };
  
    expect(actual).toEqual(expected);
});

test('getHTML should fetch and return HTML for valid URL', async () => {
    vi.restoreAllMocks();
    
    const mockHTML = '<html><body><h1>Test</h1></body></html>';
    const mockResponse = {
        status: 200,
        headers: new Headers({ 'content-type': 'text/html; charset=utf-8' }),
        text: vi.fn().mockResolvedValue(mockHTML),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

    const result = await getHTML('https://example.com');

    expect(result).toBe(mockHTML);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com', {
        headers: { 'User-Agent': 'BootCrawler/1.0' },
    });
});

test('getHTML should return null for HTTP 404 error', async () => {
    vi.restoreAllMocks();
    const mockResponse = {
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'text/html' }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getHTML('https://example.com/notfound');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching')
    );

    consoleSpy.mockRestore();
});

test('getHTML should return null for HTTP 500 error', async () => {
    vi.restoreAllMocks();
    const mockResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'text/html' }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getHTML('https://example.com/error');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching')
    );

    consoleSpy.mockRestore();
});

test('getHTML should return null for non-HTML content type', async () => {
    vi.restoreAllMocks();
    const mockResponse = {
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: vi.fn().mockResolvedValue('{"data": "test"}'),
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getHTML('https://example.com/api/data');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching')
    );

    consoleSpy.mockRestore();
});

test('getHTML should return null when content-type header is missing', async () => {
    vi.restoreAllMocks();
        const mockResponse = {
            status: 200,
            headers: new Headers(),
            text: vi.fn().mockResolvedValue('some content'),
        };

        global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await getHTML('https://example.com/no-content-type');

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
});

test('getHTML should handle network errors', async () => {
    vi.restoreAllMocks();
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await getHTML('https://example.com');

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error fetching'),
            expect.any(String)
        );

    consoleSpy.mockRestore();
});

test('getHTML should set User-Agent header', async () => {
    vi.restoreAllMocks();
        const mockHTML = '<html><body>Test</body></html>';
        const mockResponse = {
            status: 200,
            headers: new Headers({ 'content-type': 'text/html' }),
            text: vi.fn().mockResolvedValue(mockHTML),
        };

        global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

        await getHTML('https://example.com');

    expect(global.fetch).toHaveBeenCalledWith('https://example.com', {
        headers: { 'User-Agent': 'BootCrawler/1.0' },
    });
});

test('crawlPage should crawl a single page', async () => {
    vi.restoreAllMocks();
        const mockHTML = `
            <html>
                <body>
                    <h1>Page 1</h1>
                    <a href="/page2">Link to Page 2</a>
                </body>
            </html>
        `;

        const mockResponse = {
            status: 200,
            headers: new Headers({ 'content-type': 'text/html' }),
            text: vi.fn().mockResolvedValue(mockHTML),
        };

        global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

        const result = await crawlPage('https://example.com', 'https://example.com');

        expect(result).toHaveProperty('https://example.com');
        expect(result['https://example.com']).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com', expect.any(Object));
});

test('crawlPage should not crawl pages from different domains', async () => {
    vi.restoreAllMocks();
    const mockFetch = vi.fn();
    global.fetch = mockFetch;
    
    const result = await crawlPage('https://example.com', 'https://different-domain.com');

    expect(result).toEqual({});
    expect(mockFetch).not.toHaveBeenCalled();
});

test('crawlPage should increment count for duplicate URLs', async () => {
    vi.restoreAllMocks();
        const mockHTML1 = '<html><body><a href="/page2">Link</a></body></html>';
        const mockHTML2 = '<html><body><a href="https://example.com">Back</a></body></html>';

        let callCount = 0;
        global.fetch = vi.fn().mockImplementation(() => {
            callCount++;
            const mockHTML = callCount === 1 ? mockHTML1 : mockHTML2;
            return Promise.resolve({
                status: 200,
                headers: new Headers({ 'content-type': 'text/html' }),
                text: vi.fn().mockResolvedValue(mockHTML),
            } as unknown as Response);
        });

        const result = await crawlPage('https://example.com');

    expect(result['https://example.com']).toBeGreaterThan(1);
});

test('crawlPage should crawl multiple linked pages', async () => {
    vi.restoreAllMocks();
        const mockHTML1 = '<html><body><a href="/page2">Link</a></body></html>';
        const mockHTML2 = '<html><body><a href="/page3">Link</a></body></html>';
        const mockHTML3 = '<html><body>Page 3</body></html>';

        let callCount = 0;
        global.fetch = vi.fn().mockImplementation((url: string) => {
            callCount++;
            let mockHTML: string;
            if (url === 'https://example.com' || url === 'https://example.com/') {
                mockHTML = mockHTML1;
            } else if (url === 'https://example.com/page2') {
                mockHTML = mockHTML2;
            } else {
                mockHTML = mockHTML3;
            }
            return Promise.resolve({
                status: 200,
                headers: new Headers({ 'content-type': 'text/html' }),
                text: vi.fn().mockResolvedValue(mockHTML),
            } as unknown as Response);
        });

        const result = await crawlPage('https://example.com');

    expect(Object.keys(result).length).toBeGreaterThan(1);
    expect(global.fetch).toHaveBeenCalledTimes(3);
});

test('crawlPage should handle pages with no links', async () => {
    vi.restoreAllMocks();
        const mockHTML = '<html><body><h1>No links here</h1></body></html>';

        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            headers: new Headers({ 'content-type': 'text/html' }),
            text: vi.fn().mockResolvedValue(mockHTML),
        } as unknown as Response);

        const result = await crawlPage('https://example.com');

        expect(result).toHaveProperty('https://example.com');
        expect(result['https://example.com']).toBe(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('crawlPage should skip pages that return null from getHTML', async () => {
    vi.restoreAllMocks();
        global.fetch = vi.fn().mockResolvedValue({
            status: 404,
            statusText: 'Not Found',
            headers: new Headers({ 'content-type': 'text/html' }),
        } as unknown as Response);

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await crawlPage('https://example.com');

        expect(result).toHaveProperty('https://example.com');
        expect(result['https://example.com']).toBe(1);
        expect(global.fetch).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
});

test('crawlPage should normalize URLs when tracking', async () => {
    vi.restoreAllMocks();
        const mockHTML = '<html><body><a href="/page">Link</a></body></html>';

        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            headers: new Headers({ 'content-type': 'text/html' }),
            text: vi.fn().mockResolvedValue(mockHTML),
        } as unknown as Response);

        const result = await crawlPage('https://example.com/');

    // Both URLs should be normalized (no trailing slash)
    const keys = Object.keys(result);
    keys.forEach(key => {
        expect(key).not.toMatch(/\/$/);
    });
});