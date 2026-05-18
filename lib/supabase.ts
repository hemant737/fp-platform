import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://rsdalmemuupccpjyrilh.supabase.co',
  'PASTE_LEGACY_ANON_PUBLIC_KEY_HERE'
)
