import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeCSVField, CSV_BOM } from '@/lib/csv';
import { toXlsxBlob } from '@/lib/xlsx-export';

export async function GET(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get('tahun') || new Date().getFullYear().toString();
    const bulan = searchParams.get('bulan');
    const format = searchParams.get('format');
    const supabase = createAdminClient();
    let query = supabase
      .from('kas_transaksi')
      .select('tanggal, kategori, jenis, nominal, sumber, catatan, created_at')
      .ilike('kategori', 'infaq%')
      .order('tanggal', { ascending: false });
    if (bulan && /^\d{4}-\d{2}$/.test(bulan)) {
      const [y, m] = bulan.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      query = query.gte('tanggal', `${bulan}-01`).lte('tanggal', `${bulan}-${String(lastDay).padStart(2, '0')}`);
    } else {
      query = query.gte('tanggal', `${tahun}-01-01`).lte('tanggal', `${tahun}-12-31`);
    }
    const { data, error } = await query;
    if (error) throw error;
    const headers = ['Tanggal', 'Kategori', 'Jenis', 'Nominal (Rp)', 'Sumber', 'Catatan', 'Tgl Input'];
    const rawRows = (data || []).map(t => [
      t.tanggal || '',
      t.kategori || '',
      t.jenis || '',
      t.nominal || 0,
      t.sumber || '',
      t.catatan || '',
      t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '',
    ] as (string | number)[]);
    const filename = bulan ? `infaq-${bulan}` : `infaq-${tahun}`;
    if (format === 'xlsx') {
      const buf = toXlsxBlob(headers, rawRows);
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    }
    const rows = rawRows.map(r => r.map(sanitizeCSVField).join(','));
    const csv = CSV_BOM + [headers.join(','), ...rows].join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
