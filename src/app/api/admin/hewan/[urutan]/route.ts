import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request, { params }: { params: Promise<{ urutan: string }> }) {
  try {
    const { urutan } = await params;
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const formData = await request.formData();
    const label = formData.get('label') as string;
    const deskripsi = formData.get('deskripsi') as string;
    const jadikanAktif = formData.get('aktif') === 'true';
    const supabase = createAdminClient();
    // If setting aktif, reset semua fase dulu
    if (jadikanAktif) {
      await supabase.from('hewan_fase').update({ aktif: false }).neq('urutan', -1);
    }
    const updateData: any = { label, deskripsi, aktif: jadikanAktif };
    // Handle foto upload
    const fotoFile = formData.get('foto') as File | null;
    if (fotoFile && fotoFile.size > 0) {
      const fileName = `hewan-fase-${urutan}-${Date.now()}.${fotoFile.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dokumentasi')
        .upload(fileName, fotoFile, { upsert: true });
      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage.from('dokumentasi').getPublicUrl(fileName);
        updateData.foto_url = publicUrl;
      }
    }
    const { error } = await supabase.from('hewan_fase').update(updateData).eq('urutan', parseInt(urutan));
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
