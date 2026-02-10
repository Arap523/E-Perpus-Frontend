import { X, User, MapPin, Phone, Mail, Hash, BookOpen } from 'lucide-react'

const MuridDetailModal = ({ isOpen, onClose, murid }) => {
  if (!isOpen || !murid) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md md:max-w-3xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex justify-between items-center bg-gray-50 px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            Detail Murid
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Modal (Scrollable di HP) */}
        <div className="p-4 md:p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Bagian Kiri: Foto & Status */}
            <div className="flex flex-col items-center gap-3 md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6 shrink-0">
              <div className="relative">
                <img
                  src={
                    murid.profile_picture
                      ? `https://apiprawira.my.id/${murid.profile_picture}`
                      : 'https://via.placeholder.com/150?text=No+Img'
                  }
                  alt={murid.namaLengkap}
                  // Responsive Image Size: w-24 di HP, w-32 di Desktop
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-50 shadow-md"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://via.placeholder.com/150?text=Error'
                  }}
                />
                <span
                  className={`absolute bottom-0 right-0 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border-2 border-white ${
                    murid.status === 'aktif'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {murid.status || 'Non-Aktif'}
                </span>
              </div>

              <div className="text-center w-full">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 break-words">
                  {murid.namaLengkap}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-medium">
                  {murid.nis}
                </p>
              </div>
            </div>

            {/* Bagian Kanan: Informasi Detail */}
            <div className="md:w-2/3 space-y-4">
              {/* Grid: 1 kolom di HP, 2 kolom di Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={<Hash size={14} className="md:w-4 md:h-4" />}
                  label="Kelas"
                  value={murid.kelas}
                />

                <InfoItem
                  icon={<BookOpen size={14} className="md:w-4 md:h-4" />}
                  label="Jurusan"
                  value={murid.jurusan}
                />

                <InfoItem
                  icon={<User size={14} className="md:w-4 md:h-4" />}
                  label="Jenis Kelamin"
                  value={murid.jenis_kelamin?.replace('_', '-')}
                />

                <InfoItem
                  icon={<Phone size={14} className="md:w-4 md:h-4" />}
                  label="Nomor Telepon"
                  value={murid.telepon}
                />

                {/* Email & Alamat (Full Width) */}
                <InfoItem
                  icon={<Mail size={14} className="md:w-4 md:h-4" />}
                  label="Email"
                  value={murid.email}
                  fullWidth
                />

                <InfoItem
                  icon={<MapPin size={14} className="md:w-4 md:h-4" />}
                  label="Alamat"
                  value={murid.alamat}
                  fullWidth
                />

                {/* Tanggal Bergabung */}
                <InfoItem
                  icon={<Hash size={14} className="md:w-4 md:h-4" />}
                  label="Tanggal Bergabung"
                  value={new Date(murid.created_at).toLocaleDateString(
                    'id-ID',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                  fullWidth // Biar rapi di bawah sendirian
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="bg-gray-50 px-4 py-3 md:px-6 md:py-4 flex justify-end border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm md:text-base transition w-full md:w-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

// Komponen Kecil buat Item Info biar rapi
const InfoItem = ({ icon, label, value, fullWidth = false }) => (
  <div
    className={`flex flex-col p-2 rounded-lg hover:bg-gray-50 transition ${fullWidth ? 'col-span-1 sm:col-span-2' : ''}`}
  >
    <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1.5 mb-1 uppercase tracking-wide">
      {icon} {label}
    </span>
    <p className="text-sm md:text-base font-semibold text-gray-800 break-words leading-tight">
      {value || '-'}
    </p>
  </div>
)

export default MuridDetailModal
