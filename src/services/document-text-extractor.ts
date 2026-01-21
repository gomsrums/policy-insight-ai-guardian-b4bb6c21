import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
// Vite will bundle the worker and provide a URL at build time
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Extract readable text from an uploaded file.
 *
 * Why: File.text() on PDFs returns the binary stream as a string, which looks
 * like a "corrupted/encrypted PDF" to the AI. We must parse PDFs to text.
 */
export async function extractTextFromFile(file: File, opts?: { maxPages?: number }): Promise<string> {
  const name = file.name?.toLowerCase?.() ?? "";
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");

  if (!isPdf) {
    const text = await file.text();
    return text;
  }

  const maxPages = Math.max(1, opts?.maxPages ?? 50);
  const bytes = new Uint8Array(await file.arrayBuffer());

  const pdf = await getDocument({ data: bytes }).promise;
  const pageCount = Math.min(pdf.numPages, maxPages);

  const pagesText: string[] = [];
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = (content.items as any[])
      .map((item) => (typeof item?.str === "string" ? item.str : ""))
      .filter((s) => s && s.trim().length > 0);
    pagesText.push(strings.join(" "));
  }

  return pagesText.join("\n\n--- PAGE BREAK ---\n\n");
}
