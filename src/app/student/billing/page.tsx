'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CreditCard,
  Crown,
  BookOpen,
  Receipt,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react'

interface PremiumSub {
  id: string
  plan_months: number
  amount: number
  status: string
  created_at: string
}

interface CoursePurchase {
  id: string
  amount: number
  status: string
  created_at: string
  courses: {
    title: string
  }
}

interface LesBill {
  id: string
  title: string
  amount: number
  due_date: string
  status: string
  payment_proof_url: string | null
}

export default function StudentBillingPage() {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'premium' | 'courses' | 'les'>('premium')
  const [isPremium, setIsPremium] = useState(false)
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null)

  const [premiumSubs, setPremiumSubs] = useState<PremiumSub[]>([])
  const [coursePurchases, setCoursePurchases] = useState<CoursePurchase[]>([])
  const [lesBills, setLesBills] = useState<LesBill[]>([])
  const [loading, setLoading] = useState(true)

  // Modal Konfirmasi Bayar Premium
  const [showSubModal, setShowSubModal] = useState(false)
  const [selectedPlanMonths, setSelectedPlanMonths] = useState(1)
  const [subProofUrl, setSubProofUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Modal Upload Bukti Tagihan Les
  const [selectedBill, setSelectedBill] = useState<LesBill | null>(null)
  const [billProofUrl, setBillProofUrl] = useState('')

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 1. Profil & Status Premium
      const { data: profData } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user.id)
        .single()

      if (profData) {
        setIsPremium(!!profData.is_premium)
        setPremiumExpiresAt(profData.premium_expires_at)
      }

      // 2. Langganan Premium
      const { data: subData } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (subData) setPremiumSubs(subData)

      // 3. Pembelian Course Satuan
      const { data: courseData } = await supabase
        .from('course_purchases')
        .select('*, courses(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (courseData) setCoursePurchases(courseData as any)

      // 4. Tagihan Les Private
      const { data: billData } = await supabase
        .from('les_bills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (billData) setLesBills(billData)
    }

    setLoading(false)
  }

  const handleRequestPremium = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    const price = selectedPlanMonths === 1 ? 99000 : selectedPlanMonths === 6 ? 499000 : 899000

    const { error } = await supabase.from('premium_subscriptions').insert({
      user_id: user?.id,
      plan_months: selectedPlanMonths,
      amount: price,
      payment_proof_url: subProofUrl || null,
      status: 'pending',
    })

    if (!error) {
      alert('Pengajuan langganan dikirim! Menunggu konfirmasi verifikasi dari tutor.')
      setShowSubModal(false)
      setSubProofUrl('')
      fetchBillingData()
    } else {
      alert('Gagal mengirim bukti pembayaran.')
    }
    setSubmitting(false)
  }

  const handlePayLesBill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBill) return

    setSubmitting(true)
    const { error } = await supabase
      .from('les_bills')
      .update({
        payment_proof_url: billProofUrl || null,
        status: 'pending',
      })
      .eq('id', selectedBill.id)

    if (!error) {
      alert('Bukti pembayaran tagihan les berhasil dikirim!')
      setSelectedBill(null)
      setBillProofUrl('')
      fetchBillingData()
    } else {
      alert('Gagal memperbarui tagihan.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat data billing...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Pusat Keuangan & Billing Siswa
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Layanan Pembayaran</h1>
          <p className="text-xs text-slate-500 font-medium">
            Kelola langganan akun premium berjangka, riwayat pembelian course permanen, serta tagihan les private.
          </p>
        </div>

        <button
          onClick={() => setShowSubModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Crown className="w-4 h-4" /> Beli / Perpanjang Premium
        </button>
      </div>

      {/* Tabs Filter Navigasi */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab('premium')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'premium' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" /> Langganan Premium
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'courses' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Course Satuan (Permanen)
        </button>
        <button
          onClick={() => setActiveTab('les')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'les' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" /> Tagihan Les Private
        </button>
      </div>

      {/* TAB 1: STATUS & RIWAYAT LANGGANAN PREMIUM */}
      {activeTab === 'premium' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Status Akun Berlangganan</span>
              <h3 className="text-lg font-black">{isPremium ? 'Akun Premium Aktif' : 'Akun Non-Premium (Gratis)'}</h3>
              {isPremium && premiumExpiresAt && (
                <p className="text-xs text-slate-300">
                  Masa berlaku hingga: <strong className="text-white">{new Date(premiumExpiresAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}</strong>
                </p>
              )}
            </div>

            <button
              onClick={() => setShowSubModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all shadow-md shrink-0 cursor-pointer"
            >
              {isPremium ? 'Perpanjang Masa Aktif' : 'Aktifkan Premium Sekarang'}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-50/80 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Riwayat Pengajuan Premium</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {premiumSubs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">Belum ada transaksi langganan premium.</div>
              ) : (
                premiumSubs.map((sub) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900">Paket Premium {sub.plan_months} Bulan</h4>
                      <span className="text-[10px] text-slate-400 block">
                        Tgl: {new Date(sub.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-900">Rp {sub.amount.toLocaleString('id-ID')}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        sub.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {sub.status === 'confirmed' ? 'Dikonfirmasi' : 'Menunggu Verifikasi'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COURSE SATUAN (AKSES PERMANEN) */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 bg-slate-50/80 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Riwayat Pembelian Course Permanen</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {coursePurchases.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">Belum ada pembelian course secara satuan.</div>
            ) : (
              coursePurchases.map((cp) => (
                <div key={cp.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900">{cp.courses?.title || 'Course Digital'}</h4>
                    <span className="text-[10px] text-emerald-600 font-bold block">✓ Akses Selamanya (Permanen)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-900">Rp {cp.amount.toLocaleString('id-ID')}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      cp.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {cp.status === 'confirmed' ? 'Aktif Permanen' : 'Proses Verifikasi'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TAGIHAN LES PRIVATE */}
      {activeTab === 'les' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-50/80 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Daftar Tagihan Les Private (SPP Bulanan)</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {lesBills.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">Tidak ada tagihan les private aktif.</div>
              ) : (
                lesBills.map((bill) => (
                  <div key={bill.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900">{bill.title}</h4>
                      <span className="text-[10px] text-rose-600 font-bold block">
                        Jatuh Tempo: {new Date(bill.due_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-slate-900">Rp {bill.amount.toLocaleString('id-ID')}</span>
                      {bill.status === 'paid' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                        </span>
                      ) : bill.status === 'pending' ? (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-black">
                          Menunggu Konfirmasi
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                        >
                          Konfirmasi Pembayaran
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Beli / Perpanjang Langganan Premium */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Beli / Perpanjang Paket Premium</h3>
            
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <strong className="block">Rekening Transfer Tutor:</strong>
              <p>Bank BCA: <strong>8000-1234-5678</strong> a.n Dave Marcellino</p>
              <p>Mandiri: <strong>10800-9876-5432</strong> a.n Dave Marcellino</p>
            </div>

            <form onSubmit={handleRequestPremium} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Durasi Langganan</label>
                <select
                  value={selectedPlanMonths}
                  onChange={(e) => setSelectedPlanMonths(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                >
                  <option value={1}>1 Bulan - Rp 99.000</option>
                  <option value={6}>6 Bulan - Rp 499.000 (Hemat 16%)</option>
                  <option value={12}>12 Bulan - Rp 899.000 (Hemat 25%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link Bukti Transfer / Google Drive</label>
                <input
                  type="text"
                  required
                  placeholder="https://drive.google.com/..."
                  value={subProofUrl}
                  onChange={(e) => setSubProofUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Upload Bukti SPP Les */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Bayar Tagihan: {selectedBill.title}</h3>
            <p className="text-xs text-slate-500">Total Nominal: <strong>Rp {selectedBill.amount.toLocaleString('id-ID')}</strong></p>

            <form onSubmit={handlePayLesBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link Bukti Transfer</label>
                <input
                  type="text"
                  required
                  placeholder="https://drive.google.com/..."
                  value={billProofUrl}
                  onChange={(e) => setBillProofUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Konfirmasi Ke Tutor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}