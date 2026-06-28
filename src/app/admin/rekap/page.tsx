import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-middleware';
import { redirect } from 'next/navigation';
import RekapFormClient from './RekapFormClient';

export default async function AdminRekapPage() {
  const payload = await requireAdmin();
  if (payload instanceof Response) redirect('/login');

  const supabase = createAdminClient();

  // Hitung data aktual dari DB
  const { count: totalJamaah } = await supabase
    .from('jamaah_profile')
    .select('id', { count: 'exact', head: true });

  const { data: setoranDikonfirmasi } = await supabase
    .from('setoran')
    .select('jumlah')
    .eq('status', 'dikonfirmasi');

  const totalDana = setoranDikonfirmasi?.reduce((sum, s) => sum + (s.jumlah || 0), 0) || 0;

  const tahunIni = new Date().getFullYear();
  const { data: existingRekap } = await supabase
    .from('rekap_tahunan')
    .select('*')
    .eq('tahun', tahunIni)
    .maybeSingle();

  const initialData = existingRekap || {
    tahun: tahunIni,
    jumlah_peserta: totalJamaah || 0,
    total_dana: totalDana,
    jumlah_kambing: 0,
    jumlah_sapi: 0,
    wilayah_distribusi: '',
    testimoni: '',
    foto_urls: [] as string[],
    visible: false,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Laporan Rekap Tahunan</h1>
        <p className="text-white/50 text-sm mt-1">Buat dan publikasikan rekapitulasi qurban untuk dibagikan ke publik dan jamaah.</p>
      </div>
      <RekapFormClient initialData={initialData} />
    </div>
  );
}
