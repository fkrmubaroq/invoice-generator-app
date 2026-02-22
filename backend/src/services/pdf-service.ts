import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";

export class PdfService {
  async generatePdfFromHtml(htmlContent: string): Promise<Buffer> {
    const viewport = {
      deviceScaleFactor: 1,
      hasTouch: false,
      height: 1080,
      isLandscape: true,
      isMobile: false,
      width: 1920,
    };
    const executablePath = await chromium.executablePath("bin/");
    const browser = await puppeteer.launch({
      args: puppeteer.defaultArgs(),
      defaultViewport: viewport,
      executablePath: executablePath,
      headless: "shell",
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}

export const pdfService = new PdfService();
