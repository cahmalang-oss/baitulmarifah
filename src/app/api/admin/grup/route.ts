import { NextResponse } from 'next/server';
import { requireVerifikator } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

const KAPASITAS_PER_SAPI = 7;

// Grup patungan diturunkan otomatis dari paket (jenis sapi-patungan) + jamaah
// yang sudah terdaftar & disetujui pada paket tsb — tidak ada input manual.
export async function GET() {
  try {
    const payload = await requireVerifikator();
    if (payload instanceof Response) return payload;
    const supabase = createAdminClient();

    const { data: paketList, error: paketError } = await supabase
      .from('paket')
      .select('id, nama, harga_target')
      .eq('jenis', 'sapi-patungan')
      .eq('status', 'aktif')
      .order('nama', { ascending: true });
    if (paketError) throw paketError;

    const result = await Promise.all((paketList || []).map(async (p) => {
      const { data: anggota } = await supabase
        .from('jamaah_profile')
        .select('saldo, users(nama)')
        .eq('paket_id', p.id)
        .eq('paket_status', 'aktif');

      const anggotaList = anggota || [];
      const terkumpul = anggotaList.reduce((sum, a: any) => sum + (a.saldo || 0), 0);
      const target = p.harga_target || 0;

      return {
        id: p.id,
        nama: p.nama,
        paket_nama: p.nama,
        paket_harga: target,
        anggota_saat_ini: anggotaList.length,
        target_anggota: KAPASITAS_PER_SAPI,
        terkumpul_saldo: terkumpul,
        progress_persen: target > 0 ? Math.min(Math.round((terkumpul / target) * 100), 100) : 0,
        anggota_nama: anggotaList.map((a: any) => (Array.isArray(a.users) ? a.users[0]?.nama : a.users?.nama)).filter(Boolean),
      };
    }));

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

