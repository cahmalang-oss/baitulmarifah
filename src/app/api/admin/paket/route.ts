import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const supabase = createAdminClient();
    const { data: paketList, error } = await supabase
      .from('paket')
      .select('id, nama, jenis, harga_target, status, deskripsi, syarat_ketentuan, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Count jamaah per paket
    const { data: profileCounts } = await supabase
      .from('jamaah_profile')
      .select('paket_id');
    const countMap = new Map<string, number>();
    profileCounts?.forEach(p => { if (p.paket_id) countMap.set(p.paket_id, (countMap.get(p.paket_id) || 0) + 1); });
    const result = (paketList || []).map(p => ({ ...p, aktif: p.status === 'aktif', peserta_count: countMap.get(p.id) || 0 }));
    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const body = await request.json();
    const { nama, jenis, harga_target, deskripsi, syarat_ketentuan } = body;
    if (!nama || !jenis || !harga_target) return NextResponse.json({ error: 'Nama, jenis, dan harga target wajib diisi' }, { status: 400 });
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('paket').insert({ nama, jenis, harga_target: parseInt(harga_target), deskripsi: deskripsi || null, syarat_ketentuan: syarat_ketentuan || null, status: 'aktif' }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
