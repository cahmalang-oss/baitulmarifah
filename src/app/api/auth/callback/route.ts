import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && authData.user) {
      // Periksa apakah user sudah ada di public.users
      const adminClient = createAdminClient()
      const { data: existingUser } = await adminClient
        .from('users')
        .select('id')
        .eq('email', authData.user.email)
        .single()
        
      if (!existingUser) {
        // Auto-register jamaah dari Google
        const { data: newUser, error: insertError } = await adminClient
          .from('users')
          .insert({
            nama: authData.user.user_metadata.full_name || authData.user.email?.split('@')[0] || 'User',
            email: authData.user.email,
            no_wa: `GOOGLE_${authData.user.id}`, // Placeholder karena no_wa wajib unik & tidak null
            role: 'jamaah',
            status: 'aktif',
            avatar_url: authData.user.user_metadata.avatar_url
          })
          .select()
          .single()
          
        if (!insertError && newUser) {
          await adminClient.from('jamaah_profile').insert({ user_id: newUser.id })
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Jika error, redirect kembali ke login
  return NextResponse.redirect(`${origin}/login?error=CouldNotAuthenticate`)
}
