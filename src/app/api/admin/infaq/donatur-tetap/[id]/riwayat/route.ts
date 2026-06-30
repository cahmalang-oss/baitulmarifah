import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/admin/infaq/donatur-tetap/[id]/riwayat — riwayat realisasi per donatur
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('infaq_donatur_realisasi')
      .select('id, bulan, nominal_realisasi, catatan, bukti_url, created_at')
      .eq('donatur_id', id)
      .order('bulan', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
