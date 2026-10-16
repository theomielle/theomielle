'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  BookOpen,
  Star,
  Lock,
  ChevronDown,
  ChevronUp,
  Share2,
  BookMarked
} from 'lucide-react'

interface Chapter {
  id: string
  title: string
  order_index: number
}

interface LibraryBook {
  id: string
  sector: string
  title: string
  authors: string | null
  isbn: string | null
  cover_url: string | null
  description: string | null
  tags: string[] | null
  rating: number
  is_premium: boolean
}

export default function StudentBookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookId } = use(params)
  const supabase = createClient()

  const [book, setBook] = useState<LibraryBook | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [openChapterId, setOpenChapterId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookDetails()
  }, [bookId])

  const fetchBookDetails = async () => {
    setLoading(true)

    const { data: bookData } = await supabase
      .from('library_books')
      .select('*')
      .eq('id', bookId)
      .single()

    if (bookData) setBook(bookData)

    const { data: chapterData } = await supabase
      .from('library_chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('order_index', { ascending: true })

    if (chapterData) {
      setChapters(chapterData)
      if (chapterData.length > 0) setOpenChapterId(chapterData[0].id)
    }

    setLoading(false)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Tautan buku berhasil disalin!')
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-400">
        Memuat detail buku...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 antialiased">
      <Link
        href="/student/library"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Perpustakaan
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 shadow-xs">
        <div className="md:col-span-4 lg:col-span-3">
          <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden p-4 border border-slate-200 shadow-md flex items-center justify-center">
            {book?.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-center space-y-3">
                <BookOpen className="w-12 h-12 text-indigo-300 mx-auto" />
                <span className="text-xs font-black text-white block px-2">{book?.title}</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                {book?.sector === 'textbook_solution' ? 'Textbook Solution' : book?.sector === 'theonotes' ? 'TheoNotes' : 'Modul Belajar'}
              </span>
              {book?.is_premium && (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Akses Premium
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {book?.title}
            </h1>

            {book?.authors && (
              <p className="text-xs font-bold text-slate-600">Pengarang / Tim Penyusun: {book.authors}</p>
            )}

            {book?.isbn && (
              <p className="text-[11px] text-slate-400 font-mono">ISBN: {book.isbn}</p>
            )}

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{book?.rating} dari 5 Penilaian</span>
            </div>

            {book?.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {book.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {book?.description && (
              <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {book.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <Link
              href={`/student/library/read/${bookId}`}
              className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <BookMarked className="w-4 h-4" /> Mulai Membaca Modul
            </Link>
            <button
              onClick={handleShare}
              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Bagikan
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-base font-black text-slate-900">Daftar Isi & Struktur Bab</h3>
          <span className="text-xs font-bold text-slate-400">{chapters.length} Bab Terstruktur</span>
        </div>

        <div className="space-y-3">
          {chapters.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-bold">Daftar isi bab sedang diperbarui.</div>
          ) : (
            chapters.map((chap, idx) => (
              <div key={chap.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <button
                  onClick={() => setOpenChapterId(openChapterId === chap.id ? null : chap.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{chap.title}</span>
                  </div>
                  {openChapterId === chap.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}