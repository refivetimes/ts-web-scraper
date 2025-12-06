import { JSDOM } from 'jsdom';
import pLimit from 'p-limit';

export function normalizeURL(url: string): string {
    const urlObj = new URL(url);
    
    // Remove trailing slash from pathname
    let pathname = urlObj.pathname;
    if (pathname === '/') {
        pathname = '';
    } else if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }
    
    // Reconstruct the URL with normalized pathname
    urlObj.pathname = pathname;
    
    // When pathname is empty, manually construct URL without trailing slash
    if (pathname === '') {
        let normalizedUrl = `${urlObj.protocol}//${urlObj.host}`;
        if (urlObj.search) {
            normalizedUrl += urlObj.search;
        }
        if (urlObj.hash) {
            normalizedUrl += urlObj.hash;
        }
        return normalizedUrl;
    }
    
    return urlObj.toString();
}

export function getH1FromHTML(html: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const h1Element = document.querySelector('h1');
    
    if (!h1Element) {
        return "";
    }
    
    return h1Element.textContent || "";
}

export function getFirstParagraphFromHTML(html: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const main = document.querySelector('main');
    let paragraph = null;

    if (!main) {
        paragraph = document.querySelector('p');
    } else {
        paragraph = main.querySelector('p');
    }
    
    if (!paragraph) {
        return "";
    }
    
    return paragraph.textContent || "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const anchors = document.querySelectorAll('a');
    const urls: string[] = [];
    
    for (let anchor of anchors) {
        const href = anchor.getAttribute("href");
 
        if (href === null) {
            continue;
        }
        
        try {
            let absoluteURL: string;
            
            if (href === "") {
                absoluteURL = baseURL;
            } else {
                const resolvedURL = new URL(href, baseURL);
                absoluteURL = resolvedURL.toString();
            }
            urls.push(absoluteURL);
        } catch (error) {
            continue;
        }
    }
    
    return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const imgs = document.querySelectorAll('img');
    const urls: string[] = [];
    
    for (let img of imgs) {
        const src = img.getAttribute("src");

        if (src === null) {
            continue;
        }
        
        try {
            let absoluteURL: string;
            
            if (src === "") {
                absoluteURL = baseURL;
            } else {
                const resolvedURL = new URL(src, baseURL);
                absoluteURL = resolvedURL.toString();
            }
            urls.push(absoluteURL);
        } catch (error) {
            continue;
        }
    }
    
    return urls;
}

export type ExtractedPageData = {
    url: string,
    h1: string,
    first_paragraph: string,
    outgoing_links: string [],
    image_urls: string [],
}

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
    const data = {
        url: normalizeURL(pageURL),
        h1: getH1FromHTML(html),
        first_paragraph: getFirstParagraphFromHTML(html),
        outgoing_links: getURLsFromHTML(html, pageURL),
        image_urls: getImagesFromHTML(html, pageURL),
    }
    return data;
}

export async function getHTML(url: string): Promise<string | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'BootCrawler/1.0'
            }
        });

        // Check for HTTP status codes (400+)
        if (response.status >= 400) {
            console.error(`Error fetching ${url}: HTTP ${response.status} ${response.statusText}`);
            return null;
        }

        // Check content-type header
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
            console.error(`Error fetching ${url}: Expected text/html but got ${contentType || 'unknown'}`);
            return null;
        }

        // Return HTML body as string
        const html = await response.text();
        //console.log(html);
        return html;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error instanceof Error ? error.message : String(error));
        return null;
    }
}

export async function crawlPage(
    baseURL: string,
    currentURL: string = baseURL,
    pages: Record<string, number> = {},
): Promise<Record<string, number>> {
    const baseURLObj = new URL(baseURL);
    const currURLObj = new URL(currentURL);
    
    if (baseURLObj.hostname !== currURLObj.hostname) {
        return pages;
    }
    
    const currNormal = normalizeURL(currentURL);
    
    if (currNormal in pages) {
        pages[currNormal]++;
        return pages;
    }
    
    pages[currNormal] = 1;
    
    const html = await getHTML(currentURL);
    if (html !== null) {
        const newUrls = getURLsFromHTML(html, currentURL);
        
        for (const url of newUrls) {
            await crawlPage(baseURL, url, pages);
        }
    }
    
    return pages;
}

export class ConcurrentCrawler {
    baseURL: string;
    pages: Record<string, number>;
    limit: ReturnType<typeof pLimit>;
    maxPages: number;
    shouldStop: boolean;
    allTasks: Set<Promise<void>>;
    private abortController: AbortController;;

    constructor(baseURL: string, pages: Record<string, number> = {}, maxConcurrency: number = 1, maxPages: number = 50) {
        this.baseURL = baseURL;
        this.pages = pages;
        this.limit = pLimit(maxConcurrency);
        this.maxPages = maxPages;
        this.shouldStop = false;
        this.allTasks = new Set();
        this.abortController = new AbortController();
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop) {
            return false;
        }
        if (Object.keys(this.pages).length >= this.maxPages) {
            this.shouldStop = true;
            console.log("Reached maximum number of pages to crawl.");
            this.abortController.abort();
            return false;
          }
        if (normalizedURL in this.pages) {
            this.pages[normalizedURL]++;
            return false;
        } else {
            this.pages[normalizedURL] = 1;
            return true;
        }
    }

    async getHTML(url: string): Promise<string> {
        return await this.limit(async () => {
            try {
                const response = await fetch(url, {
                    signal: this.abortController.signal,
                    headers: {
                        'User-Agent': 'BootCrawler/1.0'
                    }
                });

                // Check for HTTP status codes (400+)
                if (response.status >= 400) {
                    const errorMessage = `Error fetching ${url}: HTTP ${response.status} ${response.statusText}`;
                    console.error(errorMessage);
                    throw new Error(errorMessage);
                }

                // Check content-type header
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('text/html')) {
                    const errorMessage = `Error fetching ${url}: Expected text/html but got ${contentType || 'unknown'}`;
                    console.error(errorMessage);
                    throw new Error(errorMessage);
                }

                // Return HTML body as string
                return await response.text();
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error fetching ${url}:`, error.message);
                    throw error;
                }
                const errorMessage = `Error fetching ${url}: ${String(error)}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        });
    }

    async crawlPage(currentURL: string = this.baseURL): Promise<void> {

        if (this.shouldStop) {
            return;
        }
        const baseURLObj = new URL(this.baseURL);
        const currURLObj = new URL(currentURL);
        
        // If current URL is from a different domain, don't crawl it
        if (baseURLObj.hostname !== currURLObj.hostname) {
            return;
        }

        const currNormal = normalizeURL(currentURL);

        if (!this.addPageVisit(currNormal)) {
            return;
        }
        
        try {
            const html = await this.getHTML(currentURL);
            const newUrls = getURLsFromHTML(html, currentURL);
            const crawlPromises = newUrls.map(nextURL => this.crawlPage(nextURL));
            await Promise.all(crawlPromises);
        } catch (error) {
            // Error already logged in getHTML, continue crawling other pages
        }
    }

    async crawl(): Promise<Record<string, number>> {
        await this.crawlPage(this.baseURL);
        return this.pages;
    }
}

export async function crawlSiteAsync(baseURL: string, maxConcurrency: number = 5, maxPages: number = 50): Promise<Record<string, number>> {
    const crawler = new ConcurrentCrawler(baseURL, {}, maxConcurrency, maxPages);
    return await crawler.crawl();
}