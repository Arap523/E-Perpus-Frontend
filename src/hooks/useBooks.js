import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

export const useBooks = () => {
  const [books, setBooks] = useState([])
  const [kategoriList, setKategoriList] = useState([])
  const [loading, setLoading] = useState(true)

  // 1. Logic Fetch Data
  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true)
        // Delay kosmetik
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      const [bukuRes, kategoriRes] = await Promise.all([
        axios.get('https://apiprawira.my.id/api/buku'),
        axios.get('https://apiprawira.my.id/api/kategori'),
      ])

      const finalBuku = Array.isArray(bukuRes.data)
        ? bukuRes.data
        : bukuRes.data.data || []

      const finalKategori = Array.isArray(kategoriRes.data)
        ? kategoriRes.data
        : kategoriRes.data.data || []

      setBooks(finalBuku)
      setKategoriList(finalKategori)
    } catch (err) {
      console.error('Gagal fetch data:', err)
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }, [])

  // 2. Setup Socket IO & Initial Load
  useEffect(() => {
    fetchData()

    const socket = io('https://apiprawira.my.id')

    socket.on('change_data', (data) => {
      console.log('Realtime update:', data)
      fetchData(true)
    })

    return () => {
      socket.disconnect()
    }
  }, [fetchData])

  // Return data dan fungsi yang dibutuhkan component
  return {
    books,
    kategoriList,
    loading,
    refreshData: fetchData,
  }
}
