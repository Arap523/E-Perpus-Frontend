// 📂 src/hooks/useDataEksemplar.js
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import axios from 'axios'

export const useDataEksemplar = (itemsPerPage = 10) => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [eksemplar, setEksemplar] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 1. FETCH DATA
  useEffect(() => {
    const fetchEksemplar = async () => {
      setLoading(true)
      try {
        const res = await axios.get('https://apiprawira.my.id/api/eksemplar', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dataFinal = Array.isArray(res.data)
          ? res.data
          : res.data.data || []
        setEksemplar(dataFinal)
        setCurrentPage(1)
      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Gagal memuat data inventaris stok.', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchEksemplar()
  }, [token])

  // 2. DELETE HANDLER
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Yakin mau hapus?',
      text: 'Eksemplar ini akan dihapus permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://apiprawira.my.id/api/eksemplar/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        Swal.fire('Berhasil!', 'Eksemplar dihapus.', 'success')

        setEksemplar((prev) => {
          const newData = prev.filter((e) => e.id !== id)
          // Adjust pagination after delete
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
        Swal.fire('Oops!', 'Gagal menghapus eksemplar.', 'error')
      }
    }
  }

  // 3. EDIT HANDLER
  const handleEdit = (id) => {
    navigate(`/admin/DataEksemplar/Edit/${id}`)
  }

  // 4. FILTER & PAGINATION LOGIC
  const filteredEksemplar = useMemo(() => {
    const keyword = search.toLowerCase()
    return eksemplar.filter((e) =>
      [e.kode_eksemplar, e.judul_buku, e.status, e.no_inventaris]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    )
  }, [search, eksemplar])

  const totalItems = filteredEksemplar.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedEksemplar = filteredEksemplar.slice(
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
    eksemplar, // Data mentah (opsional)
    paginatedEksemplar, // Data per page
    loading,
    search,
    setSearch,
    // Pagination Props
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
  }
}
