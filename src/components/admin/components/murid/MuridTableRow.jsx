import { Pencil, Trash2, Eye, User } from 'lucide-react'

const MuridTableRow = ({ murid, onEdit, onDelete, onDetail }) => {
  return (
    <tr>
      {/* ✅ 1. FOTO (Tampil Terus) */}
      <td className="border px-2 py-2 md:px-3 text-center">
        <div className="flex justify-center items-center">
          {murid.profile_picture ? (
            <img
              src={`https://apiprawira.my.id/${murid.profile_picture}`}
              alt={murid.namaLengkap}
              // Mobile: w-8 h-8 (32px), Desktop: w-10 h-10 (40px)
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-gray-300 shadow-sm"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'https://via.placeholder.com/150?text=Error'
              }}
            />
          ) : (
            // Mobile: w-8 h-8, Desktop: w-10 h-10
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              <User size={18} className="md:w-5 md:h-5" />
            </div>
          )}
        </div>
      </td>

      {/* ✅ 2. NAMA (Tampil Terus) */}
      <td className="border px-2 py-2 md:px-3 font-medium text-gray-800">
        {/* Mobile: text-xs (kecil), Desktop: text-sm (normal) */}
        <div className="text-xs md:text-sm break-words max-w-[120px] md:max-w-none">
          {murid.namaLengkap}
        </div>
      </td>

      {/* ❌ 3. NIS (Sembunyi di HP) */}
      <td className="border px-3 py-2 text-gray-600 hidden md:table-cell text-sm">
        {murid.nis}
      </td>

      {/* ❌ 4. KELAS (Sembunyi di HP) */}
      <td className="border px-3 py-2 text-gray-600 font-medium hidden md:table-cell text-sm">
        {murid.kelas}
      </td>

      {/* ❌ 5. JURUSAN (Sembunyi di HP) */}
      <td className="border px-3 py-2 text-gray-600 hidden md:table-cell text-sm">
        {murid.jurusan || '-'}
      </td>

      {/* ❌ 6. STATUS (Sembunyi di HP) */}
      <td className="border px-3 py-2 text-center hidden md:table-cell">
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            murid.status === 'aktif'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {murid.status || 'Non-Aktif'}
        </span>
      </td>

      {/* ✅ 7. AKSI (Tampil Terus) */}
      <td className="border px-2 py-2 md:px-3 text-center whitespace-nowrap">
        <div className="flex gap-1 justify-center">
          {/* Detail */}
          <button
            onClick={() => onDetail(murid)}
            className="flex items-center justify-center text-gray-700 hover:bg-gray-100 border border-gray-400 p-1 md:px-2 md:py-1 rounded-md transition"
            title="Detail"
          >
            {/* Mobile: Icon 14px, Desktop: Icon 16px + Text */}
            <Eye size={14} className="md:w-4 md:h-4" />
            <span className="hidden md:inline ml-1 text-xs">Detail</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(murid.id)}
            className="flex items-center justify-center text-blue-600 hover:bg-blue-50 border border-blue-600 p-1 md:px-2 md:py-1 rounded-md transition"
            title="Edit"
          >
            <Pencil size={14} className="md:w-4 md:h-4" />
            <span className="hidden md:inline ml-1 text-xs">Edit</span>
          </button>

          {/* Hapus */}
          <button
            onClick={() => onDelete(murid.id)}
            className="flex items-center justify-center text-red-600 hover:bg-red-50 border border-red-600 p-1 md:px-2 md:py-1 rounded-md transition"
            title="Hapus"
          >
            <Trash2 size={14} className="md:w-4 md:h-4" />
            <span className="hidden md:inline ml-1 text-xs">Hapus</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default MuridTableRow
