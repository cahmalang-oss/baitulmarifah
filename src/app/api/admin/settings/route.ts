import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');
    if (error) throw error;

    // Flatten key-value to object
    const settings: Record<string, string> = {};
    (data || []).forEach(row => { settings[row.key] = row.value; });

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await requireAdmin();
    if (payload instanceof Response) return payload;

    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Body harus berupa object settings' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Upsert each key
    const upserts = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
      updated_by: payload.id,
    }));

    const { error } = await supabase
      .from('settings')
      .upsert(upserts, { onConflict: 'key' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
