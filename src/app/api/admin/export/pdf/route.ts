import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const PAGE_STYLE = `
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 20px; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 10px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0F172A; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer { margin-top: 16px; font-size: 9px; color: #999; text-align: right; }
  @media print {
    body { padding: 0; }
    @page { margin: 15mm; }
  }
`;

export async function GET(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;
    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get('jenis') || 'jamaah'; // jamaah | setoran | infaq
    const dari = searchParams.get('dari');
    const sampai = searchParams.get('sampai');
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun') || new Date().getFullYear().toString();
    const supabase = createAdminClient();

    let title = '';
    let subtitle = '';
    let thead = '';
    let tbody = '';

    if (jenis === 'jamaah') {
      title = 'Laporan Data Jamaah';
      subtitle = `Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`;
      const { data } = await supabase
        .from('jamaah_profile')
        .select('saldo, tanggal_daftar, paket(nama), users(nama, no_wa, email)')
        .order('tanggal_daftar', { ascending: true });
      thead = '<tr><th>#</th><th>Nama</th><th>No WA</th><th>Paket</th><th>Saldo</th><th>Tgl Daftar</th></tr>';
      tbody = (data || []).map((j, i) => {
        const paket = Array.isArray(j.paket) ? j.paket[0] : j.paket;
        const user = Array.isArray(j.users) ? j.users[0] : j.users;
        return `<tr><td>${i + 1}</td><td>${user?.nama || ''}</td><td>${user?.no_wa || ''}</td><td>${paket?.nama || '-'}</td><td>${fmt(j.saldo || 0)}</td><td>${j.tanggal_daftar ? new Date(j.tanggal_daftar).toLocaleDateString('id-ID') : ''}</td></tr>`;
      }).join('');

    } else if (jenis === 'setoran') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const safeDari = dari && dateRegex.test(dari) ? dari : null;
      const safeSampai = sampai && dateRegex.test(sampai) ? sampai : null;
      title = 'Laporan Riwayat Setoran';
      subtitle = safeDari && safeSampai ? `Periode: ${safeDari} s/d ${safeSampai}` : 'Semua Data';
      let query = supabase
        .from('setoran')
        .select('tanggal_setor, jumlah, status, jamaah_profile(users(nama, no_wa)), verified_by_user:users!setoran_verified_by_fkey(nama)')
        .order('tanggal_setor', { ascending: false });
      if (safeDari) query = query.gte('tanggal_setor', safeDari);
      if (safeSampai) query = query.lte('tanggal_setor', safeSampai);
      const { data } = await query;
      thead = '<tr><th>#</th><th>Tanggal</th><th>Nama Jamaah</th><th>No WA</th><th>Jumlah</th><th>Status</th><th>Diverifikasi</th></tr>';
      tbody = (data || []).map((s, i) => {
        const jp = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
        const user = jp?.users ? (Array.isArray(jp.users) ? jp.users[0] : jp.users) : null;
        const verif = Array.isArray(s.verified_by_user) ? s.verified_by_user[0] : s.verified_by_user;
        return `<tr><td>${i + 1}</td><td>${s.tanggal_setor || ''}</td><td>${user?.nama || ''}</td><td>${user?.no_wa || ''}</td><td>${fmt(s.jumlah || 0)}</td><td>${s.status || ''}</td><td>${(verif as any)?.nama || ''}</td></tr>`;
      }).join('');

    } else {
      title = 'Laporan Transaksi Infaq';
      subtitle = bulan ? `Bulan: ${bulan}` : `Tahun: ${tahun}`;
      let query = supabase
        .from('kas_transaksi')
        .select('tanggal, kategori, jenis, nominal, sumber, catatan')
        .ilike('kategori', 'infaq%')
        .order('tanggal', { ascending: false });
      if (bulan && /^\d{4}-\d{2}$/.test(bulan)) {
        const [y, m] = bulan.split('-').map(Number);
        const lastDay = new Date(y, m, 0).getDate();
        query = query.gte('tanggal', `${bulan}-01`).lte('tanggal', `${bulan}-${String(lastDay).padStart(2, '0')}`);
      } else {
        query = query.gte('tanggal', `${tahun}-01-01`).lte('tanggal', `${tahun}-12-31`);
      }
      const { data } = await query;
      thead = '<tr><th>#</th><th>Tanggal</th><th>Kategori</th><th>Jenis</th><th>Nominal</th><th>Sumber</th><th>Catatan</th></tr>';
      tbody = (data || []).map((t, i) =>
        `<tr><td>${i + 1}</td><td>${t.tanggal || ''}</td><td>${t.kategori || ''}</td><td>${t.jenis || ''}</td><td>${fmt(t.nominal || 0)}</td><td>${t.sumber || ''}</td><td>${t.catatan || ''}</td></tr>`
      ).join('');
    }

    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>${title}</title><style>${PAGE_STYLE}</style></head><body>
<h1>${title}</h1>
<div class="meta">${subtitle}</div>
<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>
<div class="footer">BaitulMarifah &mdash; ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
<script>window.onload = function(){ window.print(); }</script>
</body></html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
