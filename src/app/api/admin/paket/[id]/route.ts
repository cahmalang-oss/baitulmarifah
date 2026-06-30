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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;

    const supabase = createAdminClient();

    const { count } = await supabase
      .from('jamaah_profile')
      .select('id', { count: 'exact', head: true })
      .eq('paket_id', id);

    if (count && count > 0) {
      return NextResponse.json({ error: `Tidak bisa dihapus, masih dipakai ${count} jamaah` }, { status: 400 });
    }

    const { error } = await supabase.from('paket').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
