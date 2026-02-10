// 📂 src/hooks/useLogin.js
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'

// Helper internal
const isValidEmail = (email) => /^[\w.+-]+@gmail\.com$/.test(email)

const getUserFromLocalStorage = () => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser || storedUser === 'undefined') return null
  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

export const useLogin = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 1. Load Remembered Email
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  // 2. Cek Login (Redirect kalau sudah login)
  useEffect(() => {
    const user = getUserFromLocalStorage()
    if (user) {
      const redirectPath =
        { admin: '/admin', murid: '/murid' }[user.role] || '/'

      Swal.fire({
        icon: 'info',
        title: 'Kamu sudah login!',
        text: 'Silakan logout terlebih dahulu jika ingin login sebagai akun lain.',
        confirmButtonText: 'OK',
      }).then(() => navigate(redirectPath))
    }
  }, [navigate])

  // 3. Handle Submit
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) return setError('Email dan password wajib diisi.')
    if (!isValidEmail(email))
      return setError('Email harus menggunakan @gmail.com.')

    try {
      setLoading(true)
      const res = await axios.post('https://apiprawira.my.id/api/auth/login', {
        email,
        password,
      })

      // Simpan User & Token
      localStorage.setItem('user', JSON.stringify(res.data.user))
      localStorage.setItem('token', res.data.token)

      // Handle Remember Me
      if (rememberMe) localStorage.setItem('rememberedEmail', email)
      else localStorage.removeItem('rememberedEmail')

      // Alert Sukses
      Swal.fire({
        icon: 'success',
        title: `Selamat datang, ${res.data.user.namaLengkap}!`,
        text: 'Login berhasil.',
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        position: 'top-end',
      })

      // Logic Redirect yang Kompleks
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
      localStorage.removeItem('redirectAfterLogin')
      const role = res.data.user?.role

      if (role === 'admin') {
        navigate('/admin')
      } else if (role === 'murid') {
        if (redirectAfterLogin && !redirectAfterLogin.startsWith('/admin')) {
          navigate(
            redirectAfterLogin.startsWith('/murid')
              ? redirectAfterLogin
              : `/murid${redirectAfterLogin}`
          )
        } else {
          navigate('/murid')
        }
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat login.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    error,
    loading,
    handleLogin,
  }
}
