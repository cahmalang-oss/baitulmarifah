import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeCSVField, CSV_BOM } from '@/lib/csv';
import { toXlsxBlob } from '@/lib/xlsx-export';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

function dateRange(searchParams: URLSearchParams) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const dari = searchParams.get('dari');
  const sampai = searchParams.get('sampai');
  const bulan = searchParams.get('bulan');
  const tahun = searchParams.get('tahun');
  return {
    safeDari: dari && dateRegex.test(dari) ? dari : null,
    safeSampai: sampai && dateRegex.test(sampai) ? sampai : null,
    bulan: bulan && /^\d{4}-\d{2}$/.test(bulan) ? bulan : null,
    tahun: tahun || null,
  };
}

function applyDateFilter(query: any, dari: string | null, sampai: string | null, bulan: string | null, tahun: string | null, col = 'tanggal') {
  if (bulan) {
    const [y, m] = bulan.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return query.gte(col, `${bulan}-01`).lte(col, `${bulan}-${String(lastDay).padStart(2, '0')}`);
  }
  if (tahun) {
    query = query.gte(col, `${tahun}-01-01`).lte(col, `${tahun}-12-31`);
  }
  if (dari) query = query.gte(col, dari);
  if (sampai) query = query.lte(col, sampai);
  return query;
}

function buildFilename(jenis: string, dari: string | null, sampai: string | null, bulan: string | null, tahun: string | null) {
  const suffix = bulan ? bulan : tahun ? tahun : (dari && sampai) ? `${dari}-sd-${sampai}` : 'semua';
  return `${jenis}-${suffix}`;
}

type Row = (string | number)[];

function toCSV(headers: string[], rows: Row[]): string {
  const lines = rows.map(r => r.map(sanitizeCSVField).join(','));
  return CSV_BOM + [headers.join(','), ...lines].join('\n');
}

const PAGE_STYLE = `
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 20px; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 10px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #0F172A; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fafb; }
  .total { font-weight: bold; border-top: 2px solid #0F172A; background: #f0f4ff !important; }
  .footer { margin-top: 16px; font-size: 9px; color: #999; text-align: right; }
  @media print { body { padding: 0; } @page { margin: 15mm; } }
`;

function buildHtml(title: string, subtitle: string, thead: string, tbody: string, totalRow = ''): string {
  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>${title}</title><style>${PAGE_STYLE}</style></head><body>
<h1>${title}</h1><div class="meta">${subtitle} &mdash; Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
<table><thead>${thead}</thead><tbody>${tbody}${totalRow}</tbody></table>
<div class="footer">BaitulMarifah</div>
<script>window.onload=function(){window.print();}</script></body></html>`;
}

export async function GET(request: Request) {
  try {
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;

    const { searchParams } = new URL(request.url);
    const jenis = searchParams.get('jenis') || '';
    const format = searchParams.get('format') || 'csv'; // csv | xlsx | pdf
    const { safeDari, safeSampai, bulan, tahun } = dateRange(searchParams);
    const supabase = createAdminClient();

    let headers: string[] = [];
    let rows: Row[] = [];
    let title = '';
    let subtitle = '';
    let totalNominal = 0;

    // ── 1. Infaq Insidentil ────────────────────────────────────────────────
    if (jenis === 'infaq-insidentil') {
      title = 'Laporan Infaq Insidentil (Pemasukan)';
      subtitle = bulan ? `Bulan: ${bulan}` : tahun ? `Tahun: ${tahun}` : (safeDari && safeSampai) ? `${safeDari} s/d ${safeSampai}` : 'Semua Data';
      headers = ['#', 'Tanggal', 'Jenis', 'Nominal (Rp)', 'Sumber', 'Catatan'];
      let q = supabase.from('kas_transaksi').select('tanggal, jenis, nominal, sumber, catatan').eq('kategori', 'infaq_insidentil').order('tanggal', { ascending: false });
      q = applyDateFilter(q, safeDari, safeSampai, bulan, tahun);
      const { data } = await q;
      rows = (data || []).map((t, i) => {
        totalNominal += t.nominal || 0;
        return [i + 1, t.tanggal || '', t.jenis || '', t.nominal || 0, t.sumber || '', t.catatan || ''] as Row;
      });

    // ── 2. Infaq Donatur Tetap ─────────────────────────────────────────────
    } else if (jenis === 'infaq-donatur') {
      title = 'Laporan Infaq Donatur Tetap (Pemasukan)';
      subtitle = bulan ? `Bulan: ${bulan}` : tahun ? `Tahun: ${tahun}` : (safeDari && safeSampai) ? `${safeDari} s/d ${safeSampai}` : 'Semua Data';
      headers = ['#', 'Tanggal', 'Nama Donatur', 'Nominal (Rp)', 'Catatan'];
      let q = supabase.from('kas_transaksi').select('tanggal, nominal, sumber, catatan').eq('kategori', 'infaq_donatur_tetap').order('tanggal', { ascending: false });
      q = applyDateFilter(q, safeDari, safeSampai, bulan, tahun);
      const { data } = await q;
      rows = (data || []).map((t, i) => {
        totalNominal += t.nominal || 0;
        return [i + 1, t.tanggal || '', t.sumber || '', t.nominal || 0, t.catatan || ''] as Row;
      });

    // ── 3. Patungan Kurban ─────────────────────────────────────────────────
    } else if (jenis === 'kurban-patungan') {
      title = 'Laporan Patungan Kurban (Pemasukan Dikonfirmasi)';
      subtitle = bulan ? `Bulan: ${bulan}` : tahun ? `Tahun: ${tahun}` : (safeDari && safeSampai) ? `${safeDari} s/d ${safeSampai}` : 'Semua Data';
      headers = ['#', 'Tanggal Setor', 'Nama Jamaah', 'No WA', 'Grup', 'Jumlah (Rp)', 'Status'];
      let q = supabase
        .from('setoran')
        .select('tanggal_setor, jumlah, status, jamaah_profile(users(nama, no_wa), grup(nama))')
        .eq('kategori', 'kurban')
        .not('jamaah_profile.grup_id', 'is', null)
        .order('tanggal_setor', { ascending: false });
      q = applyDateFilter(q, safeDari, safeSampai, bulan, tahun, 'tanggal_setor');
      const { data } = await q;
      rows = (data || []).filter((s: any) => {
        const jp = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
        return jp?.grup_id !== null && jp?.grup_id !== undefined || jp?.grup;
      }).map((s: any, i) => {
        const jp = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
        const user = jp?.users ? (Array.isArray(jp.users) ? jp.users[0] : jp.users) : null;
        const grup = jp?.grup ? (Array.isArray(jp.grup) ? jp.grup[0] : jp.grup) : null;
        if (s.status === 'dikonfirmasi') totalNominal += s.jumlah || 0;
        return [i + 1, s.tanggal_setor || '', user?.nama || '', user?.no_wa || '', grup?.nama || '', s.jumlah || 0, s.status || ''] as Row;
      });

    // ── 4. Tabungan Kurban ─────────────────────────────────────────────────
    } else if (jenis === 'kurban-tabungan') {
      title = 'Laporan Tabungan Kurban (Pemasukan Dikonfirmasi)';
      subtitle = bulan ? `Bulan: ${bulan}` : tahun ? `Tahun: ${tahun}` : (safeDari && safeSampai) ? `${safeDari} s/d ${safeSampai}` : 'Semua Data';
      headers = ['#', 'Tanggal Setor', 'Nama Jamaah', 'No WA', 'Paket', 'Jumlah (Rp)', 'Status'];
      let q = supabase
        .from('setoran')
        .select('tanggal_setor, jumlah, status, jamaah_profile(users(nama, no_wa), paket(nama), grup_id)')
        .eq('kategori', 'kurban')
        .order('tanggal_setor', { ascending: false });
      q = applyDateFilter(q, safeDari, safeSampai, bulan, tahun, 'tanggal_setor');
      const { data } = await q;
      rows = (data || []).filter((s: any) => {
        const jp = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
        return !jp?.grup_id;
      }).map((s: any, i) => {
        const jp = Array.isArray(s.jamaah_profile) ? s.jamaah_profile[0] : s.jamaah_profile;
        const user = jp?.users ? (Array.isArray(jp.users) ? jp.users[0] : jp.users) : null;
        const paket = jp?.paket ? (Array.isArray(jp.paket) ? jp.paket[0] : jp.paket) : null;
        if (s.status === 'dikonfirmasi') totalNominal += s.jumlah || 0;
        return [i + 1, s.tanggal_setor || '', user?.nama || '', user?.no_wa || '', paket?.nama || '-', s.jumlah || 0, s.status || ''] as Row;
      });

    // ── 5. Pengeluaran Infaq ───────────────────────────────────────────────
    } else if (jenis === 'pengeluaran-infaq') {
      title = 'Laporan Pengeluaran Kas Infaq';
      subtitle = bulan ? `Bulan: ${bulan}` : tahun ? `Tahun: ${tahun}` : (safeDari && safeSampai) ? `${safeDari} s/d ${safeSampai}` : 'Semua Data';
      headers = ['#', 'Tanggal', 'Keperluan', 'Nominal (Rp)', 'Catatan'];
      let q = supabase.from('kas_transaksi').select('tanggal, nominal, sumber, catatan').eq('kategori', 'pengeluaran_infaq').eq('jenis', 'keluar').order('tanggal', { ascending: false });
      q = applyDateFilter(q, safeDari, safeSampai, bulan, tahun);
      const { data } = await q;
      rows = (data || []).map((t, i) => {
        totalNominal += t.nominal || 0;
        return [i + 1, t.tanggal || '', t.sumber || '', t.nominal || 0, t.catatan || ''] as Row;
      });

    // ── 6. Pengeluaran Kurban ──────────────────────────────────────────────
    } else if (jenis === 'pengeluaran-kurban') {
      title = 'Laporan Pengeluaran Kas Kurban';
      subtitle = bulan ? `Bulan: ${bulan}` : tahun ? `Tahun: ${tahun}` : (safeDari && safeSampai) ? `${safeDari} s/d ${safeSampai}` : 'Semua Data';
      headers = ['#', 'Tanggal', 'Keperluan', 'Nominal (Rp)', 'Catatan'];
      let q = supabase.from('kas_transaksi').select('tanggal, nominal, sumber, catatan').eq('kategori', 'pengeluaran_kurban').eq('jenis', 'keluar').order('tanggal', { ascending: false });
      q = applyDateFilter(q, safeDari, safeSampai, bulan, tahun);
      const { data } = await q;
      rows = (data || []).map((t, i) => {
        totalNominal += t.nominal || 0;
        return [i + 1, t.tanggal || '', t.sumber || '', t.nominal || 0, t.catatan || ''] as Row;
      });

    } else {
      return NextResponse.json({ error: 'Parameter jenis tidak valid' }, { status: 400 });
    }

    const filename = buildFilename(jenis, safeDari, safeSampai, bulan, tahun);

    // ── PDF ────────────────────────────────────────────────────────────────
    if (format === 'pdf') {
      const thead = `<tr>${headers.slice(0).map(h => `<th>${h}</th>`).join('')}</tr>`;
      const tbody = rows.map(r =>
        `<tr>${r.map((cell, ci) => `<td>${typeof cell === 'number' && ci > 0 && headers[ci]?.includes('Rp') ? fmt(cell) : cell}</td>`).join('')}</tr>`
      ).join('');
      const totalRow = `<tr class="total"><td colspan="${headers.length - 1}" style="text-align:right">Total</td><td>${fmt(totalNominal)}</td></tr>`;
      const html = buildHtml(title, subtitle, thead, tbody, jenis.includes('kurban-') ? '' : totalRow);
      return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ── Excel ──────────────────────────────────────────────────────────────
    if (format === 'xlsx') {
      const blob = toXlsxBlob(headers, rows);
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
        },
      });
    }

    // ── CSV (default) ──────────────────────────────────────────────────────
    return new NextResponse(toCSV(headers, rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
