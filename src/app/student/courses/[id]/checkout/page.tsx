'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Sparkles, CheckCircle2, MessageCircle, Gift } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  category: string
  instructor_name: string
  price: number | null
}

export default function CourseCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCourseDetail()
  }, [courseId])

  const fetchCourseDetail = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (data) setCourse(data)
    setLoading(false)
  }

  const isFree = !course?.price || course.price === 0

  // Kirim Permintaan Akses: Otomatis 'active' untuk kelas gratis, 'pending' untuk kelas berbayar
  const handleRequestAccess = async () => {
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    const studentEmail = user?.email || 'siswa.theoqed@gmail.com'
    const targetStatus = isFree ? 'active' : 'pending'

    const { error } = await supabase.from('course_enrollments').upsert({
      course_id: courseId,
      student_email: studentEmail,
      status: targetStatus,
    }, { onConflict: 'user_id,course_id' })

    if (!error) {
      if (isFree) {
        alert('Selamat! Kelas gratis ini telah ditambahkan ke Kelas Saya.')
        router.push(`/student/my-courses`)
      } else {
        alert('Permintaan akses berhasil dikirim! Silakan konfirmasi via WhatsApp ke tutor agar segera diverifikasi.')
        router.push(`/student/courses/${courseId}`)
      }
    } else {
      const { error: insertError } = await supabase.from('course_enrollments').insert({
        course_id: courseId,
        student_email: studentEmail,
        status: targetStatus,
      })

      if (!insertError) {
        if (isFree) {
          alert('Selamat! Kelas gratis ini telah ditambahkan ke Kelas Saya.')
          router.push(`/student/my-courses`)
        } else {
          alert('Permintaan akses berhasil dikirim!')
          router.push(`/student/courses/${courseId}`)
        }
      } else {
        alert(isFree ? 'Anda sudah terdaftar di kelas ini.' : 'Anda sudah mengajukan permintaan untuk kelas ini.')
        router.push(isFree ? `/student/my-courses` : `/student/courses/${courseId}`)
      }
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-400">
        Memuat halaman pendaftaran...
      </div>
    )
  }

  const coursePriceText = isFree ? 'Gratis' : `Rp ${course?.price?.toLocaleString('id-ID')}`

  const waMessage = encodeURIComponent(`Halo Tutor, saya sudah melakukan transfer pembayaran untuk kelas "${course?.title}" sebesar ${coursePriceText}. Mohon bantu verifikasi dan setujui akses kelas saya di TheoQED. Terima kasih!`)
  const waUrl = `https://wa.me/6281234567890?text=${waMessage}`

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 antialiased">
      <Link
        href={`/student/courses/${courseId}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Detail Kelas
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
        <div className="space-y-1 pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider mb-2">
            {isFree ? <Gift className="w-3 h-3 text-emerald-600" /> : <Sparkles className="w-3 h-3 text-indigo-600" />}
            {isFree ? 'Kelas Gratis TheoQED' : 'TheoQED Secure Checkout'}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isFree ? 'Pendaftaran Kelas Gratis' : 'Instruksi Pembayaran Kelas'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {isFree
              ? 'Akses langsung diberikan tanpa perlu verifikasi pembayaran.'
              : 'Lakukan transfer sesuai nominal dan konfirmasikan pembayaran Anda.'}
          </p>
        </div>

        {/* Ringkasan Kelas & Harga */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ringkasan Kelas</span>
          <h3 className="text-base font-black text-slate-900">{course?.title}</h3>
          <p className="text-xs text-slate-600 line-clamp-2">{course?.description}</p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs font-bold text-slate-700">
            <span>Pengajar: {course?.instructor_name}</span>
            <span className={isFree ? 'text-emerald-600 font-black text-sm' : 'text-indigo-600 font-black text-sm'}>
              Total: {coursePriceText}
            </span>
          </div>
        </div>

        {/* Jika berbayar, tampilkan detail rekening */}
        {!isFree && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Rekening Tujuan Transfer</h3>
            <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  BCA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Bank Central Asia (BCA)</h4>
                  <span className="text-[11px] font-medium text-slate-500">No. Rekening: 1234-5678-90 a.n. Dave Marcellino</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                Verifikasi Manual
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-end gap-3">
          {!isFree && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Konfirmasi via WhatsApp Tutor
            </a>
          )}

          <button
            onClick={handleRequestAccess}
            disabled={submitting}
            className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 ${
              isFree ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            {submitting
              ? 'Memproses...'
              : isFree
                ? 'Klaim Akses Gratis Sekarang'
                : 'Kirim Permintaan Akses'}
          </button>
        </div>
      </div>
    </div>
  )
}