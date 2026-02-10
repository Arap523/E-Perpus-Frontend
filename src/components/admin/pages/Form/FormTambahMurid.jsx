import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { registerSchema } from '../../../validations/registerSchema'
import { useState } from 'react'

function FormTambahMurid() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange', // ✅ validasi jalan setiap kali input berubah
    reValidateMode: 'onChange',
  })

  const kelas = watch('kelas')

  const onSubmit = async (data) => {
    const result = await Swal.fire({
      title: 'Simpan data murid?',
      text: 'Pastikan semua data sudah benar.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan',
      cancelButtonText: 'Batal',
    })

    if (!result.isConfirmed) return

    try {
      const token = localStorage.getItem('token')

      await axios.post('https://apiprawira.my.id/api/murid', data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.fire('Berhasil!', 'Data murid berhasil ditambahkan.', 'success')
      navigate('/admin/DataMurid')
      reset()
    } catch (err) {
      Swal.fire('Gagal', 'Terjadi kesalahan saat menambahkan murid.', 'error')
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Tambah Murid</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off" // 🔹 Matikan autocomplete form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Nama Lengkap */}
        <div>
          <input
            {...register('namaLengkap')}
            placeholder="Masukkan Nama Lengkap Murid"
            autoComplete="off"
            className="border px-3 py-2 rounded w-full"
          />
          {errors.namaLengkap && (
            <p className="text-red-500 text-sm">{errors.namaLengkap.message}</p>
          )}
        </div>

        {/* NIS */}
        <div>
          <input
            {...register('nis')}
            placeholder="Masukkan NIS Murid"
            autoComplete="off"
            className="border px-3 py-2 rounded w-full"
            onInput={(e) =>
              (e.target.value = e.target.value.replace(/[^0-9]/g, ''))
            }
          />
          {errors.nis && (
            <p className="text-red-500 text-sm">{errors.nis.message}</p>
          )}
        </div>

        {/* Kelas */}
        <div>
          <select
            {...register('kelas')}
            className="border px-3 py-2 rounded w-full h-[42px]"
          >
            <option value="">Pilih Kelas Murid</option>
            <option value="X">X</option>
            <option value="XI">XI</option>
            <option value="XII">XII</option>
          </select>
          {errors.kelas && (
            <p className="text-red-500 text-sm">{errors.kelas.message}</p>
          )}
        </div>

        {/* Jurusan */}
        {(kelas === 'XI' || kelas === 'XII') && (
          <div>
            <select
              {...register('jurusan')}
              className="border px-3 py-2 rounded w-full h-[42px]"
            >
              <option value="">Pilih Jurusan Murid</option>
              <option value="IPA">IPA</option>
              <option value="IPS">IPS</option>
            </select>
            {errors.jurusan && (
              <p className="text-red-500 text-sm">{errors.jurusan.message}</p>
            )}
          </div>
        )}

        {/* Jenis Kelamin */}
        <div>
          <select
            {...register('jenis_kelamin')}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          {errors.jenis_kelamin && (
            <p className="text-red-500 text-sm">
              {errors.jenis_kelamin.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <input
            {...register('email')}
            placeholder="Masukkan Email Aktif Murid"
            autoComplete="off" // 🔹 Matikan auto isi email
            className="border px-3 py-2 rounded w-full"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            placeholder="Masukkan Password"
            autoComplete="new-password" // 🔹 Biar browser gak auto-isi password
            className="border px-3 py-2 rounded w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('konfirmasiPassword')}
            placeholder="Konfirmasi Password"
            autoComplete="new-password"
            className="border px-3 py-2 rounded w-full"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          >
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
          {errors.konfirmasiPassword && (
            <p className="text-red-500 text-sm">
              {errors.konfirmasiPassword.message}
            </p>
          )}
        </div>

        {/* Nomor Telepon */}
        <div>
          <input
            {...register('telepon')}
            placeholder="Nomor Telepon"
            autoComplete="off"
            className="border px-3 py-2 rounded w-full"
          />
          {errors.telepon && (
            <p className="text-red-500 text-sm">{errors.telepon.message}</p>
          )}
        </div>

        {/* Alamat */}
        <div>
          <textarea
            {...register('alamat')}
            placeholder="Alamat Rumah"
            autoComplete="off"
            className="border px-3 py-2 rounded w-full h-[42px]" // biar tingginya sejajar
          />
          {errors.alamat && (
            <p className="text-red-500 text-sm">{errors.alamat.message}</p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/DataMurid')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormTambahMurid
