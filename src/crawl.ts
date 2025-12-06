
import { JSDOM } from 'jsdom';

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

