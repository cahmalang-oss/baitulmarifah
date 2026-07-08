import { NextResponse } from 'next/server';
import { requireHumas } from '@/lib/auth-middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request) {
  try {
    const payload = await requireHumas();
    if (payload instanceof Response) return payload;

    const { hadits_harian, sumber_hadits } = await request.json();

    const supabase = createAdminClient();
    const { error } = await supabase.from('settings').upsert([
      { key: 'hadits_harian', value: hadits_harian || '', updated_at: new Date().toISOString(), updated_by: payload.id },
      { key: 'sumber_hadits', value: sumber_hadits || '', updated_at: new Date().toISOString(), updated_by: payload.id },
    ], { onConflict: 'key' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
