import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const supabase = createAdminClient();
    const { data: grups, error } = await supabase
      .from('grup')
      .select('id, nama, target_anggota, paket(nama, harga_target), jamaah_profile(id, saldo)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const result = (grups || []).map((g: any) => {
      const paketData = Array.isArray(g.paket) ? g.paket[0] : g.paket;
      const anggotaList = Array.isArray(g.jamaah_profile) ? g.jamaah_profile : [];
      const terkumpul = anggotaList.reduce((sum: number, a: any) => sum + (a.saldo || 0), 0);
      const target = paketData?.harga_target || 0;
      return {
        id: g.id, nama: g.nama,
        paket_nama: paketData?.nama || '-',
        paket_harga: target,
        anggota_saat_ini: anggotaList.length,
        target_anggota: g.target_anggota || 7,
        terkumpul_saldo: terkumpul,
        progress_persen: target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0
      };
    });
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
    const { nama, paket_id, target_anggota } = body;
    if (!nama || !paket_id) return NextResponse.json({ error: 'Nama dan paket wajib diisi' }, { status: 400 });
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('grup').insert({ nama, paket_id, target_anggota: target_anggota || 7 }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
