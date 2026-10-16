'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  Trash2,
  User,
  Sparkles,
  ExternalLink,
  FileText
} from 'lucide-react'

interface LesSchedule {
  id: string
  student_email: string
  subject: string
  session_type: 'online' | 'offline'
  meeting_link: string | null
  location_address: string | null
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'canceled'
  notes: string | null
  profiles?: {
    full_name: string | null
  }
}

export default function TutorSchedulePage() {
  const supabase = createClient()

  const [schedules, setSchedules] = useState<LesSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'scheduled' | 'completed' | 'canceled' | 'all'>('scheduled')

  // Form State Modal
  const [showModal, setShowModal] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [sessionType, setSessionType] = useState<'online' | 'offline'>('online')
  const [meetingLink, setMeetingLink] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const tutorEmail = user?.email || 'dave.theoqed@gmail.com'

    const { data } = await supabase
      .from('les_schedules')
      .select('*, profiles(full_name)')
      .eq('tutor_email', tutorEmail)
      .order('scheduled_at', { ascending: true })

    if (data) setSchedules(data as any)
    setLoading(false)
  }

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentEmail || !subject || !scheduledAt) return

    setSubmitting(true)

    // Cari ID Siswa jika terdaftar di profil
    const { data: profData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', studentEmail.trim())
      .single()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('les_schedules').insert({
      tutor_email: user?.email || 'dave.theoqed@gmail.com',
      student_email: studentEmail.trim(),
      student_id: profData?.id || null,
      subject: subject.trim(),
      session_type: sessionType,
      meeting_link: sessionType === 'online' ? meetingLink.trim() || null : null,
      location_address: sessionType === 'offline' ? locationAddress.trim() || null : null,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: durationMinutes,
      status: 'scheduled',
      notes: notes.trim() || null,
    })

    if (!error) {
      alert('Jadwal les berhasil ditambahkan!')
      setShowModal(false)
      resetForm()
      fetchSchedules()
    } else {
      alert('Gagal menambahkan jadwal les.')
    }
    setSubmitting(false)
  }

  const resetForm = () => {
    setStudentEmail('')
    setSubject('')
    setSessionType('online')
    setMeetingLink('')
    setLocationAddress('')
    setScheduledAt('')
    setDurationMinutes(90)
    setNotes('')
  }

  const handleUpdateStatus = async (id: string, newStatus: 'completed' | 'canceled') => {
    const actionText = newStatus === 'completed' ? 'Selesai' : 'Dibatalkan'
    if (!confirm(`Tandai sesi les ini sebagai ${actionText}?`)) return

    await supabase.from('les_schedules').update({ status: newStatus }).eq('id', id)
    fetchSchedules()
  }

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Hapus jadwal les ini dari sistem?')) return
    await supabase.from('les_schedules').delete().eq('id', id)
    fetchSchedules()
  }

  const filteredSchedules = schedules.filter((s) => {
    if (filterStatus === 'all') return true
    return s.status === filterStatus
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 antialiased">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Studio Bimbingan Private
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Jadwal Les Private</h1>
          <p className="text-xs text-slate-500 font-medium">
            Atur jadwal pertemuan les online/offline, tentukan link Google Meet/Zoom, dan kelola presensi sesi.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Jadwal Les
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: 'scheduled', label: 'Mendatang / Aktif' },
          { id: 'completed', label: 'Selesai' },
          { id: 'canceled', label: 'Dibatalkan' },
          { id: 'all', label: 'Semua Pertemuan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid List Jadwal */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat jadwal pertemuan...</div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Tidak Ada Jadwal Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Belum ada agenda bimbingan les private untuk kategori status ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((item) => {
            const dateObj = new Date(item.scheduled_at)

            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        item.session_type === 'online'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {item.session_type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      Sesi {item.session_type === 'online' ? 'Online' : 'Tatap Muka (Offline)'}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'canceled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status === 'completed' ? 'Selesai' : item.status === 'canceled' ? 'Dibatalkan' : 'Terjadwal'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">{item.subject}</h3>
                    <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      {item.profiles?.full_name || item.student_email}
                    </p>
                  </div>

                  {/* Info Waktu & Tanggal */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5 text-slate-700">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
  <CalendarIcon className="w-4 h-4 text-indigo-600" />
  {dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })}
</div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Pukul {dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB ({item.duration_minutes} Menit)
                    </div>
                  </div>

                  {/* Link / Alamat */}
                  {item.session_type === 'online' && item.meeting_link && (
                    <a
                      href={item.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors w-fit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Buka Ruang Google Meet / Zoom
                    </a>
                  )}

                  {item.session_type === 'offline' && item.location_address && (
                    <p className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 font-medium">
                      <strong className="text-slate-900 block mb-0.5">Lokasi Les:</strong> {item.location_address}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic">Catatan: "{item.notes}"</p>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {item.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'completed')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                        >
                          Tandai Selesai
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'canceled')}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                        >
                          Batalkan
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteSchedule(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Pertemuan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Tambah Jadwal Les */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900">Buat Jadwal Les Private Baru</h3>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Topik / Mata Pelajaran Sesi</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kalkulus - Bimbingan Persiapan UTS"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Sesi</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                  >
                    <option value="online">Online (Meet/Zoom)</option>
                    <option value="offline">Offline (Tatap Muka)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min="30"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal & Waktu Pertemuan</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold"
                />
              </div>

              {sessionType === 'online' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Pertemuan (Google Meet/Zoom)</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lokasi Pertemuan Tatap Muka</label>
                  <textarea
                    rows={2}
                    placeholder="Alamat rumah siswa atau lokasi les..."
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Materi yang harus disiapkan siswa..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Jadwalkan Les'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}