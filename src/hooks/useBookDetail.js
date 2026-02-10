// 📂 src/hooks/useBookDetail.js
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { validateBookingTime } from '../components/utils/bookingValidation' // Pastikan path benar

const BASE_URL = import.meta.env.VITE_API_URL || 'https://apiprawira.my.id'

export const useBookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 1. Fetch Data Buku & Rekomendasi
  useEffect(() => {
    const fetchData = async () => {
      // 🛑 PAGAR 1: Jangan nembak API kalau lagi offline
      if (!navigator.onLine) {
        setLoading(false)
        console.warn('Sedang Offline: Menggunakan data dari Cache (jika ada).')
        return
      }

      try {
        setLoading(true)
        // Pake Promise.all udah bener, tapi kita proteksi error-nya
        const [bookRes, recRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/buku/${id}`),
          axios.get(`${BASE_URL}/api/buku/rekomendasi/${id}`),
        ])

        setBook(Array.isArray(bookRes.data) ? bookRes.data[0] : bookRes.data)
        setRecommendations(recRes.data)
        window.scrollTo(0, 0)
      } catch (err) {
        // 🛑 PAGAR 2: Handle Network Error biar gak muncul popup SwAl terus pas internet putus nyambung
        if (err.code !== 'ERR_NETWORK') {
          console.error('Gagal ambil data:', err)
          Swal.fire('Error', 'Gagal memuat detail buku.', 'error')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // 2. Logic Klik Tombol Booking
  const handleBookingClick = async () => {
    if (isSubmitting) return
    const token = localStorage.getItem('token')

    // Cek Login
    if (!token) {
      const result = await Swal.fire({
        title: 'Login Diperlukan!',
        text: 'Silakan login terlebih dahulu untuk melakukan booking.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login Sekarang',
      })
      if (result.isConfirmed) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname)
        navigate('/login')
      }
      return
    }

    // Cek Waktu Operasional (Modular Validasi)
    const isTimeValid = await validateBookingTime()
    if (!isTimeValid) return

    // Cek Stok
    if (book.stok <= 0 || book.status !== 'tersedia') {
      Swal.fire({ icon: 'error', title: 'Stok Kosong' })
      return
    }

    setIsModalOpen(true)
  }

  // 3. Logic Submit Booking ke API
  const handleSubmitBooking = async (tanggalPinjam, qty) => {
    setIsSubmitting(true)
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    // Hitung tgl kembali (7 hari)
    const tglKembali = new Date(
      new Date(tanggalPinjam).setDate(new Date(tanggalPinjam).getDate() + 7)
    ).toISOString()

    try {
      const res = await axios.post(
        `${BASE_URL}/api/peminjaman`,
        {
          user_id: user.id,
          buku_id: book.id,
          jumlah: qty,
          tanggal_pinjam: new Date(tanggalPinjam).toISOString(),
          tanggal_actual: tglKembali,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIsModalOpen(false)
      Swal.fire({
        icon: 'success',
        title: 'Booking Berhasil!',
        text: res.data.message,
      })
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Terjadi kesalahan.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper URL Gambar
  const getImageUrl = useCallback((path) => {
    if (!path) return '/assets/default-book.png'
    let cleanPath = path.replace(/\\/g, '/').replace('public/', '')
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1)
    if (!cleanPath.startsWith('uploads/')) cleanPath = `uploads/${cleanPath}`
    return `${BASE_URL}/${cleanPath}`
  }, [])

  return {
    book,
    recommendations,
    loading,
    isSubmitting,
    isModalOpen,
    setIsModalOpen,
    handleBookingClick,
    handleSubmitBooking,
    getImageUrl,
  }
}
