import { NextResponse } from 'next/server';
import { requireJamaah } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPin, verifyPin } from '@/lib/auth';

export async function GET() {
  try {
    const payload = await requireJamaah();
    if (payload instanceof Response) return payload;

    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from('jamaah_profile')
      .select('id, paket_id, saldo, paket_status, paket(nama, jenis, harga_target, deskripsi)')
      .eq('user_id', payload.id)
      .single();

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await requireJamaah();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    const supabase = createAdminClient();

    if (body.action === 'update_profil') {
      const { nama, alamat } = body;
      if (!nama || !alamat) {
        return NextResponse.json({ error: 'Nama dan alamat wajib diisi' }, { status: 400 });
      }

      const { error } = await supabase
        .from('users')
        .update({ nama, alamat })
        .eq('id', payload.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (body.action === 'update_pin') {
      const { oldPin, newPin, newPinConfirm } = body;
      
      if (!oldPin || !newPin || newPin !== newPinConfirm || newPin.length !== 6) {
        return NextResponse.json({ error: 'Data PIN tidak valid' }, { status: 400 });
      }

      // Validasi PIN lama
      const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', payload.id)
        .single();

      if (!user || !user.password_hash) {
        return NextResponse.json({ error: 'User tidak valid' }, { status: 400 });
      }

      const isValid = await verifyPin(oldPin, user.password_hash);
      if (!isValid) {
        return NextResponse.json({ error: 'PIN saat ini salah' }, { status: 401 });
      }

      // Hash dan update PIN baru
      const hashedPin = await hashPin(newPin);
      const { error } = await supabase
        .from('users')
        .update({ password_hash: hashedPin })
        .eq('id', payload.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 });

  } catch (error: any) {
    console.error('Profil update error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
