// 📂 src/hooks/useFormEditEksemplar.js
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

export const useFormEditEksemplar = () => {
  const navigate = useNavigate()
  const { id: eksemplarId } = useParams()
  const token = localStorage.getItem('token')

  const [statusBaru, setStatusBaru] = useState('')
  const [noInventarisBaru, setNoInventarisBaru] = useState('')
  const [detailEksemplar, setDetailEksemplar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Pastikan URL ini sesuai dengan Backend
  const EKSEMPLAR_API = `https://apiprawira.my.id/api/eksemplar/${eksemplarId}`

  // 1. FETCH DETAIL
  useEffect(() => {
    const fetchDetail = async () => {
      if (!token || !eksemplarId) {
        navigate('/admin/DataEksemplar')
        return
      }

      try {
        // NOTE: Pastikan di backend route GET detail-nya '/:id/detail' atau '/:id'
        // Sesuaikan dengan route backend terakhir yang lu pake.
        // Kalau pakai code route terakhir gw, route-nya: router.get("/:id/detail", ...)
        const res = await fetch(`${EKSEMPLAR_API}/detail`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Gagal mengambil detail eksemplar.')

        const data = await res.json()
        setDetailEksemplar(data)
        setStatusBaru(data.status)
        setNoInventarisBaru(data.no_inventaris || '')
      } catch {
        Swal.fire('Error', 'Gagal memuat detail eksemplar.', 'error')
        navigate('/admin/DataEksemplar')
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [eksemplarId, token, navigate, EKSEMPLAR_API])

  // 2. HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasi perubahan
    const isStatusChanged = statusBaru !== detailEksemplar.status
    const isInventarisChanged =
      noInventarisBaru !== detailEksemplar.no_inventaris

    if (!isStatusChanged && !isInventarisChanged) {
      Swal.fire('Info', 'Tidak ada perubahan yang dilakukan.', 'info')
      return
    }

    // 🔥 FITUR BARU: WARNING KHUSUS STATUS HILANG/RUSAK
    if (statusBaru === 'hilang' || statusBaru === 'rusak') {
      const confirm = await Swal.fire({
        title: `Ubah Status jadi ${statusBaru.toUpperCase()}?`,
        text: 'Jika buku ini sedang dipinjam, sistem akan otomatis menyelesaikan peminjaman dan memberikan DENDA (Harga Buku) kepada siswa. Lanjutkan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Proses!',
        cancelButtonText: 'Batal',
      })

      if (!confirm.isConfirmed) return
    }

    setSubmitting(true)
    const payload = {}
    if (isStatusChanged) payload.status = statusBaru
    if (isInventarisChanged) payload.no_inventaris = noInventarisBaru

    try {
      // 🔥 FIX PENTING: Ganti method jadi PUT (sesuai route backend)
      const res = await fetch(EKSEMPLAR_API, {
        method: 'PUT', // DULU: PATCH, SEKARANG: PUT
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        // Tampilkan pesan sukses + info denda dari backend (jika ada)
        let pesanSukses = `Eksemplar berhasil diperbarui.`
        if (data.info) {
          pesanSukses += ` ${data.info}` // "Denda Rp 80.000 dibebankan..."
        }

        await Swal.fire('Berhasil!', pesanSukses, 'success')
        navigate('/admin/DataEksemplar')
      } else {
        throw new Error(data.message || 'Gagal menyimpan perubahan.')
      }
    } catch (error) {
      console.error(error)
      Swal.fire('Error!', error.message || 'Terjadi kesalahan server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return {
    detailEksemplar,
    statusBaru,
    setStatusBaru,
    noInventarisBaru,
    setNoInventarisBaru,
    loading,
    submitting,
    handleSubmit,
    navigate,
  }
}
