import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LandingPage      from './pages/LandingPage'
import LoginPage        from './pages/LoginPage'
import SimulatorPage    from './pages/SimulatorPage'
import JeongsiPage      from './pages/JeongsiPage'
import AiEvalPage       from './pages/AiEvalPage'
import InterviewPage    from './pages/InterviewPage'
import MyPage           from './pages/mypage/MyPage'
import PaymentPage      from './pages/PaymentPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<LandingPage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/simulator"     element={<SimulatorPage />} />
          <Route path="/jeongsi"       element={<JeongsiPage />} />
          <Route path="/ai-eval"       element={<AiEvalPage />} />
          <Route path="/interview"     element={<InterviewPage />} />
          <Route path="/mypage"        element={<MyPage />} />
          <Route path="/payment"       element={<PaymentPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*"              element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
