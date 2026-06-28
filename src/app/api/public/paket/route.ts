import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('paket')
      .select('id, nama, jenis, harga_target, deskripsi')
      .eq('status', 'aktif')
      .order('harga_target', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
