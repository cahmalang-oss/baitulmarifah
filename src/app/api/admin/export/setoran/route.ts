import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeCSVField, CSV_BOM } from '@/lib/csv';

export async function GET(request: Request) {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const { searchParams } = new URL(request.url);
    const dari = searchParams.get('dari');
    const sampai = searchParams.get('sampai');
    // Validate date format YYYY-MM-DD
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
    const rows = (data || []).map(s => {
      const jamaahProfile = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
      const jamaahUser = jamaahProfile?.users ? (Array.isArray(jamaahProfile.users) ? jamaahProfile.users[0] : jamaahProfile.users) : null;
      const verif = Array.isArray(s.verified_by_user) ? s.verified_by_user[0] : s.verified_by_user;
      return [
        sanitizeCSVField(s.tanggal_setor),
        sanitizeCSVField(jamaahUser?.nama || ''),
        sanitizeCSVField(jamaahUser?.no_wa || ''),
        sanitizeCSVField(s.jumlah || 0),
        sanitizeCSVField(s.status),
        sanitizeCSVField(s.catatan || ''),
        sanitizeCSVField((verif as any)?.nama || ''),
        sanitizeCSVField(s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : ''),
      ].join(',');
    });
    const filename = safeDari && safeSampai ? `setoran-${safeDari}-sd-${safeSampai}` : `setoran-semua`;
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
