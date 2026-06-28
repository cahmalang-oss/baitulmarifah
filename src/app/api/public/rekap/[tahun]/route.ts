import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ tahun: string }> }) {
  try {
    const { tahun } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rekap_tahunan')
      .select('*')
      .eq('tahun', parseInt(tahun))
      .single();
    if (error || !data) return NextResponse.json({ error: 'Rekap tidak ditemukan' }, { status: 404 });
    // Also get mosque name from settings
    const { data: settings } = await supabase.from('settings').select('key, value').eq('key', 'nama_masjid').single();
    return NextResponse.json({ data: { ...data, nama_masjid: settings?.value || 'Masjid Baitul Marifah' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
