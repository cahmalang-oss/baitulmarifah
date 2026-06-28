import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  cookieStore.delete('bm-token')

  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (e) {
    console.error('Error signing out of supabase', e)
  }

  return NextResponse.redirect(new URL('/login', request.url))
}
