export const INVOICE_TEMPLATE_IDS = [
  "classic",
  "lumo",
  "haze",
  "noir",
  "bloom",
  "pivot",
  "drift",
  "prism",
] as const;

export type InvoiceTemplateId = (typeof INVOICE_TEMPLATE_IDS)[number];

export const INVOICE_TEMPLATES = [
  {
    id: "classic" as const,
    label: "Klasik",
    description: "Berkas biru, tabel tegas",
    path: "/templates/invoice-template.html",
  },
  {
    id: "lumo" as const,
    label: "Lumo",
    description: "Putih luas, garis tipis",
    path: "/templates/invoice-template-lumo.html",
  },
  {
    id: "haze" as const,
    label: "Haze",
    description: "Netral lembut, blok rapat",
    path: "/templates/invoice-template-haze.html",
  },
  {
    id: "noir" as const,
    label: "Noir",
    description: "Editorial hitam-putih",
    path: "/templates/invoice-template-noir.html",
  },
  {
    id: "bloom" as const,
    label: "Bloom",
    description: "Pastel magenta & kartu lembut",
    path: "/templates/invoice-template-bloom.html",
  },
  {
    id: "pivot" as const,
    label: "Pivot",
    description: "Brutalist monospace, kotak tegas",
    path: "/templates/invoice-template-pivot.html",
  },
  {
    id: "drift" as const,
    label: "Drift",
    description: "Aksen teal & serif modern",
    path: "/templates/invoice-template-drift.html",
  },
  {
    id: "prism" as const,
    label: "Prism",
    description: "Indigo glass & gradien halus",
    path: "/templates/invoice-template-prism.html",
  },
] as const satisfies ReadonlyArray<{
  id: InvoiceTemplateId;
  label: string;
  description: string;
  path: string;
}>;

export function getInvoiceTemplatePath(
  id: InvoiceTemplateId | undefined,
): string {
  if (!id) return INVOICE_TEMPLATES[0].path;
  const t = INVOICE_TEMPLATES.find((x) => x.id === id);
  return t?.path ?? INVOICE_TEMPLATES[0].path;
}

/** Tabel item ringan (bukan border grid klasik). */
export function isMinimalInvoiceTemplate(id: InvoiceTemplateId): boolean {
  return id !== "classic";
}
