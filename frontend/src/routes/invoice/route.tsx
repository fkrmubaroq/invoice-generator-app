import { createFileRoute } from "@tanstack/react-router"
import InvoiceForm from "./invoice-form"

export const Route = createFileRoute("/invoice")({ component: InvoicePage })
export default function InvoicePage(){
    return   <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buat Invoice</h1>
          <p className="text-gray-600 mt-2">
            Isi form di bawah untuk membuat invoice PDF
          </p>
        </div>
        <InvoiceForm />
      </div>
    </main>
}