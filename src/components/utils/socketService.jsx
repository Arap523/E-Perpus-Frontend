import { io } from 'socket.io-client'

const SOCKET_URL = 'https://apiprawira.my.id'
let socket = null

export const connectSocket = (userId) => {
  // 1. Cek apakah socket sudah ada dan sedang mencoba konek/sudah konek
  if (socket) {
    if (socket.connected) return socket
    return socket
  }

  // 2. Inisialisasi - Kita balikkan ke websocket aja kalau polling bikin error
  // Tapi kita tambahkan pengatur agar tidak agresif
  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'], // Balik ke awal kalau polling error
    reconnectionAttempts: 5,
    reconnectionDelay: 5000, // Kasih jeda 5 detik biar gak spam log merah
    timeout: 20000,
  })

  socket.on('connect', () => {
    console.log('%c✅ Socket Connected', 'color: #00ff00; font-weight: bold;')
    if (userId) {
      socket.emit('join', userId)
    }
  })

  // 3. Biar console gak merah-merah banget, kita tangkap errornya
  socket.on('connect_error', (err) => {
    // Log minimalis saja biar gak menakutkan
    console.warn('⚠️ Socket link pending (Backend mungkin sedang restart)')
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export const subscribeToNotifications = (eventName, callback) => {
  if (!socket) return () => {}

  socket.off(eventName)

  const handleEvent = (data) => callback(data)

  // Pasang listener
  socket.on(eventName, handleEvent)
  console.log(`📬 Listener active: ${eventName}`)

  // Return cleanup function
  return () => {
    if (socket) {
      socket.off(eventName, handleEvent)
      console.log(`🧹 Listener removed: ${eventName}`)
    }
  }
}

export const getSocket = () => socket
