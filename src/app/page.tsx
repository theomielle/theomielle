'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  School,
  FileSpreadsheet,
  Library,
  Calendar,
  Crown,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Trophy,
  GraduationCap,
  Video,
  ChevronDown,
  ChevronUp,
  User,
  Star
} from 'lucide-react'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
              Q
            </span>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-lg tracking-tight leading-none">TheoQED</span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase mt-1">Math & Science Ecosystem</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#sektor" className="hover:text-indigo-600 transition-colors">Sektor Pembelajaran</a>
            <a href="#fitur" className="hover:text-indigo-600 transition-colors">Fitur Unggulan</a>
            <a href="#paket" className="hover:text-indigo-600 transition-colors">Paket & Akses</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Masuk Akun
            </Link>

            <Link
              href="/register"
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shadow-slate-950/10"
            >
              Mulai Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Platform Belajar Matematika & Sains Terintegrasi</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Kuasai Konsep Matematika & Sains Dari Sekolah Hingga Perguruan Tinggi
          </h1>

          <p className="text-sm md:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Ekosistem belajar terlengkap: Bank Soal berjenjang, Kunci Jawaban Buku Teks Dunia, Rangkuman TheoNotes, LMS Kelas Interaktif, hingga Layanan Bimbingan Les Private.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-xl shadow-slate-950/20 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Mulai Belajar Gratis Sekarang <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#paket"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold transition-all border border-slate-200/80 shadow-xs w-full sm:w-auto justify-center"
            >
              Lihat Skema Akses & Pricing
            </a>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-xs font-bold border-t border-slate-200/60 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Format LaTeX Presisi Tinggi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sesi Online & Tatap Muka</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Buku Teks & Modul Terstruktur</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEKTOR PEMBELAJARAN (4 SEKTOR UTAMA) */}
      <section id="sektor" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Fleksibel Untuk Semua Jenjang
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              4 Sektor Utama Repository & Bank Soal TheoQED
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Dirancang untuk mendampingi perjalanan akademik Anda mulai dari jenjang sekolah hingga tingkat perkuliahan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sektor 1: Sekolah */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-indigo-600/50 hover:shadow-lg transition-all space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 w-fit">
                <School className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Tingkat Sekolah (SMP & SMA)</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Latihan per bab, paket soal HOTS, ulangan harian, dan pembahasan buku paket kurikulum sekolah.
                </p>
              </div>
            </div>

            {/* Sektor 2: Seleksi Masuk */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-emerald-600/50 hover:shadow-lg transition-all space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 w-fit">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">UTBK & SKD Kedinasan</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Soal Penalaran Matematika SNBT, TPS Kuantitatif, serta Tes Inteligensia Umum (TIU) Kedinasan & CPNS.
                </p>
              </div>
            </div>

            {/* Sektor 3: Olimpiade */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-600/50 hover:shadow-lg transition-all space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 w-fit">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Olimpiade & Sains</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Kumpulan soal dan solusi mendalam OSN-K, OSN-P, OSN Nasional, hingga kompetisi tingkat mahasiswa (ONMIPA/IMC).
                </p>
              </div>
            </div>

            {/* Sektor 4: Perguruan Tinggi */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-purple-600/50 hover:shadow-lg transition-all space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 text-purple-600 w-fit">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Perguruan Tinggi</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Navigasi berjenjang per Kampus (ITB, UGM, UI, dll) $\rightarrow$ Fakultas $\rightarrow$ Mata Kuliah (Kalkulus, Aljabar, Analisis Real).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FITUR UNGGULAN EKOSISTEM */}
      <section id="fitur" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Satu Platform Untuk Semua
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Fitur Lengkap Pendorong Keberhasilan Akademik
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 w-fit">
                <Library className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Perpustakaan & TheoNotes</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Nikmati *Digital Reader Mode* 2-kolom dengan rangkuman teori, kotak penjelas **DEFINISI / TEOREMA**, serta solusi langkah demi langkah buku teks populer dunia.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 w-fit">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Interactive LMS Classroom</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Ruang kelas digital lengkap dengan *Stream*, pengumpulan tugas (*Classwork*), umpan balik, dan modul penilaian nilai (*Grading*) transparan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 w-fit">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Manajemen Les Private</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Bimbingan personal langsung bersama tutor untuk sesi *Online* (Google Meet/Zoom) maupun *Offline* (Tatap Muka) lengkap dengan presensi & tagihan SPP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PAKET & AKSES (4 TIERING) */}
      <section id="paket" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Pilihan Keanggotaan
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Skema Akses Sesuai Kebutuhan Belajar Anda
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Pilih paket belajar mandiri digital atau bimbingan les private langsung bersama pengajar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Plan 1: Free */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase">
                  Akun Gratis
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Free Plan</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">Rp 0</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-2">✓ Katalog Course Umum</li>
                  <li className="flex items-center gap-2">✓ Modul TheoNotes Gratis</li>
                  <li className="flex items-center gap-2">✓ Akses Bank Soal Dasar</li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition-all shadow-2xs"
              >
                Daftar Akun Gratis
              </Link>
            </div>

            {/* Plan 2: Member Premium */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
              <span className="absolute -right-12 top-6 bg-amber-500 text-slate-950 font-black text-[9px] uppercase py-1 px-12 rotate-45">
                Populer
              </span>

              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  Digital Premium
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">Member Premium</h3>
                  <p className="text-2xl font-black text-amber-400 mt-1">Rp 99.000 <span className="text-xs font-medium text-slate-400">/ bulan</span></p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-medium pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">✓ Semua Fitur Free Plan</li>
                  <li className="flex items-center gap-2 text-amber-300">✓ Full Kunci Jawaban Buku Teks</li>
                  <li className="flex items-center gap-2 text-amber-300">✓ Bank Soal HOTS & Pembahasan</li>
                  <li className="flex items-center gap-2 text-amber-300">✓ Solusi Pembuktian Teorema</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black text-center transition-all shadow-md"
              >
                Langganan Premium
              </Link>
            </div>

            {/* Plan 3: Siswa Les Private */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
                  Bimbingan Personal
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Siswa Les Private</h3>
                  <p className="text-sm font-bold text-slate-500 mt-1">Sesuai Kesepakatan Sesi</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 font-medium pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-2">✓ Akses Kelas LMS Exclusif</li>
                  <li className="flex items-center gap-2">✓ Sesi Les Online / Tatap Muka</li>
                  <li className="flex items-center gap-2">✓ Akses Materi Khusus Tutor</li>
                  <li className="flex items-center gap-2">✓ Dasbor Tagihan SPP Bulanan</li>
                </ul>
              </div>

              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition-all shadow-2xs"
              >
                Konsultasi Les Private
              </a>
            </div>

            {/* Plan 4: Les Private + Premium */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-50 to-slate-50 border border-indigo-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-[10px] font-black uppercase">
                  Paket Kombinasi
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Private + Premium</h3>
                  <p className="text-sm font-bold text-indigo-600 mt-1">Fasilitas Terlengkap</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium pt-2 border-t border-indigo-100">
                  <li className="flex items-center gap-2">✓ Seluruh Akses Member Premium</li>
                  <li className="flex items-center gap-2">✓ Seluruh Akses Kelas LMS & Les</li>
                  <li className="flex items-center gap-2">✓ Bimbingan Bintang 5 Personal</li>
                </ul>
              </div>

              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center transition-all shadow-md"
              >
                Daftar Paket Lengkap
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Pertanyaan Umum
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Sering Ditanyakan (FAQ)
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Apa perbedaan antara Course Satuan dan Akun Premium?',
                a: 'Pembelian Course Satuan memberikan Anda hak akses permanen selamanya untuk satu judul kursus tertentu. Sementara Akun Premium memberikan akses penuh berjangka (sebulan/setahun) ke seluruh perpustakaan TheoNotes, kunci jawaban buku teks, dan bank soal HOTS.'
              },
              {
                q: 'Bagaimana cara bergabung ke kelas LMS jika saya siswa les private?',
                a: 'Tutor akan mendaftarkan email Anda ke kelas LMS yang bersangkutan. Setelah itu, ruang kelas akan langsung muncul di halaman "Kelas LMS Saya" pada portal siswa.'
              },
              {
                q: 'Apakah soal dan materi di TheoQED mendukung rumus matematika komplek?',
                a: 'Ya, seluruh rumus matematika dan sains disajikan menggunakan engine LaTeX / KaTeX berpresisi tinggi untuk memastikan penulisan simbol dan matriks tampil sempurna.'
              },
              {
                q: 'Apakah sesi les private dilakukan secara online atau tatap muka?',
                a: 'Tutor menyediakan kedua opsi. Sesi online menggunakan Google Meet/Zoom, sedangkan sesi offline dilakukan dengan tatap muka langsung sesuai kesepakatan lokasi.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-xs md:text-sm font-black text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-white text-slate-900 font-black text-sm flex items-center justify-center">
              Q
            </span>
            <span className="font-black text-sm tracking-tight">TheoQED Platform</span>
          </div>

          <p className="text-xs text-slate-400 font-medium text-center md:text-left">
            © {new Date().getFullYear()} TheoQED. All rights reserved. Platform Belajar Matematika & Sains Terintegrasi.
          </p>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-bold">
            <Link href="/login" className="hover:text-white transition-colors">Portal Siswa</Link>
            <Link href="/login" className="hover:text-white transition-colors">Portal Tutor</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}