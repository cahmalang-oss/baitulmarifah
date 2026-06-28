import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const body = await request.json();
    const supabase = createAdminClient();
    // Toggle aktif vs update fields
    if ('aktif' in body) {
      const { error } = await supabase.from('paket').update({ status: body.aktif ? 'aktif' : 'arsip' }).eq('id', id);
      if (error) throw error;
    } else {
      const { nama, harga_target, deskripsi, syarat_ketentuan } = body;
      const { error } = await supabase.from('paket').update({ nama, harga_target: parseInt(harga_target), deskripsi: deskripsi || null, syarat_ketentuan: syarat_ketentuan || null }).eq('id', id);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
