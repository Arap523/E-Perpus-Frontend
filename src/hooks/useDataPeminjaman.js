// 📂 src/hooks/useDataPeminjaman.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { io } from 'socket.io-client'

// Ganti URL sesuai port backend lu
const SOCKET_URL = 'https://apiprawira.my.id'
const ITEMS_PER_PAGE = 10

export const useDataPeminjaman = () => {
  const navigate = useNavigate()

  // --- STATE ---
  const [peminjaman, setPeminjaman] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState(null)

  // --- FETCH DATA ---
  const fetchPeminjaman = useCallback(async () => {
    setPeminjaman((prev) => {
      if (prev.length === 0) setLoading(true)
      return prev
    })

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('https://apiprawira.my.id/api/peminjaman', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) throw new Error('Gagal mengambil data')

      const json = await res.json()
      setPeminjaman(json.data ?? json)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  // --- SOCKET & EFFECT ---
  useEffect(() => {
    fetchPeminjaman()

    const socket = io(SOCKET_URL)

    socket.on('refresh_peminjaman_admin', () => {
      console.log('♻️ Ada booking baru! Refreshing table...')
      fetchPeminjaman()

      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      })
      Toast.fire({
        icon: 'info',
        title: 'Data peminjaman diperbarui',
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [fetchPeminjaman])

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')
    if (!token) return Swal.fire('Error', 'Sesi habis, login ulang.', 'error')

    const result = await Swal.fire({
      title: 'Yakin hapus data?',
      text: 'Data akan hilang permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    })

    if (!result.isConfirmed) return

    try {
      Swal.showLoading()
      const res = await fetch(`https://apiprawira.my.id/api/peminjaman/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Gagal menghapus')

      // Optimistic UI Update
      setPeminjaman((prev) => {
        const updated = prev.filter((item) => item.id !== id)
        const maxPage = Math.ceil(updated.length / ITEMS_PER_PAGE)
        if (currentPage > maxPage && maxPage > 0) {
          setCurrentPage(maxPage)
        }
        return updated
      })

      Swal.fire('Berhasil!', 'Data telah dihapus.', 'success')
    } catch (error) {
      console.error(error)
      Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error')
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin/DataPeminjaman/Edit/${id}`)
  }

  const handleShowDetail = (data) => {
    setSelectedData(data)
    setIsModalOpen(true)
  }

  // --- FILTER & PAGINATION ---
  const filteredData = useMemo(() => {
    if (!search) return peminjaman

    const lowerSearch = search.toLowerCase()
    return peminjaman.filter((item) => {
      const searchString = `
        ${item.kode_booking} 
        ${item.nama_murid ?? item.namaLengkap} 
        ${item.nis ?? item.murid_nis} 
        ${item.judul ?? item.buku_judul}
        ${item.status_pinjam}
      `.toLowerCase()
      return searchString.includes(lowerSearch)
    })
  }, [search, peminjaman])

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  return {
    // Data & Loading
    peminjaman,
    loading,
    paginatedData,

    // Pagination Props
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    handleNextPage,
    handlePrevPage,

    // Search
    search,
    setSearch,

    // Modal
    isModalOpen,
    setIsModalOpen,
    selectedData,

    // Actions
    handleDelete,
    handleEdit,
    handleShowDetail,
  }
}
