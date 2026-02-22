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

      // Validate file extension
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (fileExtension !== ".html") {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        res.status(400).json({
          error: "Invalid file type. Only .html files are allowed.",
        });
        return;
      }

      // Read HTML content from uploaded file
      const htmlContent = fs.readFileSync(req.file.path, "utf-8");

      // Generate PDF
      const pdfBuffer = await pdfService.generatePdfFromHtml(htmlContent);

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      // Set response headers and send PDF
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="output.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      });

      res.send(pdfBuffer);
    } catch (error) {
      // Clean up temporary file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
}

export const pdfController = new PdfController();
