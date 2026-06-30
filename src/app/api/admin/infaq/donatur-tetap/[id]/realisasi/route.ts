import { NextResponse } from 'next/server';
import { requireBendahara } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await requireBendahara();
    if (payload instanceof Response) return payload;

    const formData = await request.formData();
    const bulan = formData.get('bulan')?.toString();
    const nominal_realisasi = formData.get('nominal_realisasi')?.toString();
    const catatan = formData.get('catatan')?.toString() || '';
    const bukti = formData.get('bukti') as File | null;

    if (!bulan || !nominal_realisasi) {
      return NextResponse.json({ error: 'Bulan dan nominal realisasi wajib diisi' }, { status: 400 });
    }
    if (!bukti) {
      return NextResponse.json({ error: 'Bukti transfer wajib diunggah' }, { status: 400 });
    }

    // Konversi "YYYY-MM" ke "YYYY-MM-01" untuk kolom DATE
    const bulanDate = bulan.length === 7 ? bulan + '-01' : bulan;

    const supabase = createAdminClient();

    // Ambil info donatur
    const { data: donatur, error: donaturErr } = await supabase
      .from('infaq_donatur_tetap')
      .select('id, nama_donatur, nominal_komitmen')
      .eq('id', id)
      .single();

    if (donaturErr || !donatur) {
      return NextResponse.json({ error: 'Donatur tidak ditemukan' }, { status: 404 });
    }

    // Upload bukti ke storage
    const fileExt = bukti.name.split('.').pop();
    const filePath = `donatur-${id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('bukti-transfer')
      .upload(filePath, bukti);

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ error: `Gagal mengunggah bukti: ${uploadError.message}` }, { status: 500 });
    }

    const nominal = parseInt(nominal_realisasi);
    const status = nominal >= donatur.nominal_komitmen ? 'lunas' : 'kurang';

    // Cek apakah sudah ada realisasi untuk bulan ini
    const { data: existing } = await supabase
      .from('infaq_donatur_realisasi')
      .select('id')
      .eq('donatur_id', id)
      .eq('bulan', bulanDate)
      .maybeSingle();

    let realisasi, realisasiErr;
    if (existing) {
      const result = await supabase
        .from('infaq_donatur_realisasi')
        .update({ nominal_realisasi: nominal, status, catatan: catatan || null, bukti_url: filePath })
        .eq('id', existing.id)
        .select()
        .single();
      realisasi = result.data;
      realisasiErr = result.error;
    } else {
      const result = await supabase
        .from('infaq_donatur_realisasi')
        .insert({ donatur_id: id, bulan: bulanDate, nominal_realisasi: nominal, status, catatan: catatan || null, bukti_url: filePath })
        .select()
        .single();
      realisasi = result.data;
      realisasiErr = result.error;
    }

    if (realisasiErr) throw realisasiErr;

    // Insert ke kas_transaksi sebagai linked record
    const { error: kasErr } = await supabase
      .from('kas_transaksi')
      .insert({
        jenis: 'masuk',
        kategori: 'infaq_donatur_tetap',
        nominal,
        sumber: donatur.nama_donatur,
        catatan: `Realisasi infaq ${bulan.length === 7 ? bulan : bulan.slice(0, 7)}${catatan ? ' - ' + catatan : ''}`,
        tanggal: new Date().toISOString().split('T')[0],
        input_oleh: payload.id,
        donatur_id: id,
        bukti_url: filePath,
      });

    if (kasErr) console.error('Kas entry error:', kasErr); // Non-fatal

    // Audit log
    await supabase.from('audit_log').insert({
      aksi: 'INPUT_REALISASI_DONATUR',
      entity_type: 'infaq_donatur_realisasi',
      entity_id: realisasi?.id,
      user_id: payload.id,
      detail: { donatur_id: id, bulan: bulanDate, nominal, status }
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
