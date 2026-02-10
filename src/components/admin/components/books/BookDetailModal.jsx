import React, { useState } from 'react'
import {
  X,
  BookOpen,
  Feather,
  Building2,
  Calendar,
  Hash,
  Tag,
  Layers,
  CheckCircle,
  Clock,
  ZapOff,
  Bookmark,
  FileText,
  DollarSign, // 1. 🔥 Import Icon Dolar
} from 'lucide-react'

// ==========================================================
// 🔹 Sub-Komponen: DetailItem
// ==========================================================
const DetailItem = ({
  icon: Icon,
  label,
  value,
  colorClass = 'text-gray-800',
}) => (
  <div className="flex items-start text-sm">
    <Icon size={16} className={`flex-shrink-0 mr-2 mt-[2px] ${colorClass}`} />
    <div className="flex-grow">
      <strong className="font-medium">{label}:</strong>{' '}
      <span className={`${colorClass} font-normal block sm:inline-block`}>
        {value}
      </span>
    </div>
  </div>
)

// ==========================================================
// 🔹 Komponen Utama: BookDetailModal
// ==========================================================
const BookDetailModal = ({ book, onClose }) => {
  const [imgError, setImgError] = useState(false)

  if (!book) return null

  // 🛠️ FUNGSI FIX URL GAMBAR
  const getImageUrl = (path) => {
    if (!path) return null
    let cleanPath = path.replace(/\\/g, '/')
    cleanPath = cleanPath.replace('public/', '')
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
    if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`
    return `https://apiprawira.my.id/${cleanPath}`
  }

  // 🛠️ 2. 🔥 HELPER FORMAT RUPIAH
  const formatRupiah = (number) => {
    if (!number) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number)
  }

  // ==========================================================
  // ⚡ LOGIKA PERHITUNGAN STOK
  // ==========================================================
  const totalStok = parseInt(book.total_eksemplar) || 0
  const dipinjam = parseInt(book.dipinjam) || 0
  const rusakHilang = parseInt(book.non_tersedia_inventory) || 0
  const dibooking = parseInt(book.dibooking) || 0

  const tersedia = totalStok - dipinjam - rusakHilang - dibooking

  const bookDetails = [
    {
      icon: BookOpen,
      label: 'Judul',
      value: book.judul,
      colorClass: 'text-gray-600',
    },
    {
      icon: Hash,
      label: 'ISBN',
      value: book.isbn || '-',
      colorClass: 'text-gray-600',
    },
    {
      icon: Feather,
      label: 'Penulis',
      value: book.penulis || '-',
      colorClass: 'text-gray-600',
    },
    {
      icon: Building2,
      label: 'Penerbit',
      value: book.penerbit || '-',
      colorClass: 'text-gray-600',
    },
    {
      icon: Tag,
      label: 'Kategori',
      value: book.kategori_nama || 'Belum Ditentukan',
      colorClass: 'text-gray-600',
    },
    {
      icon: Calendar,
      label: 'Tahun Terbit',
      value: book.tahun_terbit || '-',
      colorClass: 'text-gray-600',
    },
    // 3. 🔥 ITEM BARU: HARGA BUKU
    {
      icon: DollarSign,
      label: 'Harga Buku Satuan',
      value: formatRupiah(book.harga),
      colorClass: 'text-gray-600 font-semibold',
    },
  ]

  const stockDetails = [
    {
      icon: Layers,
      label: 'Total',
      value: totalStok,
      colorClass: 'text-gray-900',
    },
    {
      icon: CheckCircle,
      label: 'Tersedia',
      value: tersedia,
      colorClass: 'text-green-600',
    },
    {
      icon: Bookmark,
      label: 'Dibooking',
      value: dibooking,
      colorClass: 'text-blue-500',
    },
    {
      icon: Clock,
      label: 'Dipinjam',
      value: dipinjam,
      colorClass: 'text-yellow-600',
    },
    {
      icon: ZapOff,
      label: 'Rusak/Hilang',
      value: rusakHilang,
      colorClass: 'text-red-600',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full relative shadow-2xl transition-all max-h-[90vh] flex flex-col">
        {/* === HEADER (Fixed) === */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h3 className="text-xl font-extrabold text-gray-800 flex items-center">
            <BookOpen size={22} className="mr-2 text-blue-600" />
            Detail Data Buku
          </h3>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 p-1 rounded-full hover:bg-gray-200"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* === BODY (Scrollable) === */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* KONTEN UTAMA */}
          <div className="flex flex-col sm:flex-row gap-8 mb-8">
            {/* === COVER BUKU (YANG UDAH DI BAGUSIN) === */}
            <div className="flex-shrink-0 sm:w-1/3 flex flex-col items-center">
              {book.cover && !imgError ? (
                <div className="relative group">
                  <img
                    src={getImageUrl(book.cover)}
                    alt={`Cover buku: ${book.judul}`}
                    className="w-full max-w-[160px] sm:max-w-[220px] h-auto object-cover rounded-xl shadow-lg border border-gray-200 transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImgError(true)}
                  />
                  {/* Efek border halus */}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-black/5 pointer-events-none"></div>
                </div>
              ) : (
                <div className="w-full max-w-[160px] sm:max-w-[220px] aspect-[2/3] bg-gray-100 flex flex-col items-center justify-center text-xs rounded-xl text-gray-400 border border-gray-300 shadow-sm">
                  <BookOpen size={40} className="mb-3 opacity-40" />
                  <span className="font-medium">No Cover</span>
                </div>
              )}
            </div>

            {/* DETAIL BUKU */}
            <div className="flex-grow space-y-4 sm:w-2/3">
              {bookDetails.map((item, index) => (
                <DetailItem key={index} {...item} />
              ))}
            </div>
          </div>

          {/* SINOPSIS */}
          <div className="border-t pt-5 mt-2">
            <h4 className="font-bold text-base mb-3 text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Sinopsis / Deskripsi
            </h4>
            <div className="text-sm text-gray-600 leading-relaxed text-justify bg-gray-50 p-4 rounded-lg border border-gray-100 max-h-48 overflow-y-auto">
              {book.deskripsi ? (
                book.deskripsi.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-2 last:mb-0">
                    {paragraph}
                  </p>
                ))
              ) : (
                <span className="italic text-gray-400">
                  Belum ada deskripsi untuk buku ini.
                </span>
              )}
            </div>
          </div>

          {/* STATUS STOK */}
          <div className="border-t pt-5 mt-5">
            <h4 className="font-bold text-base mb-3 text-gray-800">
              Status Stok Eksemplar
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {stockDetails.map((item, index) => (
                <DetailItem key={index} {...item} />
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end mt-8 pt-4 border-t border-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition shadow-md hover:shadow-lg transform active:scale-95"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailModal
