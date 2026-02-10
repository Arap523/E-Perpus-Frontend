import { Eye, BookOpen } from 'lucide-react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

function BookCard({ buku, kategoriList }) {
  const navigate = useNavigate()

  // 🛠️ FUNGSI FIX URL GAMBAR (Konsisten di semua komponen)
  const getImageUrl = (path) => {
    if (!path) return null

    // 1. Ganti backslash '\' jadi slash '/'
    let cleanPath = path.replace(/\\/g, '/')

    // 2. Hapus 'public/' kalau ada (biar bersih)
    cleanPath = cleanPath.replace('public/', '')

    // 3. Hapus '/' di depan kalau ada (biar gak double)
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1)
    }

    // 4. Cek folder 'uploads'
    // Kalau path belum ada 'uploads/', tambahin paksa
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`
    }

    return `https://apiprawira.my.id/${cleanPath}`
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md hover:scale-[1.02] transition-transform duration-200 flex flex-col items-center text-center h-full">
      {/* AREA GAMBAR */}
      <div className="w-28 sm:w-32 md:w-36 h-40 sm:h-44 md:h-48 mb-3 relative group">
        <img
          src={
            buku.cover ? getImageUrl(buku.cover) : '/assets/default-book.png'
          }
          alt={buku.judul}
          className="w-full h-full object-cover rounded shadow-sm border border-gray-100"
          // Kalau gambar error (404), ganti ke default
          onError={(e) => {
            e.target.onerror = null
            e.target.src = '/assets/default-book.png'
          }}
        />
      </div>

      <h2 className="text-lg font-semibold mb-1 line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
        {buku.judul}
      </h2>

      <p className="text-sm text-gray-600 mb-1 w-full truncate px-2">
        Penulis: {buku.penulis || '-'}
      </p>

      <p className="text-sm text-gray-600 mb-1">
        Tahun: {buku.tahun_terbit || '-'}
      </p>

      <p className="text-sm text-gray-600 mb-1 w-full truncate px-2">
        Kategori:{' '}
        {kategoriList.find((k) => k.id === buku.kategori_id)?.nama_kategori ||
          '-'}
      </p>

      <p
        className={`text-sm font-medium mb-4 ${
          buku.status === 'tersedia' ? 'text-green-600' : 'text-red-500'
        }`}
      >
        {buku.status
          ? buku.status.charAt(0).toUpperCase() + buku.status.slice(1)
          : '-'}
      </p>

      <button
        onClick={() => {
          const user = localStorage.getItem('user')
            ? JSON.parse(localStorage.getItem('user'))
            : null

          if (user?.role === 'murid') {
            navigate(`/murid/book/detailbook/${buku.id}`)
          } else {
            navigate(`/book/detailbook/${buku.id}`)
          }
        }}
        className="mt-auto flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm transition-colors shadow-sm w-full justify-center"
      >
        <Eye size={16} /> Lihat Detail
      </button>
    </div>
  )
}

BookCard.propTypes = {
  buku: PropTypes.object.isRequired,
  kategoriList: PropTypes.array.isRequired,
}

export default BookCard
