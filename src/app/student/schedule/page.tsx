'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface LesSchedule {
  id: string
  subject: string
  session_type: 'online' | 'offline'
  meeting_link: string | null
  location_address: string | null
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'canceled'
  notes: string | null
}

export default function StudentSchedulePage() {
  const supabase = createClient()

  const [schedules, setSchedules] = useState<LesSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMySchedules()
  }, [])

  const fetchMySchedules = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email) {
      const { data } = await supabase
        .from('les_schedules')
        .select('*')
        .eq('student_email', user.email)
        .order('scheduled_at', { ascending: true })

      if (data) setSchedules(data)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 antialiased">
      {/* Banner Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Agenda Les Private Saya
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Jadwal Bimbingan Les</h1>
        <p className="text-xs text-slate-500 font-medium">
          Pantau sesi bimbingan les private kamu, dapatkan tautan Google Meet/Zoom, dan cek lokasi bimbingan.
        </p>
      </div>

      {/* Grid List Pertemuan */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat agenda les kamu...</div>
      ) : schedules.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Jadwal Les Terdaftar</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Jika kamu merupakan siswa les private, pengajar akan menjadwalkan sesi bimbingan di halaman ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((item) => {
            const dateObj = new Date(item.scheduled_at)

            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        item.session_type === 'online'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}
                    >
                      {item.session_type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      Sesi {item.session_type === 'online' ? 'Online' : 'Tatap Muka'}
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

                  <h3 className="text-base font-black text-slate-900">{item.subject}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
  <CalendarIcon className="w-4 h-4 text-indigo-600" />
  {dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })}
</span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Pukul {dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB ({item.duration_minutes} Menit)
                    </span>
                  </div>

                  {item.session_type === 'offline' && item.location_address && (
                    <p className="text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 font-medium">
                      <strong className="text-slate-900 block mb-0.5">Lokasi Tatap Muka:</strong> {item.location_address}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic">Catatan Tutor: "{item.notes}"</p>
                  )}
                </div>

                {item.session_type === 'online' && item.meeting_link && item.status === 'scheduled' && (
                  <div className="shrink-0">
                    <a
                      href={item.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" /> Masuk Ruang Les
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}