'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Mail,
  Phone,
  School,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  Save,
  Key,
  Calendar,
  Zap
} from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  phone_number: string | null
  institution: string | null
  avatar_url: string | null
  is_premium: boolean
  subscription_expires_at: string | null
}

export default function StudentProfilePage() {
  const supabase = createClient()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [institution, setInstitution] = useState('')

  // Change Password State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setPhoneNumber(data.phone_number || '')
        setInstitution(data.institution || '')
      } else {
        // Jika profil belum ada, buat entri awal
        const newProf = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Siswa TheoQED',
          email: user.email || '',
          is_premium: false,
        }
        await supabase.from('profiles').insert(newProf)
        setProfile(newProf as any)
        setFullName(newProf.full_name)
      }
    }

    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone_number: phoneNumber,
        institution: institution,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (!error) {
      alert('Profil berhasil diperbarui!')
      setProfile({ ...profile, full_name: fullName, phone_number: phoneNumber, institution })
    } else {
      alert('Gagal memperbarui profil.')
    }
    setSaving(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi tidak cocok!')
      return
    }
    if (newPassword.length < 6) {
      alert('Kata sandi minimal 6 karakter.')
      return
    }

    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (!error) {
      alert('Kata sandi berhasil diperbarui!')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      alert('Gagal memperbarui kata sandi: ' + error.message)
    }
    setPasswordSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-400">
        Memuat data profil...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 antialiased">
      {/* Header Banner & Status Langganan */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
            {fullName.charAt(0).toUpperCase() || 'S'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{fullName || 'Siswa TheoQED'}</h1>
              {profile?.is_premium ? (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-xs">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                  Paket Gratis
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile?.email}
            </p>
          </div>
        </div>

        {!profile?.is_premium && (
          <button
            onClick={() => alert('Instruksi upgrade: Hubungi admin TheoQED untuk mengaktifkan akses premium.')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shrink-0"
          >
            <Zap className="w-4 h-4" /> Upgrade ke Premium
          </button>
        )}
      </div>

      {/* Grid Layout: Status Langganan & Form Edit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kartu Informasi Keanggotaan & Hak Akses */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" /> Status Akses & Fitur
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Tipe Akun</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex justify-between items-center text-xs font-extrabold">
                <span className="text-slate-700">Paket Saat Ini:</span>
                <span className={profile?.is_premium ? 'text-amber-600 font-black' : 'text-slate-600'}>
                  {profile?.is_premium ? 'TheoQED Member Premium' : 'Free Plan'}
                </span>
              </div>

              {profile?.subscription_expires_at && (
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/60">
                  <span>Masa Aktif Hingga:</span>
                  <span className="font-bold flex items-center gap-1 text-slate-700">
                    <Calendar className="w-3 h-3 text-indigo-600" />
                    {new Date(profile.subscription_expires_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>
              )}
            </div>

            {/* List Fitur Hak Akses */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Cakupan Akses Kamu:</span>

              {[
                { title: 'Akses Katalog Course Umum', active: true },
                { title: 'Perpustakaan & TheoNotes Gratis', active: true },
                { title: 'Kunci Jawaban Buku Teks Premium', active: !!profile?.is_premium },
                { title: 'Bank Soal HOTS & Pembahasan Lengkap', active: !!profile?.is_premium },
                { title: 'Akses Kelas LMS Eksklusif', active: !!profile?.is_premium },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-bold">
                  <span className={item.active ? 'text-slate-800' : 'text-slate-400'}>{item.title}</span>
                  {item.active ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Edit Informasi Diri & Keamanan */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section Edit Profil */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" /> Informasi Pribadi
              </h3>
              <p className="text-xs text-slate-500">Perbarui informasi identitas dan institusi kamu.</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sekolah / Perguruan Tinggi</label>
                  <input
                    type="text"
                    placeholder="Misal: SMAN 1 Medan / ITB"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </div>

          {/* Section Ubah Password */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" /> Keamanan & Kata Sandi
              </h3>
              <p className="text-xs text-slate-500">Perbarui kata sandi akun untuk menjaga keamanan data.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> {passwordSaving ? 'Memproses...' : 'Ubah Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}