'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet, CheckCircle2, ExternalLink, Plus, Receipt, Crown } from 'lucide-react'

interface PremiumSub {
  id: string
  user_id: string
  plan_months: number
  amount: number
  payment_proof_url: string | null
  status: string
  created_at: string
  profiles?: {
    full_name: string | null
    email: string | null
  }
}

interface LesBill {
  id: string
  student_email: string
  title: string
  amount: number
  due_date: string
  payment_proof_url: string | null
  status: string
}

export default function TutorBillingStudioPage() {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'premium' | 'les'>('premium')
  const [premiumSubs, setPremiumSubs] = useState<PremiumSub[]>([])
  const [lesBills, setLesBills] = useState<LesBill[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Terbitkan Tagihan
  const [showBillModal, setShowBillModal] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [billTitle, setBillTitle] = useState('')
  const [billAmount, setBillAmount] = useState<number>(500000)
  const [billDueDate, setBillDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTutorBillingData()
  }, [])

  const fetchTutorBillingData = async () => {
    setLoading(true)

    // 1. Ambil Pengajuan Premium beserta data Profil Siswa
    const { data: subData, error: subError } = await supabase
      .from('premium_subscriptions')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (subError) {
      console.error('Gagal mengambil data pengajuan premium:', subError)
    }

    if (subData) setPremiumSubs(subData as any)

    // 2. Ambil Tagihan Les
    const { data: billData } = await supabase
      .from('les_bills')
      .select('*')
      .order('created_at', { ascending: false })

    if (billData) setLesBills(billData)

    setLoading(false)
  }

  // Verifikasi Pengajuan Premium
  const handleConfirmPremium = async (sub: PremiumSub) => {
    if (!confirm('Konfirmasi pembayaran dan aktifkan akun premium siswa ini?')) return

    const now = new Date()
    const expiresAt = new Date(now.setMonth(now.getMonth() + sub.plan_months)).toISOString()

    // 1. Update profil siswa
    await supabase.from('profiles').update({
      is_premium: true,
      subscription_expires_at: expiresAt,
    }).eq('id', sub.user_id)

    // 2. Update status pengajuan
    await supabase.from('premium_subscriptions').update({ status: 'confirmed' }).eq('id', sub.id)

    alert('Akun premium siswa berhasil diaktifkan!')
    fetchTutorBillingData()
  }

  // Terbitkan Tagihan Les Baru
  const handleCreateLesBill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentEmail || !billTitle) return

    setSubmitting(true)
    const { data: profData } = await supabase.from('profiles').select('id').eq('email', studentEmail.trim()).single()

    const { error } = await supabase.from('les_bills').insert({
      user_id: profData?.id || null,
      student_email: studentEmail.trim(),
      title: billTitle.trim(),
      amount: billAmount,
      due_date: billDueDate,
      status: 'unpaid',
    })

    if (!error) {
      alert('Tagihan les private berhasil diterbitkan!')
      setShowBillModal(false)
      setStudentEmail('')
      setBillTitle('')
      fetchTutorBillingData()
    } else {
      alert('Gagal menerbitkan tagihan.')
    }
    setSubmitting(false)
  }

  const handleConfirmLesBill = async (billId: string) => {
    if (!confirm('Tandai tagihan les ini sebagai LUNAS?')) return
    await supabase.from('les_bills').update({ status: 'paid' }).eq('id', billId)
    fetchTutorBillingData()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5 text-indigo-600" /> Studio Manajemen Keuangan Tutor
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verifikasi Pembayaran & SPP Les</h1>
          <p className="text-xs text-slate-500 font-medium">
            Verifikasi bukti transfer langganan premium siswa dan kelola tagihan les private bulanan.
          </p>
        </div>

        <button
          onClick={() => setShowBillModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Terbitkan Tagihan Les
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab('premium')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
            activeTab === 'premium' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400 inline mr-1" /> Permohonan Premium Siswa
        </button>
        <button
          onClick={() => setActiveTab('les')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
            activeTab === 'les' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4 inline mr-1" /> Tagihan Les Private
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat data transaksi...</div>
      ) : activeTab === 'premium' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 bg-slate-50/80 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Daftar Pengajuan Premium Siswa</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {premiumSubs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">Belum ada pengajuan permohonan premium.</div>
            ) : (
              premiumSubs.map((sub) => (
                <div key={sub.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900">
                      {sub.profiles?.full_name || sub.profiles?.email || 'Siswa TheoQED'}
                    </h4>
                    {sub.profiles?.email && (
                      <span className="text-[10px] text-slate-500 font-bold block">{sub.profiles.email}</span>
                    )}
                    <span className="text-[10px] text-indigo-600 font-black block">
                      Paket {sub.plan_months} Bulan (Rp {sub.amount?.toLocaleString('id-ID')})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.payment_proof_url && (
                      <a
                        href={sub.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Bukti Transfer
                      </a>
                    )}

                    {sub.status === 'confirmed' ? (
                      <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black">
                        ✓ Aktif Premium
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmPremium(sub)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                      >
                        Verifikasi Akses
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 bg-slate-50/80 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Daftar Tagihan SPP Les Private</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {lesBills.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">Belum ada tagihan les yang diterbitkan.</div>
            ) : (
              lesBills.map((bill) => (
                <div key={bill.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900">{bill.title}</h4>
                    <span className="text-[10px] text-slate-500 font-bold block">Siswa: {bill.student_email}</span>
                    <span className="text-[10px] text-rose-600 font-bold block">
                      Tenggat: {new Date(bill.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-900">Rp {bill.amount.toLocaleString('id-ID')}</span>
                    {bill.status === 'paid' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black">
                        Lunas
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmLesBill(bill.id)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                      >
                        Tandai Lunas
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Terbitkan Tagihan Les */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Terbitkan Tagihan Les Private</h3>
            <form onSubmit={handleCreateLesBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Siswa Les</label>
                <input
                  type="email"
                  required
                  placeholder="siswa@gmail.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Tagihan</label>
                <input
                  type="text"
                  required
                  placeholder="SPP Les Private - November 2026"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Menerbitkan...' : 'Terbitkan Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}