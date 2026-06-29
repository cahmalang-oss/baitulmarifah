import { NextResponse } from 'next/server';
import { requireVerifikator } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

type Jenis = 'kajian' | 'imam' | 'pengumuman';
const TABLE: Record<Jenis, string> = {
  kajian: 'jadwal_kajian',
  imam: 'jadwal_imam',
  pengumuman: 'pengumuman',
};

function getJenis(url: string): Jenis | null {
  const j = new URL(url).searchParams.get('jenis');
  return j && j in TABLE ? (j as Jenis) : null;
}

export async function GET(request: Request) {
  try {
    const payload = await requireVerifikator();
    if (payload instanceof Response) return payload;
    const jenis = getJenis(request.url);
    if (!jenis) return NextResponse.json({ error: 'Parameter jenis wajib (kajian|imam|pengumuman)' }, { status: 400 });
    const supabase = createAdminClient();
    let query = supabase.from(TABLE[jenis]).select('*');
    if (jenis === 'kajian') query = query.order('tanggal', { ascending: false });
    else if (jenis === 'imam') query = query.order('tanggal', { ascending: false });
    else query = query.order('urutan', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireVerifikator();
    if (payload instanceof Response) return payload;
    const jenis = getJenis(request.url);
    if (!jenis) return NextResponse.json({ error: 'Parameter jenis wajib' }, { status: 400 });
    const body = await request.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE[jenis]).insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await requireVerifikator();
    if (payload instanceof Response) return payload;
    const jenis = getJenis(request.url);
    if (!jenis) return NextResponse.json({ error: 'Parameter jenis wajib' }, { status: 400 });
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE[jenis]).update(fields).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await requireVerifikator();
    if (payload instanceof Response) return payload;
    const jenis = getJenis(request.url);
    if (!jenis) return NextResponse.json({ error: 'Parameter jenis wajib' }, { status: 400 });
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });
    const supabase = createAdminClient();
    const { error } = await supabase.from(TABLE[jenis]).delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
