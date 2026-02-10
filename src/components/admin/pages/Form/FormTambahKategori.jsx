// src/admin/pages/Form/FormTambahKategori.jsx
import { useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

function FormTambahKategori() {
  const [namaKategori, setNamaKategori] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      await axios.post(
        'https://apiprawira.my.id/api/kategori',
        { nama_kategori: namaKategori },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      Swal.fire('Berhasil!', 'Kategori berhasil ditambahkan.', 'success')
      navigate('/admin/DataKategori')
    } catch (err) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.message === 'Kategori sudah ada.'
      ) {
        Swal.fire('Duplikat!', 'Kategori sudah ada.', 'warning')
      } else {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menambahkan.', 'error')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tambah Kategori</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 space-y-4"
      >
        <input
          type="text"
          placeholder="Nama Kategori"
          value={namaKategori}
          onChange={(e) => setNamaKategori(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/DataKategori')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormTambahKategori
