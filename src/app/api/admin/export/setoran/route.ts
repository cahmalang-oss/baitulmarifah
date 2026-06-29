import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeCSVField, CSV_BOM } from '@/lib/csv';
import { toXlsxBuffer } from '@/lib/xlsx-export';

export async function GET(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;
    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari');
    const sampai = searchParams.get('sampai');
    const format = searchParams.get('format');
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const safeDari = dari && dateRegex.test(dari) ? dari : null;
    const safeSampai = sampai && dateRegex.test(sampai) ? sampai : null;
    const supabase = createAdminClient();
    let query = supabase
      .from('setoran')
      .select('tanggal_setor, jumlah, status, catatan, created_at, jamaah_profile(users(nama, no_wa)), verified_by_user:users!setoran_verified_by_fkey(nama)')
      .order('tanggal_setor', { ascending: false });
    if (safeDari) query = query.gte('tanggal_setor', safeDari);
    if (safeSampai) query = query.lte('tanggal_setor', safeSampai);
    const { data, error } = await query;
    if (error) throw error;
    const headers = ['Tanggal Setor', 'Nama Jamaah', 'No WA', 'Jumlah (Rp)', 'Status', 'Catatan', 'Diverifikasi Oleh', 'Tgl Input'];
    const rawRows = (data || []).map(s => {
      const jamaahProfile = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
      const jamaahUser = jamaahProfile?.users ? (Array.isArray(jamaahProfile.users) ? jamaahProfile.users[0] : jamaahProfile.users) : null;
      const verif = Array.isArray(s.verified_by_user) ? s.verified_by_user[0] : s.verified_by_user;
      return [
        s.tanggal_setor || '',
        jamaahUser?.nama || '',
        jamaahUser?.no_wa || '',
        s.jumlah || 0,
        s.status || '',
        s.catatan || '',
        (verif as any)?.nama || '',
        s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : '',
      ] as (string | number)[];
    });
    const filename = safeDari && safeSampai ? `setoran-${safeDari}-sd-${safeSampai}` : `setoran-semua`;
    if (format === 'xlsx') {
      const buf = toXlsxBuffer(headers, rawRows);
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
