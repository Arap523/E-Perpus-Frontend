// 📂 src/hooks/useFormTambahPeminjaman.js
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

export const useFormTambahPeminjaman = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // State Data Dropdown
  const [listMurid, setListMurid] = useState([])
  const [listBuku, setListBuku] = useState([])

  // State Form & Loading
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [formData, setFormData] = useState({
    murid_id: '',
    buku_id: '',
    tanggal_pinjam: new Date().toISOString().split('T')[0],
    tanggal_kembali: '',
  })

  // 1. Fetch Data Murid & Buku
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [muridRes, bukuRes] = await Promise.all([
          axios.get('https://apiprawira.my.id/api/murid', { headers }),
          axios.get('https://apiprawira.my.id/api/buku', { headers }),
        ])

        const dataMurid = Array.isArray(muridRes.data)
          ? muridRes.data
          : muridRes.data.data
        const dataBuku = Array.isArray(bukuRes.data)
          ? bukuRes.data
          : bukuRes.data.data

        setListMurid(dataMurid || [])

        // Filter buku yang stoknya tersedia
        const bukuTersedia = (dataBuku || []).filter(
          (b) => b.total_eksemplar - b.non_tersedia_inventory > 0
        )
        setListBuku(bukuTersedia)
      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat data pilihan.', 'error')
      } finally {
        setInitLoading(false)
      }
    }
    fetchData()
  }, [token])

  // 2. Logic Otomatis Tanggal Kembali (+7 Hari)
  useEffect(() => {
    if (formData.tanggal_pinjam) {
      const tglPinjam = new Date(formData.tanggal_pinjam)
      const tglKembali = new Date(tglPinjam)
      tglKembali.setDate(tglPinjam.getDate() + 7)

      setFormData((prev) => ({
        ...prev,
        tanggal_kembali: tglKembali.toISOString().split('T')[0],
      }))
    }
  }, [formData.tanggal_pinjam])

  // 3. Handle Change Input
  const handleChange = (e) => {
    const { name, value } = e.target // Pastikan input punya props `name`
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 4. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.murid_id || !formData.buku_id) {
        throw new Error('Mohon pilih murid dan buku.')
      }

      const payload = {
        murid_id: parseInt(formData.murid_id),
        buku_id: parseInt(formData.buku_id),
        tanggal_pinjam: new Date(formData.tanggal_pinjam).toISOString(),
        tanggal_kembali: new Date(formData.tanggal_kembali).toISOString(),
        status_pinjam: 'dipinjam',
      }

      await axios.post('https://apiprawira.my.id/api/peminjaman', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.fire('Berhasil', 'Peminjaman berhasil dicatat!', 'success')
      navigate('/admin/DataPeminjaman')
    } catch (err) {
      console.error(err)
      Swal.fire('Gagal', err.response?.data?.message || err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    listMurid,
    listBuku,
    formData,
    loading,
    initLoading,
    handleChange,
    handleSubmit,
    navigate,
  }
}
