import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const supabase = createAdminClient();

    const { data, count, error } = await supabase
      .from('setoran')
      .select(`
        id, jumlah, tanggal_setor, status, bukti_url, kategori,
        jamaah_profile (
          user_id,
          users (nama, no_wa)
        )
      `, { count: 'exact' })
      .eq('status', 'pending')
      .order('tanggal_setor', { ascending: true })
      .range(start, end);

    if (error) throw error;

    const formattedData = data.map((item: any) => ({
      id: item.id,
      jumlah: item.jumlah,
      tanggal_setor: item.tanggal_setor,
      status: item.status,
      bukti_url: item.bukti_url,
      kategori: item.kategori || 'kurban',
      peserta: {
        nama: item.jamaah_profile?.users?.nama || 'Unknown',
        no_wa: item.jamaah_profile?.users?.no_wa || ''
      }
    }));

    return NextResponse.json({
      data: formattedData,
      meta: {
        total: count,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error: any) {
    console.error('Fetch setoran error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 });
  }
}

