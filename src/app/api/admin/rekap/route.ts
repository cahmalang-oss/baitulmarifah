import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const body = await request.json();
    const { tahun, jumlah_peserta, total_dana, jumlah_sapi, jumlah_kambing, wilayah_distribusi, testimoni, foto_urls, visible } = body;
    if (!tahun) return NextResponse.json({ error: 'Tahun wajib diisi' }, { status: 400 });
    const safeFotoUrls = Array.isArray(foto_urls) ? foto_urls.filter((u: any) => typeof u === 'string') : [];
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rekap_tahunan')
      .upsert({ tahun: parseInt(tahun), jumlah_peserta: parseInt(jumlah_peserta) || 0, total_dana: parseInt(total_dana) || 0, jumlah_sapi: parseInt(jumlah_sapi) || 0, jumlah_kambing: parseInt(jumlah_kambing) || 0, wilayah_distribusi: wilayah_distribusi || '', testimoni: testimoni || '', foto_urls: safeFotoUrls, visible: !!visible, updated_at: new Date().toISOString() }, { onConflict: 'tahun' })
      .select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
