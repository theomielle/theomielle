'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('Email atau password salah. Silakan periksa kembali.')
      setLoading(false)
      return
    }

    if (data.user) {
      // Cek role pengguna di tabel profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'tutor') {
        router.push('/tutor/dashboard')
      } else {
        router.push('/student/dashboard')
      }
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans flex items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-xs group-hover:scale-105 transition-transform">
              Q
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">TheoQED</span>
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight pt-2">Selamat Datang Kembali</h1>
          <p className="text-xs text-slate-500 font-medium">Masukkan kredensial Anda untuk masuk ke portal belajar.</p>
        </div>

        {/* Card Form Login */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3.5 rounded-2xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
                </label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Masuk...' : 'Masuk Portal'}</span>
            </button>

          </form>

          {/* Opsi Buat Akun Baru */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              Belum memiliki akun TheoQED?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-2xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-all"
            >
              <span>Buat Akun Siswa Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            ← Kembali ke Landing Page
          </Link>
        </div>

      </div>
    </div>
  )
}