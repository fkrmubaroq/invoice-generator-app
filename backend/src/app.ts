import express, { Express } from "express";
import { pdfRoutes } from "./routes/pdf-routes";
import { errorMiddleware } from "./middlewares/error-middleware";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",")
  : [];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!").end();
});
// Routes
app.use("/api", pdfRoutes);

// Centralized error handling
app.use(errorMiddleware);

export default app;
