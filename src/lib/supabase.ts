import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  ?? ''
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// 환경변수 미설정 시 더미 클라이언트 (로컬 개발용)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

export type AuthUser = {
  id: string
  email: string
  name?: string
}
