import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

const useDataMurid = () => {
  const [muridList, setMuridList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const navigate = useNavigate()

  // 1. Fetch Data
  const fetchMurid = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('https://apiprawira.my.id/api/murid', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const dataFinal = Array.isArray(res.data) ? res.data : res.data.data || []
      setMuridList(dataFinal)
    } catch (err) {
      Swal.fire('Gagal', 'Tidak bisa memuat data murid.', 'error')
    }
  }

  // 2. Delete Logic
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin ingin hapus?',
      text: 'Data murid akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
    })

    if (!result.isConfirmed) return

    Swal.fire({
      title: 'Menghapus...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`https://apiprawira.my.id/api/murid/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchMurid()
      Swal.fire('Berhasil!', 'Murid berhasil dihapus.', 'success')
      setCurrentPage(1)
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus murid.', 'error')
    }
  }

  // 3. Navigation Helpers
  const handleEdit = (id) => navigate(`/admin/DataMurid/Edit/${id}`)
  const handleAdd = () => navigate('/admin/DataMurid/FormTambahMurid')

  // 4. Filtering Logic
  const filteredMurid = useMemo(() => {
    return muridList.filter((murid) => {
      const keyword = searchTerm.toLowerCase()
      const nama = murid.namaLengkap ? murid.namaLengkap.toLowerCase() : ''
      const nis = murid.nis ? murid.nis.toString().toLowerCase() : ''
      return nama.includes(keyword) || nis.includes(keyword)
    })
  }, [muridList, searchTerm])

  // 5. Pagination Logic
  const totalItems = filteredMurid.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)
  const paginatedMurid = filteredMurid.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  // Init Data
  useEffect(() => {
    fetchMurid()
  }, [])

  // Return semua yang dibutuhkan View
  return {
    muridList,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    paginatedMurid,
    handleDelete,
    handleEdit,
    handleAdd,
    handlePrevPage,
    handleNextPage,
  }
}

export default useDataMurid
