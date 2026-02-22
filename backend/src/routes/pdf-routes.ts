import { Router } from "express";
import multer from "multer";
import path from "path";
import { pdfController } from "../controllers/pdf-controller";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, "../../uploads"),
});

// POST /api/generate-pdf
router.post("/generate-pdf", upload.single("file"), (req, res, next) => {
  pdfController.generatePdf(req, res, next);
});

export { router as pdfRoutes };
