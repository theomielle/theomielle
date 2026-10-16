'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, CheckCircle2 } from 'lucide-react'

interface QuestionItem {
  id: string
  question_number: number
  question_markdown: string
  solution_markdown: string | null
  is_locked: boolean
}

export default function StudentBankSoalPaperPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: paperId } = use(params)
  const supabase = createClient()

  const [paperTitle, setPaperTitle] = useState('')
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaperQuestions()
  }, [paperId])

  const fetchPaperQuestions = async () => {
    setLoading(true)

    const { data: paperData } = await supabase
      .from('bank_soal_papers')
      .select('title')
      .eq('id', paperId)
      .single()

    if (paperData) setPaperTitle(paperData.title)

    const { data: qData } = await supabase
      .from('bank_soal_items')
      .select('*')
      .eq('paper_id', paperId)
      .order('question_number', { ascending: true })

    if (qData) setQuestions(qData)

    setLoading(false)
  }

  const currentQ = questions[currentIndex]

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-bold text-slate-400">
        Memuat lembar soal...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased -m-6 md:-m-10">
      {/* Topbar Navigation */}
      <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
        <Link
          href="/student/bank-soal"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <h1 className="text-xs font-black text-slate-900 truncate max-w-md">{paperTitle}</h1>

        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase">
          Soal {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nomor Soal */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-3 shrink-0 hidden md:block overflow-y-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Daftar Nomor Soal</span>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {q.question_number}
              </button>
            ))}
          </div>
        </div>

        {/* Display Soal & Pembahasan */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto max-w-4xl mx-auto space-y-6">
          {currentQ ? (
            <div className="space-y-6">
              {/* Box Soal */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider block">
                  Soal Nomor {currentQ.question_number}
                </span>
                <div className="text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                  {currentQ.question_markdown}
                </div>
              </div>

              {/* Box Pembahasan */}
              {currentQ.is_locked ? (
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                  <Lock className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-black text-slate-900">Pembahasan Terkunci</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Aktifkan paket berlangganan TheoQED Premium untuk membuka solusi & pembahasan lengkapnya.
                  </p>
                </div>
              ) : (
                currentQ.solution_markdown && (
                  <div className="bg-emerald-50/60 p-6 md:p-8 rounded-3xl border border-emerald-200/80 space-y-3">
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Pembahasan & Solusi
                    </span>
                    <div className="text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                      {currentQ.solution_markdown}
                    </div>
                  </div>
                )
              )}

              {/* Prev / Next Control */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Sebelumnya
                </button>
                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                >
                  Selanjutnya <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-xs font-bold text-slate-400">Soal tidak ditemukan.</div>
          )}
        </div>
      </div>
    </div>
  )
}