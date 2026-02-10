// 📂 src/hooks/useProfile.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../components/utils/api' // Sesuaikan path api lu
import Swal from 'sweetalert2'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://apiprawira.my.id'

export const useProfile = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // --- STATE ---
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [passForm, setPassForm] = useState({})
  const [updateLoading, setUpdateLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Cek Role
  const isMurid = user?.users?.role_id !== 3 // Asumsi 3 = Admin

  // --- 1. FETCH DATA ---
  const fetchProfileData = useCallback(async () => {
    try {
      const res = await api.get('/api/profile')
      const profileData = res.data.data
      setUser(profileData)

      setProfileForm({
        namaLengkap: profileData.namaLengkap || '',
        email: profileData.email || '',
        telepon: profileData.telepon || '',
        alamat: profileData.alamat || '',
      })

      setPreviewUrl(
        profileData.profile_picture
          ? `${BASE_URL}/${profileData.profile_picture}`
          : null
      )
    } catch (err) {
      console.error(err)
      Swal.fire('Error', 'Gagal memuat data profile.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  // --- 2. HANDLER BACK ---
  const handleBack = () => {
    if (isMurid) navigate('/murid')
    else navigate('/admin/dashboard')
  }

  // --- 3. HANDLER FILE ---
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Gagal', 'Ukuran file maksimal 5MB.', 'error')
      e.target.value = null
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // --- 4. HANDLER UPDATE PROFILE ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)

    const formData = new FormData()
    Object.keys(profileForm).forEach((key) => {
      if (profileForm[key] !== null) formData.append(key, profileForm[key])
    })
    if (selectedFile) formData.append('profile_picture', selectedFile)

    try {
      await api.put('/api/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      Swal.fire('Berhasil', 'Profil berhasil diperbarui!', 'success')
      setIsEditing(false)
      setSelectedFile(null)
      fetchProfileData()
    } catch (error) {
      Swal.fire(
        'Gagal',
        error.response?.data?.message || 'Gagal update.',
        'error'
      )
    } finally {
      setUpdateLoading(false)
    }
  }

  // --- 5. HANDLER PASSWORD ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    if (passForm.newPassword !== passForm.confirmPassword) {
      Swal.fire('Gagal', 'Password baru tidak cocok.', 'warning')
      setUpdateLoading(false)
      return
    }
    try {
      const endpointRole = isMurid ? 'murid' : 'admin'
      await api.put(`/api/${endpointRole}/change-password/${user.id}`, {
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword,
      })
      Swal.fire('Berhasil', 'Password berhasil diubah!', 'success')
      setPassForm({})
    } catch (error) {
      Swal.fire(
        'Gagal',
        error.response?.data?.message || 'Gagal ubah password.',
        'error'
      )
    } finally {
      setUpdateLoading(false)
    }
  }

  return {
    user,
    loading,
    isMurid,
    fileInputRef,
    // Form States
    profileForm,
    setProfileForm,
    passForm,
    setPassForm,
    isEditing,
    setIsEditing,
    updateLoading,
    selectedFile,
    previewUrl,
    // Handlers
    handleBack,
    handleFileChange,
    handleProfileUpdate,
    handlePasswordUpdate,
  }
}
