import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { pdfService } from "../services/pdf-service";

export class PdfController {
  async generatePdf(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate file exists
      if (!req.file) {
        res
          .status(400)
          .json({ error: "No file uploaded. Please upload an HTML file." });
        return;
      }

      // Read HTML content from uploaded file
      const htmlContent = req.file.buffer.toString("utf-8");

      // Generate PDF
      const pdfBuffer = await pdfService.generatePdfFromHtml(htmlContent);

      // Set response headers and send PDF
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="output.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const pdfController = new PdfController();
