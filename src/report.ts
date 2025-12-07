import * as fs from "node:fs";
import * as path from "node:path";
import { ExtractedPageData } from "./crawl";

export function writeCSVReport(
    pageData: Record<string, ExtractedPageData>,
    filename = "report.csv",
  ): void {
    // Function to escape CSV fields (quotes, commas, newlines) before joining with commas
    function csvEscape(field: string) {
        const str = field ?? "";
        const needsQuoting = /[",\n]/.test(str);
        const escaped = str.replace(/"/g, '""');
        return needsQuoting ? `"${escaped}"` : escaped;
    }

    //debug
    console.log("writeCSVReport called with", Object.keys(pageData).length, "pages");
    
    const filePath = path.resolve(process.cwd(), filename);

    const headers = ["page_url", "h1", "first_paragraph", "outgoing_link_urls", "image_urls"];
    const rows: string[] = [headers.join(",")];

    for (const page of Object.values(pageData)) {
        const row: string[] = [
            csvEscape(page.url),
            csvEscape(page.h1),
            csvEscape(page.first_paragraph),
            csvEscape(page.outgoing_links.join(';')),
            csvEscape(page.image_urls.join(';'))
        ];
        rows.push(row.join(','));
    }

    const csvContent = rows.join('\n');
    fs.writeFileSync(filePath, csvContent, 'utf-8');
  }