import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithKakao } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode]       = useState<'login' | 'signup'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPw]     = useState('')
  const [name, setName]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = mode === 'login'
      ? await signInWithEmail(email, password)
      : await signUpWithEmail(email, password, name)
    setLoading(false)
    if (err) { setError(err); return }
    navigate('/simulator')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link to="/" className="text-xl font-bold">
            <span className="text-[#1a3a6b]">SIGnAL</span>
            <span className="text-gray-800"> EDU</span>
          </Link>
          <p className="text-sm text-gray-400 mt-1">AI 대학입시 컨설팅 플랫폼</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {/* 탭 */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                  ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {m === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            )}
            <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
            <input type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={e => setPw(e.target.value)} required minLength={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#1a3a6b] text-white rounded-xl text-sm font-semibold hover:bg-[#152e57] disabled:opacity-60 transition-colors">
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 소셜 로그인 */}
          <button onClick={signInWithKakao}
            className="w-full py-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl text-sm font-semibold hover:bg-[#FDD800] transition-colors">
            카카오로 계속하기
          </button>

          {/* 개발 모드 안내 */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>개발 모드:</strong> Supabase 연결 전에는 로컬 스토리지로 동작해요.<br />
            시뮬레이터는 <Link to="/simulator" className="underline">로그인 없이도</Link> 사용 가능합니다.
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link to="/" className="hover:text-gray-600">← 랜딩 페이지로</Link>
        </p>
      </div>
    </div>
  )
}
