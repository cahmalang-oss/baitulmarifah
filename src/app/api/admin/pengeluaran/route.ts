import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const bulan = searchParams.get('bulan') || '';
    const limit = 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const supabase = createAdminClient();

    let query = supabase
      .from('kas_transaksi')
      .select('id, nominal, sumber, catatan, tanggal', { count: 'exact' })
      .eq('kategori', 'pengeluaran')
      .eq('jenis', 'keluar')
      .order('tanggal', { ascending: false })
      .range(start, end);

    if (bulan) {
      const [year, month] = bulan.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      query = query.gte('tanggal', startDate).lte('tanggal', endDate);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      data,
      meta: { total: count, page, totalPages: Math.ceil((count || 0) / limit) }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const { nominal, sumber, tanggal, catatan } = body;

    if (!nominal || !tanggal) {
      return NextResponse.json({ error: 'Nominal dan tanggal wajib diisi' }, { status: 400 });
    }
    if (nominal <= 0) {
      return NextResponse.json({ error: 'Nominal harus lebih dari 0' }, { status: 400 });
    }
    if (new Date(tanggal) > new Date()) {
      return NextResponse.json({ error: 'Tanggal tidak boleh melebihi hari ini' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('kas_transaksi')
      .insert({
        jenis: 'keluar',
        kategori: 'pengeluaran',
        nominal,
        sumber: sumber || '',
        catatan: catatan || null,
        tanggal,
        input_oleh: payload.id
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      aksi: 'TAMBAH_PENGELUARAN',
      entity_type: 'kas_transaksi',
      entity_id: data.id,
      user_id: payload.id,
      detail: { nominal }
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

