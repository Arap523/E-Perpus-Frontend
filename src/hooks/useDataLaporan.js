import { useState, useEffect } from 'react'
import axios from 'axios'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const useDataLaporan = () => {
  const [laporan, setLaporan] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modal Detail State
  const [selectedItem, setSelectedItem] = useState(null)

  // 1. Ambil Data dari API
  const fetchLaporan = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get('https://apiprawira.my.id/api/laporan', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data && res.data.data) {
        setLaporan(res.data.data)
        setFilteredData(res.data.data)
      }
    } catch (error) {
      console.error('Gagal ambil data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLaporan()
  }, [])

  // 2. Logic Filter (Otomatis jalan saat filter berubah)
  useEffect(() => {
    let result = laporan

    if (startDate && endDate) {
      result = result.filter((item) => {
        const tgl = new Date(item.tanggal_pinjam).toISOString().split('T')[0]
        return tgl >= startDate && tgl <= endDate
      })
    }

    if (statusFilter) {
      result = result.filter((item) => item.status_pinjam === statusFilter)
    }

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.nama_murid?.toLowerCase().includes(lower) ||
          item.judul?.toLowerCase().includes(lower) ||
          item.kode_booking?.toLowerCase().includes(lower)
      )
    }

    setFilteredData(result)
    setCurrentPage(1) // Reset ke halaman 1 saat filter berubah
  }, [startDate, endDate, statusFilter, search, laporan])

  // 3. Logic Pagination
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1))
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages))

  // 4. Badge Warna Status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'selesai':
        return 'bg-green-100 text-green-800'
      case 'dipinjam':
        return 'bg-blue-100 text-blue-800'
      case 'booking':
        return 'bg-yellow-100 text-yellow-800'
      case 'batal':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper untuk mendapatkan tanggal format file (DD-MM-YYYY)
  const getFileTimestamp = () => {
    const d = new Date()
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`
  }

  // 5. Export PDF (jsPDF)
  const handlePrintPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('Laporan Peminjaman Perpustakaan', 14, 22)
      doc.setFontSize(11)
      doc.text(
        `Dicetak Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
        14,
        30
      )

      const tableColumn = [
        'No',
        'Kode',
        'Peminjam',
        'Buku',
        'Tgl Pinjam',
        'Status',
        'Denda',
      ]
      const tableRows = filteredData.map((item, index) => [
        index + 1,
        item.kode_booking,
        item.nama_murid,
        item.judul,
        new Date(item.tanggal_pinjam).toLocaleDateString('id-ID'),
        item.status_pinjam.toUpperCase(),
        item.denda
          ? `Rp ${Number(item.denda).toLocaleString('id-ID')}`
          : 'Rp 0',
      ])

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      })

      doc.save(`Laporan_Peminjaman_${getFileTimestamp()}.pdf`)
    } catch (err) {
      alert('Gagal cetak PDF')
    }
  }

  // 6. Export CSV (Ramah Excel Indonesia dengan Pemisah Titik Koma)
  const handleExportCSV = () => {
    try {
      const headers = [
        'No',
        'Kode Booking',
        'Peminjam',
        'Buku',
        'Tanggal Pinjam',
        'Status',
        'Denda',
      ]

      const rows = filteredData.map((item, index) => [
        index + 1,
        item.kode_booking,
        item.nama_murid,
        `"${item.judul.replace(/"/g, '""')}"`, // Handle judul yang mengandung tanda kutip
        new Date(item.tanggal_pinjam).toLocaleDateString('id-ID'),
        item.status_pinjam.toUpperCase(),
        item.denda || 0, // Angka mentah agar bisa dihitung di Excel
      ])

      // Menggunakan semicolon (;) agar otomatis pecah kolom di Excel Indonesia
      const csvContent = [
        headers.join(';'),
        ...rows.map((row) => row.join(';')),
      ].join('\n')

      // Gunakan BOM (\ufeff) agar Excel mengenali encoding UTF-8
      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `Laporan_Peminjaman_${getFileTimestamp()}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url) // Bersihkan memori
    } catch (err) {
      alert('Gagal export CSV')
    }
  }

  return {
    laporan,
    filteredData,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    selectedItem,
    setSelectedItem,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    handlePrevPage,
    handleNextPage,
    getStatusBadge,
    handlePrintPDF,
    handleExportCSV,
  }
}

export default useDataLaporan
