import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://rsdalmemuupccpjyrilh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZGFsbWVtdXVwY2NwanlyaWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgyMjgsImV4cCI6MjA5NDY5NDIyOH0.d94wtfUQgmDehk-3Da9E7zvoARZiWNSOl4ypgoDRueI'
)
