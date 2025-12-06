import { argv, exit } from 'node:process';
import { getHTML, crawlSiteAsync} from './crawl';

async function main() {
    // argv[0] is node executable, argv[1] is script path, argv[2+] are arguments
    if (argv.length < 5) {
        console.error("Error: Base URL argument required");
        exit(1);
    }

    if (argv.length > 5) {
        console.error("Error: Too many arguments");
        exit(1);
    }

    const BASE_URL = argv[2];
    const maxConcurrency = Number(argv[3]);
    const maxPages = Number(argv[4]);

    console.log(`Crawler starting at ${BASE_URL}`);
    const pages = await crawlSiteAsync(BASE_URL, maxConcurrency, maxPages);
    console.log(pages);
    
    exit(0);
}

main();