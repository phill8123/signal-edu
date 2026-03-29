import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!supabase) { navigate('/simulator'); return }
    supabase.auth.getSession().then(({ data }) => {
      navigate(data.session ? '/simulator' : '/login')
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      로그인 처리 중...
    </div>
  )
}
