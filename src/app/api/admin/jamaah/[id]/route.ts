import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const { action } = body;

    const supabase = createAdminClient();

    if (action === 'update_va') {
      const { no_va } = body;
      
      const { data: profile, error: profileErr } = await supabase
        .from('jamaah_profile')
        .select('id')
        .eq('user_id', id)
        .single();
        
      if (profileErr || !profile) return NextResponse.json({ error: 'Profil jamaah tidak ditemukan' }, { status: 404 });

      const { error } = await supabase
        .from('jamaah_profile')
        .update({ no_va })
        .eq('id', profile.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'update_paket') {
      const { paket_id } = body;
      
      const { data: profile, error: profileErr } = await supabase
        .from('jamaah_profile')
        .select('id')
        .eq('user_id', id)
        .single();
        
      if (profileErr || !profile) return NextResponse.json({ error: 'Profil jamaah tidak ditemukan' }, { status: 404 });

      const { error } = await supabase
        .from('jamaah_profile')
        .update({ paket_id: paket_id || null })
        .eq('id', profile.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
  } catch (error: any) {
    console.error('Update jamaah detail error:', error);
    return NextResponse.json({ error: 'Gagal update data' }, { status: 500 });
  }
}
