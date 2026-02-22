export function replaceTemplateVariables(
  template: string,
  data: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\$\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function renderItemsTable(items: InvoiceItem[]): string {
  const rows = items
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatRupiah(item.unitPrice)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatRupiah(item.total)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; text-align: center; width: 50px;">No</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; text-align: left;">Deskripsi</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; text-align: center; width: 80px;">Qty</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; text-align: right; width: 150px;">Harga Satuan</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; text-align: right; width: 150px;">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function formatRupiah(amount: number): string {
  return `Rp ${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`;
}
