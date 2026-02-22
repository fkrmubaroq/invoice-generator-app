import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRightIcon, CheckCircleIcon, FileTextIcon } from 'lucide-react'


export const Route = createFileRoute('/')({ component: App })

function App() {
 
  return   <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-8 shadow-lg">
            <FileTextIcon className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Invoice Generator
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Buat invoice profesional dalam format PDF dengan mudah dan cepat.
            Gratis, tanpa registrasi, langsung download.
          </p>

          <Link
            to="/invoice"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Buat Invoice Sekarang
            <ArrowRightIcon className="w-5 h-5" />
          </Link>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mudah Digunakan</h3>
              <p className="text-gray-600 text-sm">
                Form yang sederhana dan intuitif, langsung isi dan generate
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <FileTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Format PDF</h3>
              <p className="text-gray-600 text-sm">
                Invoice dalam format PDF siap cetak dengan tampilan profesional
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Format Rupiah</h3>
              <p className="text-gray-600 text-sm">
                Kalkulasi otomatis dengan format mata uang Rupiah (IDR)
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
}
