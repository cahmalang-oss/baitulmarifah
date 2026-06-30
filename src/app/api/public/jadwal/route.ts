import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];
    const in60Days = new Date();
    in60Days.setDate(in60Days.getDate() + 60);
    const in60DaysStr = in60Days.toISOString().split('T')[0];

    const [kajianResult, imamResult, pengumumanResult] = await Promise.all([
      supabase.from('jadwal_kajian')
        .select('id, judul, pemateri, tanggal, waktu, lokasi, keterangan, mode_tampil, flyer_url, foto_penceramah_url')
        .eq('aktif', true)
        .gte('tanggal', today)
        .order('tanggal', { ascending: true })
        .order('waktu', { ascending: true, nullsFirst: false })
        .limit(5),
      supabase.from('jadwal_imam')
        .select('id, nama_imam, jenis, tanggal, tema_khutbah, keterangan, mode_tampil, flyer_url, foto_imam_url')
        .gte('tanggal', today)
        .order('tanggal', { ascending: true })
        .limit(6),
      supabase.from('pengumuman')
        .select('id, isi, urutan')
        .eq('aktif', true)
        .order('urutan', { ascending: true }),
    ]);

    return NextResponse.json({
      kajian: kajianResult.data || [],
      imam: imamResult.data || [],
      pengumuman: pengumumanResult.data || [],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
