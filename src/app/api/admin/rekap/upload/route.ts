import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;
    const formData = await request.formData();
    const foto = formData.get('foto') as File | null;
    if (!foto || foto.size === 0) return NextResponse.json({ error: 'File foto wajib diunggah' }, { status: 400 });
    if (foto.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Ukuran foto maksimal 5MB' }, { status: 400 });
    const supabase = createAdminClient();
    const ext = foto.name.split('.').pop();
    const fileName = `rekap/foto-${Date.now()}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('dokumentasi')
      .upload(fileName, foto, { upsert: true, contentType: foto.type });
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('dokumentasi').getPublicUrl(fileName);
    return NextResponse.json({ success: true, key: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
