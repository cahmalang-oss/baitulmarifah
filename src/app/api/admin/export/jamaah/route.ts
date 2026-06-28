import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeCSVField, CSV_BOM } from '@/lib/csv';

export async function GET() {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('jamaah_profile')
      .select('saldo, tanggal_daftar, paket(nama), users(nama, no_wa, email)')
      .order('tanggal_daftar', { ascending: true });
    if (error) throw error;
    const headers = ['Nama Lengkap', 'No WA', 'Email', 'Paket', 'Saldo (Rp)', 'Tanggal Daftar'];
    const rows = (data || []).map(j => {
      const paket = Array.isArray(j.paket) ? j.paket[0] : j.paket;
      const user = Array.isArray(j.users) ? j.users[0] : j.users;
      return [
        sanitizeCSVField(user?.nama || ''),
        sanitizeCSVField(user?.no_wa || ''),
        sanitizeCSVField(user?.email || ''),
        sanitizeCSVField(paket?.nama || ''),
        sanitizeCSVField(j.saldo || 0),
        sanitizeCSVField(j.tanggal_daftar ? new Date(j.tanggal_daftar).toLocaleDateString('id-ID') : ''),
      ].join(',');
    });
    const csv = CSV_BOM + [headers.join(','), ...rows].join('\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jamaah-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
