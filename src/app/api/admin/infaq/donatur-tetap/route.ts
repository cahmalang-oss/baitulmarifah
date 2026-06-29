import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const bulan = searchParams.get('bulan') || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const supabase = createAdminClient();

    // Ambil semua donatur tetap aktif
    const { data: donaturList, error } = await supabase
      .from('infaq_donatur_tetap')
      .select('id, nama_donatur, no_wa, nominal_komitmen, metode_bayar, mulai_bulan, aktif')
      .eq('aktif', true)
      .order('nama_donatur', { ascending: true });

    if (error) throw error;

    // Ambil realisasi bulan yang diminta
    const { data: realisasiList } = await supabase
      .from('infaq_donatur_realisasi')
      .select('donatur_id, nominal_realisasi')
      .eq('bulan', bulan);

    const realisasiMap = new Map(realisasiList?.map(r => [r.donatur_id, r.nominal_realisasi]) || []);

    // Gabungkan status
    const result = (donaturList || []).map(d => {
      const realisasi = realisasiMap.get(d.id) || 0;
      let status: 'lunas' | 'kurang' | 'belum';
      if (realisasi === 0) status = 'belum';
      else if (realisasi >= d.nominal_komitmen) status = 'lunas';
      else status = 'kurang';

      return { ...d, realisasi_bulan_ini: realisasi, status };
    });

    return NextResponse.json({ data: result, bulan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const { nama_donatur, no_wa, nominal_komitmen, metode_bayar, mulai_bulan, keterangan } = body;

    if (!nama_donatur || !nominal_komitmen || !mulai_bulan) {
      return NextResponse.json({ error: 'Nama, nominal komitmen, dan mulai bulan wajib diisi' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('infaq_donatur_tetap')
      .insert({
        nama_donatur,
        no_wa: no_wa || null,
        nominal_komitmen: parseInt(nominal_komitmen),
        metode_bayar: metode_bayar || 'tunai',
        mulai_bulan,
        keterangan: keterangan || null,
        aktif: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

