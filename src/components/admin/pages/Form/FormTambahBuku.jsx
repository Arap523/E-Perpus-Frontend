import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import PropTypes from 'prop-types'
import { Upload, FileText } from 'lucide-react'

// ==========================================================
// Reusable Input Component
// ==========================================================
function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  min,
  required = true,
}) {
  return (
    <div className="w-full">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        placeholder={placeholder}
        className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  required: PropTypes.bool,
}

// ==========================================================
// Form Tambah Buku
// ==========================================================
function FormTambahBuku() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    judul: '',
    isbn: '',
    kategori_id: '',
    penulis: '',
    tahun_terbit: '',
    penerbit: '',
    stok_awal: '',
    deskripsi: '',
    cover: null,
  })

  const [kategoriList, setKategoriList] = useState([])
  const [loading, setLoading] = useState(false)
  const [coverName, setCoverName] = useState('')

  // Helper: Hitung Jumlah Kata
  const countWords = (text) => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0
  }

  // ==========================================================
  // Fetch Kategori
  // ==========================================================
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('https://apiprawira.my.id/api/kategori', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await res.json()
        setKategoriList(Array.isArray(result) ? result : result.data || [])
      } catch (error) {
        console.error('Gagal fetch kategori:', error)
      }
    }

    fetchKategori()
  }, [])

  // ==========================================================
  // Handle Input Change
  // ==========================================================
  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === 'cover') {
      const file = files?.[0]
      if (file && file.size > 5 * 1024 * 1024) {
        Swal.fire('Ukuran File Terlalu Besar', 'Maksimal 5MB', 'error')
        e.target.value = null
        return
      }

      setFormData((prev) => ({ ...prev, cover: file }))
      setCoverName(file?.name || '')
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'stok_awal' ? (value === '' ? '' : parseInt(value)) : value,
    }))
  }

  // ==========================================================
  // Submit Form
  // ==========================================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // 1. Validasi Stok
    if (!formData.stok_awal || formData.stok_awal < 1) {
      Swal.fire('Validasi Gagal', 'Stok buku minimal harus 1.', 'warning')
      setLoading(false)
      return
    }

    // 2. Validasi Jumlah Kata Deskripsi
    const currentWordCount = countWords(formData.deskripsi)
    if (currentWordCount > 300) {
      Swal.fire(
        'Deskripsi Terlalu Panjang',
        `Maksimal 300 kata. Saat ini: ${currentWordCount} kata.`,
        'warning'
      )
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    const payload = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== '') payload.append(key, value)
    })

    try {
      const res = await fetch('https://apiprawira.my.id/api/buku', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message)
      }

      Swal.fire('Berhasil!', 'Buku berhasil ditambahkan.', 'success')
      navigate('/admin/DataBuku')
    } catch (error) {
      Swal.fire('Error!', error.message || 'Terjadi kesalahan server.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Hitung kata untuk UI
  const wordCount = countWords(formData.deskripsi)
  const isOverLimit = wordCount > 300

  // ==========================================================
  // Render
  // ==========================================================
  return (
    <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-700">
          Tambah Buku Baru
        </h2>

        <div className="hidden md:flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/DataBuku')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Batal
          </button>
          <button
            type="submit"
            form="formTambahBuku"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      <form
        id="formTambahBuku"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Judul Buku"
          name="judul"
          value={formData.judul}
          onChange={handleChange}
        />
        <Input
          label="ISBN"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
        />
        <Input
          label="Penulis"
          name="penulis"
          value={formData.penulis}
          onChange={handleChange}
        />
        <Input
          label="Penerbit"
          name="penerbit"
          value={formData.penerbit}
          onChange={handleChange}
        />
        <Input
          label="Tahun Terbit"
          name="tahun_terbit"
          type="number"
          value={formData.tahun_terbit}
          onChange={handleChange}
        />

        <div className="w-full">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            name="kategori_id"
            value={formData.kategori_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kategori}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Jumlah Stok Buku"
          name="stok_awal"
          type="number"
          min="1"
          value={formData.stok_awal}
          onChange={handleChange}
        />

        {/* Cover */}
        <div className="w-full">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Cover Buku
          </label>
          <div className="relative">
            <input
              type="file"
              name="cover"
              accept="image/*"
              onChange={handleChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex items-center gap-3 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-600">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>{coverName || 'Pilih file gambar'}</span>
            </div>
          </div>
        </div>

        {/* Deskripsi (Full Width) */}
        <div className="col-span-full">
          <label className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-700">
            <FileText size={16} className="text-blue-500" /> Deskripsi Buku{' '}
            <span className="text-red-500">*</span>
          </label>

          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            required
            placeholder="Tuliskan deskripsi buku (maks 300 kata) "
            className={`w-full border p-3 rounded-md h-32 resize-none focus:outline-none focus:ring-2 ${
              isOverLimit
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />

          <div className="flex justify-between mt-1 px-1">
            <span
              className={`text-xs font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}
            >
              {wordCount} / 300 Kata
            </span>
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="col-span-full flex md:hidden gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/DataBuku')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormTambahBuku
