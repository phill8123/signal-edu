import { Link, useLocation } from 'react-router-dom'
import { STUDENTS } from '../data/db'
import { useStore } from '../hooks/useStore'
import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { studentId, setStudent, saveCurrentStudent } = useStore()
  const { user, signOut } = useAuth()
  const loc = useLocation()

  const nav = (to: string, label: string) => (
    <Link to={to} className={`text-xs px-3 py-1.5 rounded-lg transition-colors
      ${loc.pathname === to
        ? 'bg-gray-100 text-gray-900 font-semibold'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
      {label}
    </Link>
  )

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-2 flex-shrink-0">
      <Link to="/" className="text-base font-bold tracking-tight flex-shrink-0">
        <span className="text-[#1a3a6b]">SIGnAL</span><span className="text-gray-800"> EDU</span>
      </Link>
      <span className="text-gray-200 mx-1">|</span>
      {nav('/simulator', '수시')}
      {nav('/jeongsi',   '정시')}
      {nav('/ai-eval',   'AI 학종')}
      {nav('/interview', '면접')}

      <div className="ml-auto flex items-center gap-2">
        <select value={studentId} onChange={e => setStudent(e.target.value)}
          className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer hidden md:block">
          {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button onClick={saveCurrentStudent}
          className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors">
          저장
        </button>
        <button onClick={() => useStore.getState().clearSelected()}
          className="px-2.5 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors">
          초기화
        </button>
        {user ? (
          <Link to="/mypage"
            className="px-3 py-1.5 border border-gray-300 text-xs text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
            {user.name ?? '마이페이지'}
          </Link>
        ) : (
          <Link to="/login"
            className="px-3 py-1.5 bg-[#1a3a6b] text-white text-xs rounded-lg hover:bg-[#152e57] transition-colors font-semibold">
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
