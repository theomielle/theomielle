import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    // 1. Verifikasi bahwa yang memanggil API ini adalah Tutor
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'tutor') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
    }

    // 2. Ambil data siswa dari request body
    const { email, password, fullName, gradeLevel, phone } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Data wajib diisi lengkap' }, { status: 400 })
    }

    // 3. Gunakan Service Role Key untuk bypass email rate limit & auto confirm user
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buat user lewat Admin API agar email_confirm otomatis terverifikasi
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Gagal membuat akun' }, { status: 400 })
    }

    // 4. Masukkan data profil siswa ke tabel profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role: 'student',
        grade_level: gradeLevel,
        phone: phone,
      })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Siswa berhasil didaftarkan' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}