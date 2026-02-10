import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import api from '../components/utils/api'

export const useFormEditBuku = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // --- 1. STATE FORM (UPDATE: Tambah Harga) ---
  const [form, setForm] = useState({
    judul: '',
    isbn: '',
    kategori_id: '',
    penulis: '',
    tahun_terbit: '',
    penerbit: '',
    total_eksemplar: 0,
    non_tersedia_inventory: 0,
    deskripsi: '',
    harga: '', // 🔥 PENTING: Tambahin ini biar input harganya jalan
  })

  // State Lainnya
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverName, setCoverName] = useState('')
  const [kategoriList, setKategoriList] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  // Helper URL Gambar
  const getImageUrl = (path) => {
    if (!path) return null
    let cleanPath = path.replace(/\\/g, '/').replace('public/', '')
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
    if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`
    return `https://apiprawira.my.id/${cleanPath}`
  }

  // --- 2. FETCH DATA (UPDATE: Ambil Harga dari DB) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBuku, resKategori] = await Promise.all([
          api.get(`/api/buku/${id}`),
          api.get('/api/kategori'),
        ])

        const buku = resBuku.data

        setForm({
          judul: buku.judul || '',
          isbn: buku.isbn || '',
          kategori_id: buku.kategori_id?.toString() || '',
          penulis: buku.penulis || '',
          tahun_terbit: buku.tahun_terbit || '',
          penerbit: buku.penerbit || '',
          total_eksemplar: buku.total_eksemplar || 0,
          non_tersedia_inventory: buku.non_tersedia_inventory || 0,
          deskripsi: buku.deskripsi || '',
          // 🔥 UPDATE: Kalau harga null (dari DB), ubah jadi string kosong biar form ga error
          harga: buku.harga ? buku.harga : '',
        })

        if (buku.cover) {
          setCoverPreview(getImageUrl(buku.cover))
          setCoverName(buku.cover)
        }

        const listKat = Array.isArray(resKategori.data)
          ? resKategori.data
          : resKategori.data.data || []

        setKategoriList(listKat)
      } catch (error) {
        console.error(error)
        Swal.fire('Error', 'Gagal memuat data buku atau kategori.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // 3. Handle Change Input
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  // 4. Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Ukuran File Terlalu Besar', 'Maksimal 5MB', 'error')
        return
      }
      setCoverFile(file)
      setCoverName(file.name)
      setImgError(false)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  // 5. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi Stok
    if (
      parseInt(form.non_tersedia_inventory) > parseInt(form.total_eksemplar)
    ) {
      Swal.fire(
        'Validasi Stok',
        'Jumlah buku rusak tidak boleh > total stok!',
        'warning'
      )
      return
    }

    // Validasi Deskripsi
    const wordCount = form.deskripsi.trim().split(/\s+/).filter(Boolean).length
    if (wordCount > 300) {
      Swal.fire(
        'Deskripsi Kepanjangan',
        `Maksimal 300 kata. Anda menulis ${wordCount} kata.`,
        'warning'
      )
      return
    }

    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      // Logic ini udah aman buat harga.
      // Kalau harga kosong string (""), backend bakal nerima dan ngubah jadi null.
      if (value !== null) data.append(key, value)
    })

    if (coverFile) {
      data.append('cover', coverFile)
    }

    try {
      Swal.fire({
        title: 'Menyimpan...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      await api.put(`/api/buku/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      Swal.fire('Berhasil!', 'Data buku berhasil diperbarui.', 'success')
      navigate('/admin/DataBuku')
    } catch (error) {
      console.error(error)
      const msg =
        error.response?.data?.message || 'Gagal memperbarui data buku.'
      Swal.fire('Error!', msg, 'error')
    }
  }

  return {
    form,
    loading,
    kategoriList,
    coverPreview,
    coverName,
    imgError,
    setImgError,
    handleChange,
    handleFileChange,
    handleSubmit,
    navigate,
  }
}
