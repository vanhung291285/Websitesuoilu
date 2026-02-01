
import { createClient } from '@supabase/supabase-js';

// Thông tin kết nối dự án websitesuoilu
const SUPABASE_URL = 'https://xdotyuyulfacajhwfjjc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iaxMQbPkMAwKeeQ6mpKZ5Q_8i3YWZKV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
