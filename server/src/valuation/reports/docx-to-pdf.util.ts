import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';

const run = promisify(execFile);

/**
 * Converts a .docx buffer to PDF with LibreOffice (headless). Returns null —
 * never throws — when LibreOffice is not installed or the conversion fails, so
 * report generation still succeeds with the Word file alone.
 *
 * Server setup: `apt-get install -y libreoffice-writer fonts-liberation`
 * (set SOFFICE_PATH if the binary is not on PATH as `soffice`).
 */
export async function docxToPdf(docx: Buffer): Promise<Buffer | null> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kosres-report-'));
  try {
    const input = path.join(dir, 'report.docx');
    await fs.writeFile(input, docx);
    const bin = process.env.SOFFICE_PATH || 'soffice';
    await run(
      bin,
      [`-env:UserInstallation=file://${dir}/profile`, '--headless', '--convert-to', 'pdf', '--outdir', dir, input],
      { timeout: 120000 },
    );
    return await fs.readFile(path.join(dir, 'report.pdf'));
  } catch {
    return null;
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/**
 * For each heading (in document order) finds the PDF page it lands on, so the
 * table of contents can carry real page numbers. Uses pdf-parse; returns an
 * empty map if the PDF cannot be read.
 */
export async function findHeadingPages(
  pdf: Buffer,
  headings: { text: string }[],
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const pages: string[] = [];
    await pdfParse(pdf, {
      pagerender: async (page: any) => {
        const content = await page.getTextContent();
        const text = content.items.map((i: any) => i.str).join(' ');
        pages.push(text);
        return text;
      },
    });
    const norm = (t: string) => t.replace(/\s+/g, ' ');
    const tocIdx = pages.findIndex((t) => /TABLE OF CONTENTS/.test(t));
    let page = tocIdx + 1; // the TOC may spill onto further pages; skip entries made of dot leaders
    while (page < pages.length && /(\.{10,})/.test(pages[page]) ) page++;
    let from = 0;
    for (const h of headings) {
      let found = false;
      for (let pg = page; pg < pages.length && !found; pg++) {
        const idx = norm(pages[pg]).indexOf(h.text, pg === page ? from : 0);
        if (idx >= 0) { result.set(h.text, pg + 1); page = pg; from = idx + h.text.length; found = true; }
      }
    }
  } catch {
    /* fall through with whatever was found */
  }
  return result;
}
