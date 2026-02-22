"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrencyPlain } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { InvoiceFormData } from "./invoice-form";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface SortableInvoiceItemProps {
  id: string;
  index: number;
  register: UseFormRegister<InvoiceFormData>;
  errors: FieldErrors<{
    items: InvoiceItem[];
  }>;
  watchItem: InvoiceItem | undefined;
  onRemove: () => void;
  canRemove: boolean;
}

export default function SortableInvoiceItem({
  id,
  index,
  register,
  errors,
  watchItem,
  onRemove,
  canRemove,
}: SortableInvoiceItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemTotal =
    (Number(watchItem?.quantity) || 0) * (Number(watchItem?.unitPrice) || 0);
  const hasError = errors.items?.[index];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "w-full border rounded-lg bg-white overflow-hidden",
        isDragging && "shadow-lg ring-2 ring-blue-500 opacity-90 z-50",
        hasError && "border-red-300",
      )}
    >
      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 flex-1 text-left hover:bg-gray-100 rounded px-2 py-1 transition-colors"
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-500 transition-transform duration-200",
              !isOpen && "-rotate-90",
            )}
          />
          <span className="text-sm font-medium text-gray-700 lg:block hidden">
            Item {index + 1}
          </span>
          {!isOpen && watchItem?.description && (
            <span className="text-sm text-gray-500 truncate max-w-[200px]">
              - {watchItem.description}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            {formatCurrencyPlain(itemTotal)}
          </span>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                className="min-h-[80px] w-full"
                placeholder="Deskripsi item"
                {...register(`items.${index}.description`)}
              />
              {errors.items?.[index]?.description && (
                <p className="text-sm text-red-500">
                  {errors.items[index]?.description?.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min="1"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Satuan</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <div className="h-10 flex items-center px-3 bg-gray-100 rounded-md text-sm font-medium">
                  {formatCurrencyPlain(itemTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
