// 📂 src/hooks/useFormEditPeminjaman.js
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { formatToYMD } from '../components/utils/formatters'

const DENDA_PER_HARI = 10000

export const useFormEditPeminjaman = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [displayInfo, setDisplayInfo] = useState({
    kode_booking: '...',
    nama_murid: 'Memuat...',
    judul_buku: 'Memuat...',
    kode_eksemplar: 'Memuat...',
  })

  const [formData, setFormData] = useState({
    murid_id: '',
    buku_id: '',
    status_pinjam: 'booking',
    tanggal_pinjam: '',
    tanggal_kembali: '',
    tanggal_actual: '',
    denda: 0,
    id_laporan: null,
  })

  // 1. FETCH DATA BY ID
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://apiprawira.my.id/api/peminjaman`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error('Data peminjaman tidak ditemukan.')

        const json = await res.json()
        const rows = json.data ?? json
        const data = rows.find((p) => p.id.toString() === id.toString())

        if (!data) throw new Error('Data spesifik tidak ditemukan.')

        setFormData({
          murid_id: data.murid_id,
          buku_id: data.buku_id,
          status_pinjam: data.status_pinjam,
          tanggal_pinjam: formatToYMD(data.tanggal_pinjam),
          tanggal_kembali: formatToYMD(data.tanggal_kembali),
          tanggal_actual: data.tanggal_actual
            ? formatToYMD(data.tanggal_actual)
            : '',
          denda: data.denda || 0,
          id_laporan: data.id_laporan || null,
        })

        setDisplayInfo({
          kode_booking: data.kode_booking,
          nama_murid: data.nama_murid ?? data.namaLengkap ?? '-',
          judul_buku: data.judul ?? data.buku_judul ?? '-',
          kode_eksemplar: data.kode_eksemplar ?? data.no_eksemplar ?? '-',
        })
      } catch (err) {
        Swal.fire('Error', err.message, 'error')
        navigate('/admin/DataPeminjaman')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id, navigate, token])

  // 2. AUTO HITUNG DENDA
  useEffect(() => {
    if (
      formData.status_pinjam === 'selesai' &&
      formData.tanggal_kembali &&
      formData.tanggal_actual
    ) {
      const batas = new Date(formData.tanggal_kembali)
      const aktual = new Date(formData.tanggal_actual)
      const selisihWaktu = aktual - batas
      const selisihHari = Math.ceil(selisihWaktu / (1000 * 60 * 60 * 24))
      const totalDenda = selisihHari > 0 ? selisihHari * DENDA_PER_HARI : 0

      setFormData((prev) => ({ ...prev, denda: totalDenda }))
    }
  }, [
    formData.status_pinjam,
    formData.tanggal_actual,
    formData.tanggal_kembali,
  ])

  // 3. HANDLER CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      // Auto isi tanggal aktual kalau status jadi "selesai"
      if (
        name === 'status_pinjam' &&
        value === 'selesai' &&
        !prev.tanggal_actual
      ) {
        newData.tanggal_actual = new Date().toISOString().split('T')[0]
      }
      return newData
    })
  }

  // 4. HANDLER SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (!token) {
      Swal.fire('Error', 'Token tidak ditemukan.', 'error')
      setSaving(false)
      return
    }

    try {
      const payload = {
        ...formData,
        denda: Number(formData.denda),
        tanggal_actual:
          formData.tanggal_actual === '' ? null : formData.tanggal_actual,
      }

      const res = await fetch(`https://apiprawira.my.id/api/peminjaman/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Gagal menyimpan perubahan.')
      }

      Swal.fire({
        title: 'Berhasil!',
        text: 'Data peminjaman diperbarui.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = '/admin/DataPeminjaman'
      })
    } catch (err) {
      Swal.fire('Oops!', err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return {
    formData,
    displayInfo,
    loading,
    saving,
    handleChange,
    handleSubmit,
    navigate,
  }
}
