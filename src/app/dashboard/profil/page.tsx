import { requireJamaah } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import ProfilForm from './ProfilForm';

export default async function ProfilPage() {
  const payload = await requireJamaah();
  if (payload instanceof Response) {
    redirect('/login');
  }

  const supabase = createAdminClient();

  // Ambil data user
  const { data: user } = await supabase
    .from('users')
    .select('nama, no_wa, alamat')
    .eq('id', payload.id)
    .single();

  if (!user) {
    return <div className="p-6 text-white text-center">User tidak ditemukan.</div>;
  }

  // Ambil data paket
  const { data: profile } = await supabase
    .from('jamaah_profile')
    .select('paket(nama)')
    .eq('user_id', payload.id)
    .single();

  const paketData: any = profile?.paket;
  const paketNama = Array.isArray(paketData) ? paketData[0]?.nama : paketData?.nama;

  const initialData = {
    nama: user.nama,
    alamat: user.alamat,
    no_wa: user.no_wa,
    paket_nama: paketNama
  };

  return (
    <div className="p-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profil Anda</h1>
      </header>

      <ProfilForm initialData={initialData} />
    </div>
  );
}
