'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  School,
  Target,
  Trophy,
  GraduationCap,
  Folder,
  ChevronRight,
  FileText,
  Search,
  Sparkles,
  Lock,
  BookOpen
} from 'lucide-react'

interface BankSoalFolder {
  id: string
  parent_id: string | null
  sector: 'sekolah' | 'seleksi' | 'olimpiade' | 'kuliah'
  title: string
  description: string | null
  icon_name: string | null
}

interface BankSoalPaper {
  id: string
  title: string
  year: number | null
  difficulty_level: string
  is_premium: boolean
}

const SECTORS = [
  { id: 'sekolah', label: 'Sekolah (SMP & SMA)', icon: School, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'seleksi', label: 'Seleksi & Ujian Masuk', icon: Target, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'olimpiade', label: 'Olimpiade & Sains', icon: Trophy, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { id: 'kuliah', label: 'Perguruan Tinggi', icon: GraduationCap, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
]

export default function StudentBankSoalPage() {
  const [activeSector, setActiveSector] = useState<'sekolah' | 'seleksi' | 'olimpiade' | 'kuliah'>('kuliah')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<BankSoalFolder[]>([])

  const [folders, setFolders] = useState<BankSoalFolder[]>([])
  const [papers, setPapers] = useState<BankSoalPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  useEffect(() => {
    setCurrentFolderId(null)
    setFolderBreadcrumbs([])
  }, [activeSector])

  useEffect(() => {
    fetchContents()
  }, [activeSector, currentFolderId])

  const fetchContents = async () => {
    setLoading(true)

    let folderQuery = supabase
      .from('bank_soal_folders')
      .select('*')
      .eq('sector', activeSector)

    if (currentFolderId) {
      folderQuery = folderQuery.eq('parent_id', currentFolderId)
    } else {
      folderQuery = folderQuery.is('parent_id', null)
    }

    const { data: folderData } = await folderQuery.order('order_index', { ascending: true })
    if (folderData) setFolders(folderData)

    if (currentFolderId) {
      const { data: paperData } = await supabase
        .from('bank_soal_papers')
        .select('*')
        .eq('folder_id', currentFolderId)
        .order('created_at', { ascending: false })

      if (paperData) setPapers(paperData)
    } else {
      setPapers([])
    }

    setLoading(false)
  }

  const handleOpenFolder = (folder: BankSoalFolder) => {
    setFolderBreadcrumbs([...folderBreadcrumbs, folder])
    setCurrentFolderId(folder.id)
  }

  const handleNavigateBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(null)
      setFolderBreadcrumbs([])
    } else {
      const target = folderBreadcrumbs[index]
      setCurrentFolderId(target.id)
      setFolderBreadcrumbs(folderBreadcrumbs.slice(0, index + 1))
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 antialiased">
      {/* Banner Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Repository Bank Soal & Pembahasan TheoQED
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bank Soal Interaktif</h1>
        <p className="text-xs text-slate-500 font-medium max-w-2xl">
          Akses ribuan kumpulan soal dan pembahasan terstruktur untuk tingkat Sekolah, Seleksi Kedinasan/UTBK, Olimpiade, dan Mata Kuliah PTN.
        </p>
      </div>

      {/* Tab Switcher 4 Sektor Utama */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SECTORS.map((sec) => {
          const Icon = sec.icon
          const isActive = activeSector === sec.id

          return (
            <button
              key={sec.id}
              onClick={() => setActiveSector(sec.id as any)}
              className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 text-left cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-black tracking-tight">{sec.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search Bar & Navigasi Breadcrumbs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold overflow-x-auto py-1">
          <button
            onClick={() => handleNavigateBreadcrumb(-1)}
            className={`hover:text-indigo-600 transition-colors shrink-0 ${
              currentFolderId === null ? 'text-slate-900 font-extrabold' : 'text-slate-500'
            }`}
          >
            {SECTORS.find((s) => s.id === activeSector)?.label}
          </button>

          {folderBreadcrumbs.map((crumb, idx) => (
            <div key={crumb.id} className="flex items-center gap-2 shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => handleNavigateBreadcrumb(idx)}
                className={`hover:text-indigo-600 transition-colors ${
                  idx === folderBreadcrumbs.length - 1 ? 'text-indigo-600 font-extrabold' : 'text-slate-500'
                }`}
              >
                {crumb.title}
              </button>
            </div>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari mata pelajaran, kampus, atau soal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Content Explorer Area */}
      {loading ? (
        <div className="text-center py-20 text-xs font-bold text-slate-400">Memuat koleksi folder...</div>
      ) : (
        <div className="space-y-8">
          {/* Folder Grid */}
          {folders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders
                .filter((f) => f.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleOpenFolder(f)}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-600/50 hover:shadow-md transition-all text-left group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-0.5">FOLDER</span>
                        <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {f.title}
                        </h3>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
            </div>
          )}

          {/* Papers List */}
          {papers.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black uppercase text-indigo-600 tracking-wider">Berkas Ujian & Latihan Soal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {papers.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-4 shadow-2xs hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-black text-slate-900 truncate">{p.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          {p.year && <span>Tahun {p.year}</span>}
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                            {p.difficulty_level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/student/bank-soal/paper/${p.id}`}
                      className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-2xs shrink-0 flex items-center gap-1.5"
                    >
                      {p.is_premium && <Lock className="w-3 h-3 text-amber-300" />} Kerjakan Soal
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {folders.length === 0 && papers.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-extrabold text-slate-900 text-sm">Belum Ada Materi Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Folder atau berkas soal pada kategori ini sedang disiapkan oleh tim pengajar TheoQED.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}