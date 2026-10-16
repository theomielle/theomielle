'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface StudentProfile {
  id: string
  full_name: string
  grade_level: string | null
  phone: string | null
  created_at: string
}

export default function TutorSiswaPage() {
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gradeLevel, setGradeLevel] = useState('10 SMA')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  const fetchStudents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, grade_level, phone, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setStudents(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMsg(null)

    try {
      const res = await fetch('/api/tutor/register-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, gradeLevel, phone }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Gagal mendaftarkan siswa')
      }

      setMsg({ type: 'success', text: 'Siswa berhasil didaftarkan!' })
      setFullName('')
      setEmail('')
      setPassword('')
      setPhone('')
      fetchStudents() // Refresh tabel
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/tutor/dashboard" className="text-sm text-blue-600 hover:underline">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Manajemen Siswa</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Form Pendaftaran Siswa Baru */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tambah Siswa Baru</h2>

            {msg && (
              <div
                className={`mb-4 rounded-md p-3 text-sm border ${
                  msg.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Email Akun</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="budi@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Password Sementara</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Jenjang / Kelas</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="7 SMP">7 SMP</option>
                  <option value="8 SMP">8 SMP</option>
                  <option value="9 SMP">9 SMP</option>
                  <option value="10 SMA">10 SMA</option>
                  <option value="11 SMA">11 SMA</option>
                  <option value="12 SMA">12 SMA / UTBK</option>
                  <option value="Umum">Umum / Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">No. WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="08123456789"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {submitting ? 'Daftarkan...' : '+ Daftarkan Siswa'}
              </button>
            </form>
          </div>

          {/* Tabel Daftar Siswa */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Siswa Terdaftar</h2>

            {loading ? (
              <p className="text-sm text-gray-500">Memuat daftar siswa...</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada siswa yang terdaftar.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Jenjang</th>
                      <th className="px-4 py-3">No. Telp</th>
                      <th className="px-4 py-3">Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{student.full_name}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {student.grade_level || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{student.phone || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(student.created_at).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}