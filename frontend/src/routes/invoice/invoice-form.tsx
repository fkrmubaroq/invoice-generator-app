import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { formatCurrencyPlain } from "@/lib/format-currency";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileDown,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Table,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import EditableInvoiceTable from "./editable-invoice-table";
import SortableInvoiceItem from "./sortable-invoice-item";
import PreviewInvoice from "./_components/-preview-invoice";
import htmlToPdfMake from "html-to-pdfmake";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import api from "@/lib/api";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Deskripsi wajib diisi"),
  quantity: z.number().min(1, "Minimal 1"),
  unitPrice: z.number().min(0, "Tidak boleh negatif"),
});

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Nomor invoice wajib diisi"),
  invoiceDate: z.string().min(1, "Tanggal wajib diisi"),
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  customerAddress: z.string().min(1, "Alamat wajib diisi"),
  items: z.array(invoiceItemSchema).min(1, "Minimal 1 item"),
  taxRate: z.number().min(0).max(100),
  logo: z.string().min(1, "Logo Perusahaan wajib diisi"),
  preview: z.instanceof(File).optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export default function InvoiceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema as any),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      customerName: "",
      customerAddress: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      taxRate: 11,
      logo: "",
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [watchItems, watchTaxRate, logo] = form.watch([
    "items",
    "taxRate",
    "logo",
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);
        move(oldIndex, newIndex);
      }
    },
    [fields, move],
  );

  const subtotal = watchItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const tax = (subtotal * (Number(watchTaxRate) || 0)) / 100;
  const total = subtotal + tax;

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          form.setValue("logo", reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setIsLoading(true);
      setPdfUrl(null);
      const iframeEl = document.querySelector(
        "#preview-template",
      ) as HTMLIFrameElement;
      const iframeDoc = iframeEl.contentDocument;
      if (!iframeDoc) return;
      const html = iframeDoc.documentElement.outerHTML;
      const blob = new Blob([html], { type: "text/html" });
      const file = new File([blob], "invoice.html", { type: "text/html" });

      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/api/generate-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Nomor Invoice</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="INV-001"
                    {...form.register("invoiceNumber")}
                  />
                  {form.formState.errors.invoiceNumber && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.invoiceNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Tanggal Invoice</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    {...form.register("invoiceDate")}
                  />
                  {form.formState.errors.invoiceDate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.invoiceDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo Perusahaan</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm">Pilih Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  {logo && (
                    <div className="relative">
                      <img
                        src={logo}
                        alt="Logo"
                        className="h-12 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => form.setValue("logo", "")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama Pelanggan</Label>
                <Input
                  id="customerName"
                  placeholder="PT. Contoh Indonesia"
                  {...form.register("customerName")}
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.customerName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Alamat Pelanggan</Label>
                <textarea
                  id="customerAddress"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Jl. Contoh No. 123&#10;Jakarta Selatan 12345"
                  {...form.register("customerAddress")}
                />
                {form.formState.errors.customerAddress && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.customerAddress.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="drag">
                <div className="flex items-center justify-between mb-4 lg:flex-row flex-col lg:gap-0 gap-4">
                  <CardTitle>Item Invoice</CardTitle>
                  <TabsList>
                    <TabsTrigger value="drag" className="gap-1.5">
                      <GripVertical className="w-3.5 h-3.5" />
                      Drag & Drop
                    </TabsTrigger>
                    <TabsTrigger value="editable" className="gap-1.5">
                      <Table className="w-3.5 h-3.5" />
                      Tabel
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="drag" className="space-y-4 mt-0">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields.map((field) => field.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <SortableInvoiceItem
                            key={field.id}
                            id={field.id}
                            index={index}
                            register={form.register}
                            errors={form.formState.errors}
                            watchItem={watchItems[index]}
                            onRemove={() => remove(index)}
                            canRemove={fields.length > 1}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </TabsContent>

                <TabsContent value="editable" className="mt-0">
                  <EditableInvoiceTable
                    fields={fields}
                    register={form.register}
                    errors={form.formState.errors}
                    watchItems={watchItems}
                    onRemove={remove}
                  />
                </TabsContent>

                {form.formState.errors.items &&
                  !Array.isArray(form.formState.errors.items) && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.items.message}
                    </p>
                  )}

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full h-10 cursor-pointer mt-4"
                  size="sm"
                  onClick={() =>
                    append({ description: "", quantity: 1, unitPrice: 0 })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Item
                </Button>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="taxRate" className="w-32">
                  Pajak (%)
                </Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  className="w-24"
                  {...form.register("taxRate", { valueAsNumber: true })}
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrencyPlain(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Pajak ({watchTaxRate || 0}%)
                  </span>
                  <span className="font-medium">
                    {formatCurrencyPlain(tax)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {formatCurrencyPlain(total)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Membuat PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>

      <PreviewInvoice url="/templates/invoice-template.html" form={form} />
    </div>
  );
}
