# HTML to PDF Converter Project

## Puppeteer + Express + TypeScript (MVC Architecture)

Create a backend project to convert HTML into PDF using **Puppeteer**, **Express**, and **TypeScript**.

---

## 1. Tech Stack

- Node.js
- Express
- TypeScript
- Puppeteer
- multer

---

## 2. Architecture Requirements

Use **MVC (Model-View-Controller)** architecture.

### Separation of Concerns

- **Controller**
  - Handles request and response
  - Calls service layer
- **Service**
  - Contains Puppeteer logic
  - Responsible for generating PDF
- **Routes**
  - Separate from controller
- **Middleware**
  - Centralized error handling

Do NOT place Puppeteer logic directly inside the controller.

---

## 3. Naming Convention

All files and folders must use **kebab-case**.

### Example:

pdf-controller.ts
pdf-service.ts
pdf-routes.ts
error-middleware.ts

---

## 4. Folder Structure

Provide a complete folder structure like:
src/
controllers/
pdf-controller.ts
services/
pdf-service.ts
routes/
pdf-routes.ts
middlewares/
error-middleware.ts
models/
utils/
app.ts
server.ts

---

## 5. API Endpoint

POST /api/generate-pdf

---

## 6. Request Format

### Request Type

`multipart/form-data`

### Form Field

| Field Name | Type | Description       |
| ---------- | ---- | ----------------- |
| file       | File | HTML file (.html) |

---

## 6. Request Example (cURL)

```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -F "file=@example.html"
```

## 7. Response Requirements

Return generated PDF as:
Stream OR
Buffer
Set appropriate headers:
Content-Type: application/pdf
Content-Disposition: attachment; filename="output.pdf"

## 8. TypeScript Configuration

Include:
tsconfig.json
Strict mode enabled
Proper compiler options for Node.js

## 9. Best Practices

Use async/await
Implement centralized error handling middleware
Validate uploaded file type (only .html allowed)
Handle missing file errors
Clean up temporary files if stored
Clean and production-ready structure
No business logic inside routes
No Puppeteer logic inside controllers
