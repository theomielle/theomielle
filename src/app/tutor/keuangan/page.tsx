'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Student {
  id: string
  full_name: string
  grade_level: string
}

interface Payment {
  id: string
  student_id: string
  amount: number
  month_year: string
  status: 'pending' | 'paid'
  payment_date: string | null
  notes: string | null
  created_at: string
  student?: {
    full_name: string
    grade_level: string
  }
}

export default function TutorKeuanganPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all')

  // Modal / Editing State
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  // Form State (Tambah / Edit)
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState('300000')
  const [monthYear, setMonthYear] = useState('Oktober 2026')
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  const fetchData = async () => {
    setLoading(true)

    // 1. Fetch data siswa
    const { data: studentData } = await supabase
      .from('profiles')
      .select('id, full_name, grade_level')
      .eq('role', 'student')
      .order('full_name')

    if (studentData) {
      setStudents(studentData)
      if (studentData.length > 0 && !studentId) {
        setStudentId(studentData[0].id)
      }
    }

    // 2. Fetch data tagihan + profil siswa
    const { data: paymentData } = await supabase
      .from('payments')
      .select(`
        id, student_id, amount, month_year, status, payment_date, notes, created_at,
        student:profiles!payments_student_id_fkey(full_name, grade_level)
      `)
      .order('created_at', { ascending: false })

    if (paymentData) {
      setPayments(paymentData as any)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setEditingPayment(null)
    setAmount('300000')
    setMonthYear('Oktober 2026')
    setStatus('pending')
    setNotes('')
  }

  const openEditModal = (p: Payment) => {
    setEditingPayment(p)
    setStudentId(p.student_id)
    setAmount(p.amount.toString())
    setMonthYear(p.month_year)
    setStatus(p.status)
    setNotes(p.notes || '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMsg(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMsg({ type: 'error', text: 'Sesi berakhir, silakan login ulang.' })
      setSubmitting(false)
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setMsg({ type: 'error', text: 'Masukkan nominal pembayaran yang valid.' })
      setSubmitting(false)
      return
    }

    if (editingPayment) {
      // UPDATE
      const { error } = await supabase
        .from('payments')
        .update({
          student_id: studentId,
          amount: numAmount,
          month_year: monthYear,
          month_period: monthYear, // Kirim ke month_period juga
          status,
          payment_date: status === 'paid' ? new Date().toISOString() : null,
          notes: notes || null,
        })
        .eq('id', editingPayment.id)

      if (error) {
        setMsg({ type: 'error', text: error.message })
      } else {
        setMsg({ type: 'success', text: 'Data tagihan berhasil diperbarui!' })
        resetForm()
        fetchData()
      }
    } else {
      // INSERT
      const { error } = await supabase.from('payments').insert({
        tutor_id: user.id,
        student_id: studentId,
        amount: numAmount,
        month_year: monthYear,
        month_period: monthYear, // Kirim ke month_period agar constraint Not-Null terpenuhi
        status,
        payment_date: status === 'paid' ? new Date().toISOString() : null,
        notes: notes || null,
      })

      if (error) {
        setMsg({ type: 'error', text: error.message })
      } else {
        setMsg({ type: 'success', text: 'Tagihan SPP baru berhasil dibuat!' })
        resetForm()
        fetchData()
      }
    }

    setSubmitting(false)
  }

  const toggleStatus = async (p: Payment) => {
    const newStatus = p.status === 'pending' ? 'paid' : 'pending'
    const { error } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        payment_date: newStatus === 'paid' ? new Date().toISOString() : null,
      })
      .eq('id', p.id)

    if (!error) fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan tagihan ini?')) return
    const { error } = await supabase.from('payments').delete().eq('id', id)
    if (!error) fetchData()
  }

  // Hitung Total Statistik Keuangan
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + Number(p.amount), 0)

  const totalPending = payments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + Number(p.amount), 0)

  // Filtered Payments List
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.month_year.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/tutor/dashboard" className="text-sm text-blue-600 hover:underline">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Pencatatan Keuangan & SPP Siswa</h1>
          </div>
        </div>

        {/* Ringkasan Keuangan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Pemasukan Lunas (Total Paid)</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              Rp {totalPaid.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Belum Dilunasi (Outstanding Pending)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              Rp {totalPending.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Transaksi</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {payments.length} Tagihan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Form Create / Edit Payment */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-fit space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingPayment ? '✏️ Edit Tagihan SPP' : '➕ Buat Tagihan SPP Baru'}
              </h2>
              {editingPayment && (
                <button
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

            {msg && (
              <div
                className={`rounded-md p-3 text-sm border ${
                  msg.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Pilih Siswa</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.grade_level || 'Siswa'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Periode Bulan & Tahun</label>
                <input
                  type="text"
                  required
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Contoh: Oktober 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Nominal Tagihan (Rp)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="300000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Status Pembayaran</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="pending">⏳ Belum Lunas (Pending)</option>
                  <option value="paid">✅ Sudah Lunas (Paid)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">Catatan Pembayaran (Opsional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Catatan metode bayar / bukti transfer..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {submitting ? 'Menyimpan...' : editingPayment ? 'Simpan Perubahan' : '+ Terbitkan Tagihan'}
              </button>
            </form>
          </div>

          {/* Daftar Tagihan, Filter & Search */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search Bar & Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <input
                type="text"
                placeholder="🔍 Cari nama siswa atau periode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="paid">✅ Lunas</option>
              </select>
            </div>

            {/* List Transactions */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat & Daftar Tagihan SPP</h2>

              {loading ? (
                <p className="text-sm text-gray-500">Memuat data keuangan...</p>
              ) : filteredPayments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  {searchQuery ? 'Tidak ada tagihan yang sesuai dengan pencarian.' : 'Belum ada data tagihan SPP.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-all gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700">
                            {p.month_year}
                          </span>
                          <button
                            onClick={() => toggleStatus(p)}
                            className={`text-[11px] px-2.5 py-0.5 rounded font-bold transition-transform active:scale-95 ${
                              p.status === 'paid'
                                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
                            }`}
                            title="Klik untuk mengubah status pembayaran"
                          >
                            {p.status === 'paid' ? '✅ LUNAS' : '⏳ PENDING'}
                          </button>
                        </div>
                        <p className="font-bold text-gray-900 text-base">{p.student?.full_name}</p>
                        <p className="text-xs font-semibold text-gray-700">
                          Rp {Number(p.amount).toLocaleString('id-ID')}
                        </p>
                        {p.notes && <p className="text-xs text-gray-500">📝 {p.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEditModal(p)}
                          className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}