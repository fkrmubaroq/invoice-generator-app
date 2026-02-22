import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { InvoiceFormData } from "../invoice-form";
import formatRupiah from "@/lib/format-rupiah";
import dayjs from "dayjs";

export default function PreviewInvoice({
  url,
  form,
}: {
  url: string;
  form: UseFormReturn<InvoiceFormData>;
}) {
  const currentObjectUrl = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const parsedIntoTable = (data: InvoiceFormData["items"]) => {
    const width = "width:150px;";
    const borderRight = "border-right:1px solid #888;";
    const borderLeft = "border-left:1px solid #888;";
    const borderBottom = "border-bottom:1px solid #888;";
    const rupiahAllowed = ["unitPrice", "total"];
    const numberAllowed = ["quantity"];
    const columnAlias: Record<string, string> = {
      description: "Deskripsi",
      quantity: "Jumlah",
      unitPrice: "Harga",
    };
    let html =
      "<table style='border:1px; font-size:12px; solid #888; border-collapse:collapse; width:100%;'><thead><tr style='border:1px solid #888;'>";

    // display column
    const columns = Object.keys(data?.[0]);
    html += `<th style="${borderRight} padding:5px; width:50px;">No</th>`;
    columns.forEach((key) => {
      if (key === "description") {
        html += `<th style="${borderRight} padding:5px; width:400px;">${columnAlias[key]}</th> `;
        return;
      }
      html += `<th style='${borderRight} padding:5px;'>${columnAlias[key]}</th> `;
    });
    html += "<th style='padding:5px'>Total</th>";
    html += "</tr></thead>";

    html += "<tbody>";

    let total = 0;
    let subTotal = 0;
    // display row
    data.forEach((item, index) => {
      html += `<tr style='${borderBottom}'>`;
      total = item.quantity * item.unitPrice;
      subTotal += total;
      const obj = Object.keys(item);

      // cell 'no'
      html += `<td style="width:50px; text-align:center; ${borderLeft} ${borderRight}  padding:4px">${index + 1}</td>`;

      obj.forEach((key) => {
        // cell 'description'
        if (key === "description") {
          html += `<td style="${width} ${borderRight} padding-left:10px; font-weight:600; font-size:12px;">${item[key as keyof typeof item]}</td>`;
          return;
        }

        // cell 'quantity'
        if (key === "quantity") {
          html += `<td style="width:80px; text-align:center; ${borderRight}  padding:4px">${formatRupiah(item[key as keyof typeof item] as number, { removeRp: true })}</td>`;
          return;
        }

        if (numberAllowed.includes(key)) {
          html += `<td style="${width} ${borderRight} padding-left:5px">${formatRupiah(item[key as keyof typeof item] as number, { removeRp: true })}</td>`;
          return;
        }
        if (rupiahAllowed.includes(key)) {
          html += `<td style="${width} ${borderRight} padding-left:5px">${formatRupiah(item[key as keyof typeof item] as number)}</td>`;
          return;
        }

        html += `<td style="${width} padding:4px">${item[key as keyof typeof item]}</td>`;
      });
      html += `<td style="width:200px; text-align:right; ${borderRight} padding:4px">${formatRupiah(total)}</td>`;
      html += "</tr>";
    });
    html += "</tbody></table>";
    return {
      html,
      subTotal,
    };
  };

  const parsedBase64IntoImg = (base64: string) => {
    if (!base64) return "";
    return `<img src='${base64}' width='50' height='50'/>`;
  };

  const parsedDataForm = (
    data: InvoiceFormData,
  ): Record<string, string | number> => {
    const { html: htmlItems, subTotal } = parsedIntoTable(data.items);
    const logo = parsedBase64IntoImg(data.logo);
    const tax = subTotal * (data.taxRate / 100);
    return {
      invoice_number: data.invoiceNumber,
      invoice_date: dayjs(data.invoiceDate).format("DD MMMM YYYY"),
      customer_name: data.customerName,
      customer_address: data.customerAddress,
      items: htmlItems,
      subtotal: formatRupiah(subTotal),
      tax_rate: data.taxRate,
      tax: formatRupiah(tax),
      total: formatRupiah(tax + subTotal),
      logo,
    };
  };

  const updateTemplate = (html: string, data: InvoiceFormData) => {
    const parsedData: Record<string, string | number> = parsedDataForm(data);
    const objToArr = Object.keys(parsedData);
    objToArr.forEach((key) => {
      if (!objToArr.length) return;
      html = html.replaceAll(
        "${{" + key + "}}",
        parsedData[key] as unknown as string,
      );
    });
    return html;
  };

  const initFetchTemplate = (data?: InvoiceFormData) => {
    return fetch(url)
      .then(async (res) => {
        const blob = await res.blob();
        const previewTemp = new File([blob], "preview.html", {
          type: "text/html",
        });
        form.setValue("preview", previewTemp);

        return res.text();
      })
      .then(async (html) => {
        if (!iframeRef.current) return;
        if (data) {
          html = updateTemplate(html, data);
        }

        html = html.replaceAll(/\$\{\{.*?\}\}/g, "");
        const blob = new Blob([html], { type: "text/html" });
        const file = new File([blob], "invoice.html", { type: "text/html" });
        if (currentObjectUrl.current) {
          URL.revokeObjectURL(currentObjectUrl.current);
        }
        const url = URL.createObjectURL(blob);
        currentObjectUrl.current = url;
        iframeRef.current.src = `${url}#toolbar=0&navpanes=0`;
        return file;
      });
  };
  useEffect(() => {
    initFetchTemplate();
  }, []);

  useEffect(() => {
    const preview = form.watch("preview");
    if (!preview) return;
    preview.text().then((html) => {
      if (!iframeRef.current) return;
      html = updateTemplate(html, form.watch());
      html = html.replaceAll(/\$\{\{.*?\}\}/g, "");
      const blob = new Blob([html], { type: "text/html" });
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
      const url = URL.createObjectURL(blob);
      currentObjectUrl.current = url;
      iframeRef.current.src = `${url}#toolbar=0&navpanes=0`;
    });

    // initFetchTemplate(form.watch()).then((file) => {
    //   form.setValue("preview", file);
    // });

    return () => {
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
    };
  }, [form.watch()]);

  return (
    <>
      <div className="lg:sticky lg:top-4 h-fit">
        <Card className="h-[calc(100vh)]">
          <CardContent className="h-[calc(100%)]">
            {url ? (
              <iframe
                id="preview-template"
                ref={iframeRef}
                src={`${url}#toolbar=0&navpanes=0`}
                className="w-full h-full border rounded-lg"
                title="Invoice Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border rounded-lg bg-gray-50">
                <div className="text-center text-gray-500">
                  <FileDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Klik &quot;Generate PDF&quot; untuk melihat preview</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
