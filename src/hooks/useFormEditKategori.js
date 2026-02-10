// 📂 src/hooks/useFormEditKategori.js
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useFormEditKategori = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [namaKategori, setNamaKategori] = useState('')
  const [loading, setLoading] = useState(true)

  // 1. Fetch Data by ID
  useEffect(() => {
    const fetchAndFindKategori = async () => {
      setLoading(true)
      try {
        const res = await axios.get('https://apiprawira.my.id/api/kategori')
        const rawData = res.data.data || res.data
        const dataArray = Array.isArray(rawData) ? rawData : []
        const found = dataArray.find((k) => k.id == id)

        if (found) {
          setNamaKategori(found.nama_kategori)
        } else {
          Swal.fire('Oops!', 'Data kategori tidak ditemukan.', 'warning')
          navigate('/admin/DataKategori')
        }
      } catch (err) {
        console.error(err)
        Swal.fire('Oops!', 'Gagal memuat data kategori.', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAndFindKategori()
    }
  }, [id, navigate])

  // 2. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!namaKategori.trim()) return

    try {
      await axios.put(
        `https://apiprawira.my.id/api/kategori/${id}`,
        { nama_kategori: namaKategori },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kategori berhasil diperbarui.',
        timer: 1500,
        showConfirmButton: false,
      })

      navigate('/admin/DataKategori')
    } catch (err) {
      console.error(err)
      Swal.fire('Oops!', 'Gagal memperbarui kategori.', 'error')
    }
  }

  return {
    namaKategori,
    setNamaKategori,
    handleSubmit,
    loading,
    navigate,
  }
}
