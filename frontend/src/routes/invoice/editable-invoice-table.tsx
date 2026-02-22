import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrencyPlain } from "@/lib/format-currency";
import { Trash2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface EditableInvoiceTableProps {
  fields: { id: string }[];
  register: UseFormRegister<{
    invoiceNumber: string;
    invoiceDate: string;
    customerName: string;
    customerAddress: string;
    items: InvoiceItem[];
    taxRate: number;
    logo: string;
    preview?: File;
  }>;
  errors: FieldErrors<{
    items: InvoiceItem[];
  }>;
  watchItems: (InvoiceItem | undefined)[];
  onRemove: (index: number) => void;
}

export default function EditableInvoiceTable({
  fields,
  register,
  errors,
  watchItems,
  onRemove,
}: EditableInvoiceTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left px-3 py-2.5 font-semibold text-gray-600 w-10">
              No
            </th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-600">
              Deskripsi
            </th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-600 w-20">
              Qty
            </th>
            <th className="text-left px-3 py-2.5 font-semibold text-gray-600 w-36">
              Harga Satuan
            </th>
            <th className="text-right px-3 py-2.5 font-semibold text-gray-600 w-36">
              Jumlah
            </th>
            <th className="w-12 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => {
            const item = watchItems[index];
            const itemTotal =
              (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
            const hasError = errors.items?.[index];

            return (
              <tr
                key={field.id}
                className={`border-b last:border-b-0 group hover:bg-blue-50/40 transition-colors ${hasError ? "bg-red-50/50" : ""}`}
              >
                <td className="px-3 py-1.5 text-gray-400 text-center font-mono text-xs">
                  {index + 1}
                </td>
                <td className="px-1 py-1">
                  <Input
                    className="border-transparent bg-transparent shadow-none hover:border-gray-300 focus:border-blue-500 focus:bg-white h-8 rounded-sm text-sm"
                    placeholder="Deskripsi item..."
                    {...register(`items.${index}.description`)}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-xs text-red-500 px-2 pb-1">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </td>
                <td className="px-1 py-1">
                  <Input
                    className="border-transparent bg-transparent shadow-none hover:border-gray-300 focus:border-blue-500 focus:bg-white h-8 rounded-sm text-sm text-center"
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                </td>
                <td className="px-1 py-1">
                  <Input
                    className="border-transparent bg-transparent shadow-none hover:border-gray-300 focus:border-blue-500 focus:bg-white h-8 rounded-sm text-sm"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                  />
                </td>
                <td className="px-3 py-1.5 text-right font-medium text-sm text-gray-700">
                  {formatCurrencyPlain(itemTotal)}
                </td>
                <td className="px-1 py-1 text-center">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => onRemove(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
