'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Lock } from 'lucide-react'

interface PageContent {
  id: string
  title: string
  content_markdown: string
  is_locked: boolean
  order_index: number
}

interface Chapter {
  id: string
  title: string
  pages: PageContent[]
}

export default function StudentLibraryReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookId } = use(params)
  const supabase = createClient()

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activePage, setActivePage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReaderContent()
  }, [bookId])

  const fetchReaderContent = async () => {
    setLoading(true)

    const { data: chapData } = await supabase
      .from('library_chapters')
      .select(`
        id, title, order_index,
        library_pages (
          id, title, content_markdown, is_locked, order_index
        )
      `)
      .eq('book_id', bookId)
      .order('order_index', { ascending: true })

    if (chapData) {
      const formatted = chapData.map((c: any) => ({
        ...c,
        pages: (c.library_pages || []).sort((a: any, b: any) => a.order_index - b.order_index),
      }))
      setChapters(formatted)

      if (formatted.length > 0 && formatted[0].pages.length > 0) {
        setActivePage(formatted[0].pages[0])
      }
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-400">
        Membuka ruang baca...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased -m-6 md:-m-10">
      {/* Top Bar Header */}
      <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-20 shadow-2xs">
        <Link
          href={`/student/library/${bookId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <h1 className="text-xs font-black text-slate-900 truncate max-w-md">
          {activePage?.title || 'Modul Pembelajaran'}
        </h1>

        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
          TheoQED Reader
        </span>
      </div>

      {/* Main Reader Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Outline */}
        <div className="w-72 bg-slate-50 border-r border-slate-200 p-4 space-y-4 overflow-y-auto shrink-0 hidden md:block">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Daftar Isi Materi</span>
          <div className="space-y-3">
            {chapters.map((chap, cIdx) => (
              <div key={chap.id} className="space-y-1">
                <span className="text-[11px] font-black text-slate-600 block px-2 py-1">
                  Bab {cIdx + 1}: {chap.title}
                </span>
                <div className="space-y-1">
                  {chap.pages.map((p) => {
                    const isActive = activePage?.id === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActivePage(p)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="truncate">{p.title}</span>
                        {p.is_locked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto max-w-4xl mx-auto space-y-6">
          {activePage?.is_locked ? (
            <div className="bg-slate-50 border border-slate-200 p-12 rounded-3xl text-center space-y-4 my-12">
              <Lock className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-lg font-black text-slate-900">Materi Terkunci</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Materi ini masuk dalam paket langganan TheoQED Premium.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4">
                {activePage?.title}
              </h2>

              <div className="prose max-w-none text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {activePage?.content_markdown || (
                  <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                    <span className="text-xs font-black text-indigo-700 uppercase tracking-wider block">📌 Definisi & Teorema</span>
                    <p className="text-xs text-indigo-900">
                      Gunakan modul ini untuk mempelajari teorema, pembuktian, dan latihan soal secara terstruktur.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}