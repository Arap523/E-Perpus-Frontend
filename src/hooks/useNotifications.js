import { useState, useEffect, useCallback, useMemo } from 'react'
import Swal from 'sweetalert2'
import { io } from 'socket.io-client'

const SOCKET_URL = 'https://apiprawira.my.id'

export const useNotifications = (user, token) => {
  const [notifications, setNotifications] = useState([])

  // 1. Tentukan Base URL berdasarkan Role (Admin/Murid)
  const notifApiBase = useMemo(() => {
    if (!user?.role) return null
    // Cek role: bisa 'admin' string atau role_id 3 (sesuaikan dengan logic login lu)
    const isAdmin = user.role === 'admin' || user.role_id === 3

    return isAdmin
      ? 'https://apiprawira.my.id/api/notifikasi/admin'
      : 'https://apiprawira.my.id/api/notifikasi'
  }, [user?.role, user?.role_id])

  const deduplicate = (arr) => {
    return Array.from(
      new Map(arr.map((n) => [n?.id ?? JSON.stringify(n), n])).values()
    )
  }

  const fetchNotifikasi = useCallback(async () => {
    if (!user?.id || !token || !notifApiBase) return
    try {
      const res = await fetch(`${notifApiBase}/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotifications(
          deduplicate(data).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        )
      }
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }, [user?.id, token, notifApiBase])

  // ==========================================
  // 🔥 FIX MARK AS READ (Dinamis Admin/Murid)
  // ==========================================
  const markAsRead = async (id) => {
    if (!token || !notifApiBase) return // Pastikan URL base ada

    try {
      // 👇 PAKE notifApiBase BIAR OTOMATIS KE /admin ATAU /murid
      await fetch(`${notifApiBase}/read/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })

      // Update State Lokal
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
      )
    } catch (err) {
      console.error('Gagal markAsRead:', err)
    }
  }

  // Fungsi Delete (Sudah Bener, tapi gw rapihin dikit pake notifApiBase)
  const deleteNotification = async (id) => {
    if (!token || !notifApiBase) return
    try {
      const res = await fetch(`${notifApiBase}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        console.log(`✅ Notif ${id} terhapus`)
      } else {
        const errorData = await res.json()
        console.error('❌ Server Error:', errorData.message)
      }
    } catch (err) {
      console.error('❌ Network Error saat hapus notif:', err)
    }
  }

  useEffect(() => {
    if (!user?.id) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
    })

    socket.on('connect', () => {
      console.log('🟢 Socket connected')
      socket.emit('join', user.id)
    })

    const eventName =
      user.role === 'admin' || user.role_id === 3
        ? 'new_admin_notification'
        : 'new_notification'

    socket.on(eventName, (newNotif) => {
      let data
      try {
        data =
          typeof newNotif.pesan === 'string'
            ? JSON.parse(newNotif.pesan)
            : newNotif.pesan
      } catch {
        data = { title: 'Notifikasi', body: newNotif.pesan || 'Ada pesan baru' }
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        icon:
          data.type === 'error'
            ? 'error'
            : data.type === 'warning'
              ? 'warning'
              : 'success',
        title: data.title || 'Notifikasi',
        text: data.body,
      })

      setNotifications((prev) =>
        deduplicate([{ ...newNotif, parsed: data }, ...prev])
      )
    })

    return () => {
      socket.off(eventName)
      socket.disconnect()
    }
  }, [user?.id, user?.role, user?.role_id])

  useEffect(() => {
    fetchNotifikasi()
  }, [fetchNotifikasi])

  return {
    notifications,
    unreadCount: notifications.filter((n) => n.status !== 'read').length,
    markAsRead,
    deleteNotification,
    fetchNotifikasi,
  }
}
