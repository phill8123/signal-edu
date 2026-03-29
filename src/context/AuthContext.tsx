import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, type AuthUser } from '../lib/supabase'

interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<string | null>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<string | null>
  signInWithKakao: () => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user
      if (u) setUser({ id: u.id, email: u.email ?? '', name: u.user_metadata?.name })
      setLoading(false)
    })

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user
      setUser(u ? { id: u.id, email: u.email ?? '', name: u.user_metadata?.name } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email: string, password: string) {
    if (!supabase) return '개발 모드: Supabase 미연결'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    if (!supabase) return '개발 모드: Supabase 미연결'
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } }
    })
    return error ? error.message : null
  }

  async function signInWithKakao() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  async function signOut() {
    if (!supabase) { setUser(null); return }
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithKakao, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
