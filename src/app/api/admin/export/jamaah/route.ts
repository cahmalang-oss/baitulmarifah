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
    const format = searchParams.get('format');
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('jamaah_profile')
      .select('saldo, tanggal_daftar, paket(nama), users(nama, no_wa, email)')
      .order('tanggal_daftar', { ascending: true });
    if (error) throw error;
    const headers = ['Nama Lengkap', 'No WA', 'Email', 'Paket', 'Saldo (Rp)', 'Tanggal Daftar'];
    const rawRows = (data || []).map(j => {
      const paket = Array.isArray(j.paket) ? j.paket[0] : j.paket;
      const user = Array.isArray(j.users) ? j.users[0] : j.users;
      return [
        user?.nama || '',
        user?.no_wa || '',
        user?.email || '',
        paket?.nama || '',
        j.saldo || 0,
        j.tanggal_daftar ? new Date(j.tanggal_daftar).toLocaleDateString('id-ID') : '',
      ] as (string | number)[];
    });
    const date = new Date().toISOString().split('T')[0];
    if (format === 'xlsx') {
      const buf = toXlsxBlob(headers, rawRows);
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="jamaah-${date}.xlsx"`,
        },
      });
    }
    const rows = rawRows.map(r => r.map(sanitizeCSVField).join(','));
    const csv = CSV_BOM + [headers.join(','), ...rows].join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jamaah-${date}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
