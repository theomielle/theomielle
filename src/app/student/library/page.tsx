'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Search, Sparkles, Star, Lock, ArrowRight } from 'lucide-react'

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

export default function StudentLibraryPage() {
  const [books, setBooks] = useState<LibraryBook[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchBooks()
  }, [activeCategory])

  const fetchBooks = async () => {
    setLoading(true)

    let query = supabase.from('library_books').select('*')
    if (activeCategory !== 'all') {
      query = query.eq('sector', activeCategory)
    }

    const { data } = await query.order('created_at', { ascending: false })
    if (data) setBooks(data)

    setLoading(false)
  }

  const CATEGORIES = [
    { id: 'all', label: 'Semua Koleksi' },
    { id: 'textbook_solution', label: 'Textbook Solution' },
    { id: 'theonotes', label: 'TheoNotes & Ringkasan' },
    { id: 'modul_sekolah', label: 'Modul Sekolah' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 antialiased">
      {/* Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Perpustakaan Digital TheoQED
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Perpustakaan & TheoNotes</h1>
          <p className="text-xs text-slate-500 font-medium max-w-xl">
            Kunci jawaban lengkap buku teks dunia, rangkuman rumus ringkas, dan modul matematika/sains interaktif.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari buku, pengarang, atau topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid Card Buku */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat koleksi perpustakaan...</div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Koleksi Buku</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Buku atau modul untuk kategori ini akan segera ditambahkan ke perpustakaan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books
            .filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
              >
                <div className="p-4 space-y-3">
                  {/* Cover Preview Image */}
                  <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden flex items-center justify-center p-3 border border-slate-200/60 shadow-2xs">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center space-y-2">
                        <BookOpen className="w-8 h-8 text-indigo-300 mx-auto opacity-80" />
                        <span className="text-[10px] font-black text-white line-clamp-2 px-1">{book.title}</span>
                      </div>
                    )}

                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase">
                      {book.sector === 'textbook_solution' ? 'Textbook' : book.sector === 'theonotes' ? 'TheoNotes' : 'Modul'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    {book.authors && (
                      <p className="text-[10px] text-slate-500 line-clamp-1">{book.authors}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-t border-slate-100 pt-2.5">
                    <span className="flex items-center gap-1 text-amber-600 font-extrabold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {book.rating}
                    </span>
                    {book.is_premium && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-extrabold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/student/library/${book.id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all w-full shadow-2xs"
                  >
                    Buka Buku <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}