// 📂 src/hooks/useDataBuku.js
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

export const useDataBuku = (itemsPerPage = 10) => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [buku, setBuku] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // State Modal Detail
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedBookDetail, setSelectedBookDetail] = useState(null)

  // 1. FETCH DATA
  useEffect(() => {
    const fetchBuku = async () => {
      setLoading(true)
      try {
        const res = await fetch('https://apiprawira.my.id/api/buku', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Gagal mengambil data buku.')
        const data = await res.json()
        const dataFinal = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : []
        setBuku(dataFinal)
        setCurrentPage(1)
      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat data buku.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchBuku()
  }, [token])

  // 2. DELETE HANDLER
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin mau hapus?',
      text: 'Data buku dan stok eksemplarnya akan dihapus!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
    })

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://apiprawira.my.id/api/buku/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Gagal menghapus buku.')

        Swal.fire('Berhasil!', 'Buku berhasil dihapus.', 'success')

        setBuku((prev) => {
          const newData = prev.filter((b) => b.id !== id)
          const totalPagesAfterDelete = Math.ceil(newData.length / itemsPerPage)
          if (
            currentPage > totalPagesAfterDelete &&
            totalPagesAfterDelete > 0
          ) {
            setCurrentPage(totalPagesAfterDelete)
          } else if (newData.length === 0) {
            setCurrentPage(1)
          }
          return newData
        })
      } catch (err) {
        Swal.fire('Oops!', 'Terjadi kesalahan saat menghapus.', 'error')
      }
    }
  }

  // 3. NAVIGATION HANDLERS
  const handleEdit = (id) => navigate(`/admin/DataBuku/Edit/${id}`)
  const handleDetailStok = (bukuId) =>
    navigate(`/admin/DataEksemplar?buku_id=${bukuId}`)

  // 4. MODAL HANDLERS
  const handleShowDetail = (book) => {
    setSelectedBookDetail(book)
    setShowDetailModal(true)
  }
  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedBookDetail(null)
  }

  // 5. FILTER & PAGINATION
  const filteredBuku = useMemo(() => {
    const keyword = search.toLowerCase()
    return buku.filter((b) =>
      [b.judul, b.isbn, b.penulis, b.penerbit, b.kategori_nama]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    )
  }, [search, buku])

  const totalItems = filteredBuku.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedBuku = filteredBuku.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1)
  }
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1)
  }

  return {
    buku, // Data asli
    paginatedBuku, // Data per halaman
    loading,
    search,
    setSearch,
    // Pagination props
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    handleNextPage,
    handlePrevPage,
    // Handlers
    handleDelete,
    handleEdit,
    handleDetailStok,
    // Modal props
    showDetailModal,
    selectedBookDetail,
    handleShowDetail,
    handleCloseDetailModal,
  }
}
