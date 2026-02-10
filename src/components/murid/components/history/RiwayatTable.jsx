// 📂 src/components/murid/RiwayatTable.jsx
import { useState } from 'react'
import { BookOpen, Eye, Filter } from 'lucide-react'

export default function RiwayatTable({
  data,
  loading,
  search,
  onDetailClick,
  onClearSearch,
}) {
  const [imgError, setImgError] = useState({})

  // 🔹 HELPER STYLES
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase() || ''
    switch (s) {
      case 'selesai':
      case 'dikembalikan':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30'
      case 'dipinjam':
      case 'berjalan':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30'
      case 'booking':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30'
      case 'batal':
      case 'telat':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/30'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200 ring-gray-500/30'
    }
  }

  const getImageUrl = (path) => {
    if (!path) return null
    let cleanPath = path.replace(/\\/g, '/').replace('public/', '')
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
    if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`
    return `https://apiprawira.my.id/${cleanPath}`
  }

  // 🔹 RENDER LOADING
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse text-xs md:text-base">
          Memuat data...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* HEADER TABLE: text-[10px] (HP) -> text-xs (Desktop) */}
              <tr className="bg-gray-50/50 border-b border-gray-200 text-[10px] md:text-xs uppercase tracking-wider text-gray-900 font-bold">
                {/* 1. KOLOM COVER */}
                <th className="px-4 py-4 md:px-6 md:py-5 w-20 md:w-24 text-center border-r border-gray-200">
                  <span className="md:hidden">BUKU</span>
                  <span className="hidden md:inline">COVER</span>
                </th>
                {/* 2. KOLOM JUDUL */}
                <th className="px-6 py-5 hidden md:table-cell text-center border-r border-gray-200">
                  JUDUL BUKU
                </th>
                {/* 3. KOLOM KODE BOOKING */}
                <th className="px-6 py-5 hidden md:table-cell text-center border-r border-gray-200">
                  KODE BOOKING
                </th>
                {/* 4. KOLOM STATUS */}
                <th className="px-6 py-5 hidden md:table-cell text-center border-r border-gray-200">
                  STATUS
                </th>
                {/* 5. KOLOM AKSI */}
                <th className="px-4 py-4 md:px-6 md:py-5 text-center w-20 md:w-auto">
                  <span className="md:hidden">DETAIL</span>
                  <span className="hidden md:inline">AKSI</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  {/* 1. COVER IMAGE */}
                  <td className="px-4 py-4 md:px-6 align-middle border-r border-gray-200">
                    <div className="flex justify-center">
                      <div className="w-14 h-20 md:w-12 md:h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 relative">
                        {item.cover && !imgError[item.id] ? (
                          <img
                            src={getImageUrl(item.cover)}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            onError={() =>
                              setImgError((prev) => ({
                                ...prev,
                                [item.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <BookOpen size={20} />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. JUDUL BUKU */}
                  <td className="px-6 py-4 hidden md:table-cell border-r border-gray-200 align-middle text-center">
                    <p className="font-semibold text-gray-900 line-clamp-2 text-sm">
                      {item.judul ?? item.judul_buku}
                    </p>
                  </td>

                  {/* 3. KODE BOOKING */}
                  <td className="px-6 py-4 hidden md:table-cell border-r border-gray-200 align-middle text-center">
                    <span className="font-mono text-sm text-gray-700 select-all">
                      {item.kode_booking}
                    </span>
                  </td>

                  {/* 4. STATUS */}
                  <td className="px-6 py-4 hidden md:table-cell text-center border-r border-gray-200 align-middle">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ring-1 capitalize ${getStatusStyle(item.status_pinjam)}`}
                    >
                      {item.status_pinjam}
                    </span>
                  </td>

                  {/* 5. TOMBOL AKSI */}
                  <td className="px-4 py-4 md:px-6 text-center align-middle">
                    <button
                      onClick={() => onDetailClick(item)}
                      className="h-9 w-9 md:h-10 md:w-10 inline-flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-teal-600 hover:bg-teal-50 border border-gray-100 transition-colors"
                    >
                      <Eye size={18} className="md:w-[20px] md:h-[20px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Filter className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900">
            Tidak ada riwayat ditemukan
          </h3>
          <p className="text-xs md:text-sm text-gray-500 max-w-sm mt-1">
            {search
              ? `Tidak ada hasil untuk pencarian "${search}"`
              : 'Kamu belum pernah meminjam buku.'}
          </p>
          {search && (
            <button
              onClick={onClearSearch}
              className="mt-4 text-xs md:text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Hapus pencarian
            </button>
          )}
        </div>
      )}
    </div>
  )
}
