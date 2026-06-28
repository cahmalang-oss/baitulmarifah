import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Public endpoint: tampilkan info rekening + kontak untuk jamaah
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['nama_masjid', 'no_rekening_bsi', 'nama_rekening', 'info_qris', 'no_wa_pengurus']);
    if (error) throw error;

    const settings: Record<string, string> = {};
    (data || []).forEach(row => { settings[row.key] = row.value; });

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
