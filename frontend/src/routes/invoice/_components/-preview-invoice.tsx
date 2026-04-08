import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { InvoiceFormData } from "../invoice-form";
import formatRupiah from "@/lib/format-rupiah";
import dayjs from "dayjs";
import { INVOICE_PPN_RATE_PERCENT } from "@/lib/invoice-ppn";
import {
  getInvoiceTemplatePath,
  isMinimalInvoiceTemplate,
} from "@/lib/invoice-templates";

export default function PreviewInvoice({
  form,
}: {
  form: UseFormReturn<InvoiceFormData>;
}) {
  const currentObjectUrl = useRef<string | null>(null);
  const templateSourceCache = useRef<Record<string, string>>({});
  /** Src iframe harus dari state agar re-render tidak menimpa blob URL hasil merge. */
  const [iframeSrc, setIframeSrc] = useState<string>("about:blank");

  /** Hanya field yang memengaruhi pratinjau — jangan sertakan `preview` (hindari loop setValue). */
  const watchedForPreview = useWatch({
    control: form.control,
    name: [
      "templateId",
      "invoiceNumber",
      "invoiceDate",
      "customerName",
      "customerAddress",
      "items",
      "ppnEnabled",
      "logo",
    ],
  });

  const parsedIntoTable = useCallback(
    (data: InvoiceFormData["items"], minimal: boolean) => {
      const width = "width:150px;";
      const borderRight = minimal ? "" : "border-right:1px solid #888;";
      const borderLeft = minimal ? "" : "border-left:1px solid #888;";
      const borderBottom = minimal
        ? "border-bottom:1px solid #e8e6e3;"
        : "border-bottom:1px solid #888;";
      const headBorder = minimal
        ? "border-bottom:2px solid #e5e3df;"
        : "border:1px solid #888;";
      const cellPad = minimal ? "12px 10px" : "4px";
      const thPad = minimal ? "14px 10px" : "5px";
      const fontSize = minimal ? "13px" : "12px";

      const rupiahAllowed = ["unitPrice", "total"];
      const numberAllowed = ["quantity"];
      const columnAlias: Record<string, string> = {
        description: "Deskripsi",
        quantity: "Jumlah",
        unitPrice: "Harga",
      };
      let html = `<table style='font-size:${fontSize}; border-collapse:collapse; width:100%;'><thead><tr style='${headBorder}'>`;

      const columns = Object.keys(data?.[0]);
      html += `<th style="${borderRight} padding:${thPad}; width:50px; text-align:left; color:${minimal ? "#78716c" : "inherit"}; font-weight:600;">No</th>`;
      columns.forEach((key) => {
        if (key === "description") {
          html += `<th style="${borderRight} padding:${thPad}; width:400px; text-align:left; color:${minimal ? "#78716c" : "inherit"}; font-weight:600;">${columnAlias[key]}</th> `;
          return;
        }
        html += `<th style='${borderRight} padding:${thPad}; text-align:left; color:${minimal ? "#78716c" : "inherit"}; font-weight:600;'>${columnAlias[key]}</th> `;
      });
      html += `<th style='padding:${thPad}; text-align:right; color:${minimal ? "#78716c" : "inherit"}; font-weight:600;'>Total</th>`;
      html += "</tr></thead>";

      html += "<tbody>";

      let total = 0;
      let subTotal = 0;
      data.forEach((item, index) => {
        html += `<tr style='${borderBottom}'>`;
        total = item.quantity * item.unitPrice;
        subTotal += total;
        const obj = Object.keys(item);

        html += `<td style="width:50px; text-align:center; ${borderLeft} ${borderRight} padding:${cellPad}; color:${minimal ? "#a8a29e" : "inherit"}">${index + 1}</td>`;

        obj.forEach((key) => {
          if (key === "description") {
            html += `<td style="${width} ${borderRight} padding:${cellPad}; font-weight:${minimal ? "500" : "600"}; color:${minimal ? "#292524" : "inherit"};">${item[key as keyof typeof item]}</td>`;
            return;
          }

          if (key === "quantity") {
            html += `<td style="width:80px; text-align:center; ${borderRight} padding:${cellPad}">${formatRupiah(item[key as keyof typeof item] as number, { removeRp: true })}</td>`;
            return;
          }

          if (numberAllowed.includes(key)) {
            html += `<td style="${width} ${borderRight} padding:${cellPad}">${formatRupiah(item[key as keyof typeof item] as number, { removeRp: true })}</td>`;
            return;
          }
          if (rupiahAllowed.includes(key)) {
            html += `<td style="${width} ${borderRight} padding:${cellPad}">${formatRupiah(item[key as keyof typeof item] as number)}</td>`;
            return;
          }

          html += `<td style="${width} padding:${cellPad}">${item[key as keyof typeof item]}</td>`;
        });
        html += `<td style="width:200px; text-align:right; ${borderRight} padding:${cellPad}; font-weight:${minimal ? "600" : "inherit"}">${formatRupiah(total)}</td>`;
        html += "</tr>";
      });
      html += "</tbody></table>";
      return {
        html,
        subTotal,
      };
    },
    [],
  );

  const parsedBase64IntoImg = useCallback((base64: string, larger?: boolean) => {
    if (!base64) return "";
    const s = larger ? 64 : 50;
    return `<img src='${base64}' width='${s}' height='${s}' style="object-fit:contain" alt=""/>`;
  }, []);

  const parsedDataForm = useCallback(
    (data: InvoiceFormData): Record<string, string | number> => {
      const minimal = isMinimalInvoiceTemplate(data.templateId);
      const { html: htmlItems, subTotal } = parsedIntoTable(
        data.items,
        minimal,
      );
      const logo = parsedBase64IntoImg(data.logo, minimal);
      const taxRatePercent = data.ppnEnabled ? INVOICE_PPN_RATE_PERCENT : 0;
      const tax = subTotal * (taxRatePercent / 100);
      const taxRow = data.ppnEnabled
        ? `<div class="totals-row">
          <span class="label">Pajak (${taxRatePercent}%)</span>
          <span class="value">${formatRupiah(tax)}</span>
        </div>`
        : "";
      return {
        invoice_number: data.invoiceNumber,
        invoice_date: dayjs(data.invoiceDate).format("DD MMMM YYYY"),
        customer_name: data.customerName,
        customer_address: data.customerAddress,
        items: htmlItems,
        subtotal: formatRupiah(subTotal),
        tax_row: taxRow,
        total: formatRupiah(tax + subTotal),
        logo,
      };
    },
    [parsedBase64IntoImg, parsedIntoTable],
  );

  const updateTemplate = useCallback(
    (html: string, data: InvoiceFormData) => {
      const parsedData = parsedDataForm(data);
      for (const key of Object.keys(parsedData)) {
        html = html.replaceAll(
          "${{" + key + "}}",
          parsedData[key] as unknown as string,
        );
      }
      return html;
    },
    [parsedDataForm],
  );

  const loadTemplateSource = useCallback(async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gagal memuat template (${res.status})`);
    return res.text();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const data = form.getValues();
      const path = getInvoiceTemplatePath(data.templateId);
      let source = templateSourceCache.current[path];
      if (!source) {
        try {
          source = await loadTemplateSource(path);
        } catch (e) {
          console.error(e);
          return;
        }
        templateSourceCache.current[path] = source;
      }

      if (cancelled) return;

      let html = updateTemplate(source, form.getValues());
      html = html.replaceAll(/\$\{\{.*?\}\}/g, "");

      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
      const objectUrl = URL.createObjectURL(
        new Blob([html], { type: "text/html" }),
      );
      currentObjectUrl.current = objectUrl;
      const src = `${objectUrl}#toolbar=0&navpanes=0`;
      setIframeSrc(src);
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [watchedForPreview, form, loadTemplateSource, updateTemplate]);

  useEffect(
    () => () => {
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
        currentObjectUrl.current = null;
      }
    },
    [],
  );

  return (
    <div className="lg:sticky lg:top-4 h-fit">
      <Card className="h-[calc(100vh)]">
        <CardContent className="h-[calc(100%)]">
          <iframe
            id="preview-template"
            src={iframeSrc}
            className="w-full h-full border rounded-lg bg-white"
            title="Invoice Preview"
          />
        </CardContent>
      </Card>
    </div>
  );
}
