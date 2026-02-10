import React, { useState } from 'react'
import { Pencil, Trash2, Eye, BookOpen } from 'lucide-react'

const BookTableRow = ({ book, index, onEdit, onDelete, onShowDetail }) => {
  const [imgError, setImgError] = useState(false)

  // 🛠️ FUNGSI FIX URL GAMBAR
  const getImageUrl = (path) => {
    if (!path) return null
    let cleanPath = path.replace(/\\/g, '/')
    cleanPath = cleanPath.replace('public/', '')
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
    if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`
    return `https://apiprawira.my.id/${cleanPath}`
  }

  return (
    <tr
      className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
    >
      {/* 1. COVER (+ JUDUL DI MOBILE) */}
      <td className="border border-gray-300 px-2 py-2 md:px-3 md:py-3 text-center align-top md:align-middle">
        {book.cover && !imgError ? (
          <img
            src={getImageUrl(book.cover)}
            alt={book.judul}
            // Mobile: w-12 h-16 (kecil), Desktop: w-20 h-28 (sedang)
            className="w-12 h-16 md:w-20 md:h-28 object-cover mx-auto rounded border border-gray-200 shadow-sm hover:scale-105 transition-transform duration-200"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-12 h-16 md:w-20 md:h-28 bg-gray-100 flex flex-col items-center justify-center text-[8px] md:text-[10px] mx-auto rounded text-gray-400 border border-gray-200">
            <BookOpen size={20} className="md:w-8 md:h-8" />
            <span className="mt-1 font-medium">No Cover</span>
          </div>
        )}

        {/* --- JUDUL KHUSUS MOBILE (Muncul di bawah gambar) --- */}
        <div className="md:hidden mt-2 w-16 mx-auto">
          {/* 🔥 UPDATE: text-xs (12px) biar standar mobile, bukan text-[10px] */}
          <span className="block text-xs font-bold text-gray-800 line-clamp-3 leading-tight break-words">
            {book.judul}
          </span>
        </div>
      </td>

      {/* 2. JUDUL BUKU (DESKTOP ONLY) */}
      <td className="hidden md:table-cell border border-gray-300 px-4 py-3 align-middle text-center">
        <div className="flex flex-col items-center justify-center h-full">
          <span
            className="text-gray-900 font-bold text-sm hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug"
            title={book.judul}
            onClick={() => onShowDetail(book)}
          >
            {book.judul}
          </span>
        </div>
      </td>

      {/* 3. AKSI */}
      <td className="border border-gray-300 px-2 py-2 md:px-3 md:py-3 text-center whitespace-nowrap align-middle">
        {/* Wrapper Tombol Horizontal */}
        <div className="flex items-center justify-center gap-1.5 md:gap-2">
          {/* Tombol Detail */}
          <button
            onClick={() => onShowDetail(book)}
            className="bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100 p-1.5 md:px-3 md:py-1.5 rounded md:rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
            title="Detail"
          >
            <Eye size={16} className="md:w-4 md:h-4" />
            <span className="hidden md:inline text-xs font-bold">Detail</span>
          </button>

          {/* Tombol Edit */}
          <button
            onClick={() => onEdit(book.id)}
            className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 p-1.5 md:px-3 md:py-1.5 rounded md:rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
            title="Edit"
          >
            <Pencil size={16} className="md:w-4 md:h-4" />
            <span className="hidden md:inline text-xs font-bold">Edit</span>
          </button>

          {/* Tombol Hapus */}
          <button
            onClick={() => onDelete(book.id)}
            className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 p-1.5 md:px-3 md:py-1.5 rounded md:rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
            title="Hapus"
          >
            <Trash2 size={16} className="md:w-4 md:h-4" />
            <span className="hidden md:inline text-xs font-bold">Hapus</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default BookTableRow
