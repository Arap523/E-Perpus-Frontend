// 📂 src/hooks/useRiwayatPeminjaman.js
import { useState, useEffect, useMemo, useCallback } from 'react'
import { io } from 'socket.io-client'

export const useRiwayatPeminjaman = (itemsPerPage = 10) => {
  const [riwayat, setRiwayat] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 🔹 FETCH DATA
  const fetchRiwayat = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('https://apiprawira.my.id/api/peminjaman/riwayat', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Gagal mengambil data')
      const json = await res.json()
      setRiwayat(json.data || [])
    } catch (error) {
      console.error('Error fetch riwayat:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 🔹 SOCKET & EFFECT
  useEffect(() => {
    setLoading(true)
    fetchRiwayat()

    const token = localStorage.getItem('token')
    if (!token) return

    const socket = io('https://apiprawira.my.id', {
      auth: { token },
      reconnection: true,
    })

    socket.on('new_notification', () => {
      fetchRiwayat()
    })

    return () => {
      socket.disconnect()
    }
  }, [fetchRiwayat])

  // 🔹 FILTER & PAGINATION LOGIC
  const filteredData = useMemo(() => {
    if (!search) return riwayat
    const lowerSearch = search.toLowerCase()
    return riwayat.filter((item) => {
      const text = `
        ${item.judul ?? item.judul_buku ?? ''} 
        ${item.kode_booking ?? ''}
        ${item.status_pinjam ?? ''}
      `.toLowerCase()
      return text.includes(lowerSearch)
    })
  }, [search, riwayat])

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return {
    riwayat, // Data mentah (opsional jika butuh)
    loading,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    paginatedData, // Data yang sudah dipotong per halaman
    totalItems,
    totalPages,
    startIndex,
    itemsPerPage,
  }
}
