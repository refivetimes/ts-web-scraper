
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