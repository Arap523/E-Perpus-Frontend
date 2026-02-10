import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://apiprawira.my.id',
})

// ⏩ Request interceptor ➜ pasang token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ⏩ Response interceptor ➜ tangkap 401 ➜ auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login' // atau "/" sesuai routing lo
    }
    return Promise.reject(error)
  }
)

export default api
