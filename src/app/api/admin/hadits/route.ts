import { NextResponse } from 'next/server';
import { requireHumas } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

// Daftar hadits/ayat harian — bisa banyak, TV menampilkan acak.
export async function GET() {
  try {
    const payload = await requireHumas();
    if (payload instanceof Response) return payload;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('hadits')
      .select('id, teks, sumber, aktif, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireHumas();
    if (payload instanceof Response) return payload;
    const { teks, sumber } = await request.json();
    if (!teks || !teks.trim()) return NextResponse.json({ error: 'Teks hadits wajib diisi' }, { status: 400 });
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('hadits')
      .insert({ teks: teks.trim(), sumber: (sumber || '').trim(), aktif: true })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await requireHumas();
    if (payload instanceof Response) return payload;
    const { id, ...fields } = await request.json();
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('hadits').update(fields).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await requireHumas();
    if (payload instanceof Response) return payload;
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });
    const supabase = createAdminClient();
    const { error } = await supabase.from('hadits').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
