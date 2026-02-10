import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

// Import Komponen Modular
import KategoriHeader from '../components/categories/KategoriHeader'
import KategoriTable from '../components/categories/KategoriTable'
import PaginationControls from '../layouts/PaginationControls'

function DataKategori() {
  const [kategoriList, setKategoriList] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const navigate = useNavigate()
  const ITEMS_PER_PAGE = 10

  // 1. FETCH DATA
  const fetchKategori = async () => {
    setLoading(true)
    try {
      const res = await axios.get('https://apiprawira.my.id/api/kategori')
      const dataFinal = Array.isArray(res.data) ? res.data : res.data.data || []
      setKategoriList(dataFinal)
    } catch (err) {
      console.error(err)
      setKategoriList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKategori()
  }, [])

  // 2. DELETE LOGIC
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token')
    const result = await Swal.fire({
      title: 'Yakin mau dihapus?',
      text: 'Data kategori akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://apiprawira.my.id/api/kategori/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Optimistic Update
        setKategoriList((prev) => {
          const newData = prev.filter((item) => item.id !== id)
          const totalPagesAfterDelete = Math.ceil(
            newData.length / ITEMS_PER_PAGE
          )
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
        Swal.fire('Terhapus!', 'Kategori berhasil dihapus.', 'success')
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          Swal.fire('Gagal!', err.response.data.message, 'error')
        } else {
          Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error')
        }
      }
    }
  }

  // 3. FILTER & PAGINATION LOGIC
  const filteredKategori = useMemo(() => {
    return kategoriList.filter((item) => {
      const keyword = searchTerm.toLowerCase()
      const nama = item.nama_kategori ? item.nama_kategori.toLowerCase() : ''
      return nama.includes(keyword)
    })
  }, [kategoriList, searchTerm])

  const totalItems = filteredKategori.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)

  // Potong data untuk dikirim ke Table
  const paginatedKategori = filteredKategori.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1)
  }

  const handleSearchChange = (val) => {
    setSearchTerm(val)
    setCurrentPage(1) // Reset ke page 1 pas search
  }

  return (
    <div className="p-4">
      {/* Header Modular (Ada Search & Tombol) */}
      <KategoriHeader
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onAdd={() => navigate('/admin/DataKategori/FormTambahKategori')}
      />

      {/* Table Modular */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <KategoriTable
          loading={loading}
          data={paginatedKategori}
          startIndex={startIndex}
          onEdit={(id) => navigate(`/admin/DataKategori/Edit/${id}`)}
          onDelete={handleDelete}
        />

        {/* Pagination Controls Modular */}
        {!loading && filteredKategori.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startIndex={startIndex}
              endIndex={endIndex}
              handlePrevPage={handlePrevPage}
              handleNextPage={handleNextPage}
              originalTotalItems={kategoriList.length}
              isFiltered={!!searchTerm}
              dataType="kategori"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default DataKategori
