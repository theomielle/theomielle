'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  GraduationCap,
  PlayCircle,
  BookOpen,
  Sparkles
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  category: string
  category_id?: string | null
  instructor_name: string
  image_url: string | null
  price: number | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchCoursesAndCategories()
  }, [])

  const fetchCoursesAndCategories = async () => {
    setLoading(true)

    // 1. Fetch Kategori Dinamis dari Supabase
    const { data: catData } = await supabase
      .from('course_categories')
      .select('*')
      .order('name', { ascending: true })

    if (catData) {
      setCategories(catData)
    }

    // 2. Fetch Daftar Course yang Published
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('title', { ascending: true })

    if (courseData) {
      setCourses(courseData)
      setFilteredCourses(courseData)
    }

    setLoading(false)
  }

  // Filter Otomatis Berdasarkan Kategori & Kata Kunci Pencarian
  useEffect(() => {
    let result = courses

    if (selectedCategory !== 'Semua') {
      result = result.filter(
        (c) => c.category === selectedCategory || c.category_id === selectedCategory
      )
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          (c.instructor_name && c.instructor_name.toLowerCase().includes(q))
      )
    }

    setFilteredCourses(result)
  }, [selectedCategory, searchQuery, courses])

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 antialiased">
      {/* Header Banner Katalog */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-indigo-600" /> TheoQED Academy
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Kelas & Pembelajaran</h1>
        <p className="text-xs text-slate-500 font-medium max-w-xl">
          Pilih materi kuliah, analisis riil, kalkulus, atau persiapan olimpiade matematika secara sistematis.
        </p>
      </div>

      {/* Filter Kategori Dinamis & Pencarian */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Pill Buttons Kategori */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'Semua'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Input Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul atau materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid Kartu Kursus */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat katalog kelas...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <BookOpen className="w-6 h-6 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-slate-900 text-sm">Tidak Ada Kelas Ditemukan</h3>
          <p className="text-xs text-slate-500">Coba ubah kata kunci atau pilih kategori lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-all"
            >
              {/* Banner Gambar */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-sm tracking-tight bg-gradient-to-br from-slate-900 to-indigo-950">
                    TheoQED Academy
                  </div>
                )}
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                  {course.category}
                </span>
              </div>

              {/* Detail Konten */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-base tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {course.description || 'Pelajari materi terstruktur dan kuasai konsep dasarnya.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" /> 
                      <span className="truncate">{course.instructor_name}</span>
                    </div>
                    <span className="text-sm font-black text-indigo-600 shrink-0">
                      {course.price && course.price > 0 ? `Rp ${course.price.toLocaleString('id-ID')}` : 'Gratis'}
                    </span>
                  </div>

                  <Link
                    href={`/student/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs w-full justify-center"
                  >
                    <PlayCircle className="w-4 h-4 text-emerald-400" /> Mulai Belajar / Lihat Kelas
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}