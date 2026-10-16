'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, User, Mail, Lock, Phone, GraduationCap, School } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [gradeLevel, setGradeLevel] = useState('SMA Kelas 12')
  const [schoolName, setSchoolName] = useState('')
  
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) return alert('Password minimal 6 karakter!')

    setSubmitting(true)

    // 1. Buat akun di Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student', // Default role otomatis sebagai siswa
        },
      },
    })

    if (authError) {
      alert('Gagal mendaftar: ' + authError.message)
      setSubmitting(false)
      return
    }

    // 2. Simpan data profil lengkap ke tabel public.profiles
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: fullName,
        role: 'student',
        grade_level: gradeLevel,
        phone_number: phone,
        school_name: schoolName,
      })

      if (profileError) {
        console.error('Gagal memperbarui profil:', profileError.message)
      }
    }

    // 3. Otomatis alihkan ke Dashboard Siswa
    router.push('/student/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-xs">
              Q
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">TheoQED</span>
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight pt-2">Buat Akun Siswa Baru</h1>
          <p className="text-xs text-slate-500 font-medium">Daftar sekarang dan langsung akses portal pembelajaran.</p>
        </div>

        <form onSubmit={handleSignUp} className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Dave Marcellino"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Password (min. 6 karakter)
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Nomor WhatsApp
            </label>
            <input
              type="tel"
              required
              placeholder="081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Jenjang
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-slate-50/50"
              >
                <option value="SMP">SMP</option>
                <option value="SMA Kelas 10">SMA Kelas 10</option>
                <option value="SMA Kelas 11">SMA Kelas 11</option>
                <option value="SMA Kelas 12">SMA Kelas 12</option>
                <option value="Alumni / UTBK">Alumni / UTBK</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" /> Sekolah
              </label>
              <input
                type="text"
                placeholder="SMA N 1 ..."
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <span>{submitting ? 'Memproses Akun...' : 'Daftar & Masuk Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Sudah punya akun? </span>
            <Link href="/login" className="text-xs font-bold text-blue-600 hover:underline">
              Login Portal
            </Link>
          </div>

        </form>

      </div>
    </div>
  )
}