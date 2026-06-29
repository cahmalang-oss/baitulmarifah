import { NextResponse } from 'next/server';
import { requireOnlyAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const payload = await requireOnlyAdmin();
    if (payload instanceof Response) return payload;

    const supabase = createAdminClient();

    const { data: users, error } = await supabase
      .from('users')
      .select('id, nama, no_wa, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await requireOnlyAdmin();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const { id, role } = body;

    const validRoles = ['jamaah', 'bendahara', 'verifikator', 'admin'];
    if (!id || !role || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    // Jangan bisa ubah role diri sendiri
    if (id === payload.id) {
      return NextResponse.json({ error: 'Tidak bisa mengubah role akun sendiri' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
