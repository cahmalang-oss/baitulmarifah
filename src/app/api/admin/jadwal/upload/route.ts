import { NextResponse } from 'next/server';
import { requireHumas } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const payload = await requireHumas();
    if (payload instanceof Response) return payload;

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const folder = (form.get('folder') as string) || 'misc';

    if (!file) return NextResponse.json({ error: 'File wajib diupload' }, { status: 400 });

    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = createAdminClient();
    const { error } = await supabase.storage.from('jadwal-files').upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('jadwal-files').getPublicUrl(fileName);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
