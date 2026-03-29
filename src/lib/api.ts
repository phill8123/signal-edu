const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function getToken(): string | null {
  return localStorage.getItem('signal_token')
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? '요청 실패')
  }
  return res.json()
}

// ── Auth ──────────────────────────────────
export const api = {
  auth: {
    signup:  (email: string, password: string, name: string) =>
      req<{ access_token: string; user_id: number; name: string; is_pro: boolean }>(
        'POST', '/auth/signup', { email, password, name }
      ),
    login: (email: string, password: string) =>
      req<{ access_token: string; user_id: number; name: string; is_pro: boolean }>(
        'POST', '/auth/login', { email, password }
      ),
    me: () => req<{ id: number; email: string; name: string; is_pro: boolean }>('GET', '/auth/me'),
  },

  // ── Students ────────────────────────────
  students: {
    list:   () => req<StudentOut[]>('GET', '/students/'),
    create: (name: string, gradeType: string, myGrade: number) =>
      req<StudentOut>('POST', '/students/', { name, grade_type: gradeType, my_grade: myGrade }),
    update: (id: number, data: Partial<StudentOut>) =>
      req<StudentOut>('PATCH', `/students/${id}`, data),
    delete: (id: number) => req<void>('DELETE', `/students/${id}`),
  },

  // ── Majors ──────────────────────────────
  majors: {
    list: (params?: { univ?: string[]; jt?: string[]; year?: number }) => {
      const q = new URLSearchParams()
      params?.univ?.forEach(u => q.append('univ', u))
      params?.jt?.forEach(j => q.append('jt', j))
      if (params?.year) q.set('year', String(params.year))
      return req<MajorOut[]>('GET', `/majors/?${q}`)
    },
    get: (id: string) => req<MajorDetailOut>('GET', `/majors/${id}`),
  },

  // ── AI 평가 ─────────────────────────────
  aiEval: {
    evaluate: (inputText: string, targetMajor?: string, studentId?: number) =>
      req<AiEvalOut>('POST', '/ai-eval/', { input_text: inputText, target_major: targetMajor, student_id: studentId }),
    history: () => req<AiEvalOut[]>('GET', '/ai-eval/history'),
  },
  // ── Payments ────────────────────────────
  payments: {
    confirm: (paymentKey: string, orderId: string, amount: number, plan: string) =>
      req<{ success: boolean; plan: string; message: string }>(
        'POST', '/payments/confirm', { paymentKey, orderId, amount, plan }
      ),
    history: () => req<{ id: number; plan: string; amount: number; status: string; created_at: string }[]>(
      'GET', '/payments/history'
    ),
  },
}

// ── 타입 ──────────────────────────────────
export interface StudentOut {
  id: number; name: string; grade_type: string; my_grade: number; selected_ids: string[]
}
export interface MajorOut {
  id: string; univ: string; jt: string; jeon: string; major: string
  gye: string; cat: string; 경쟁률: number; g50: number | null; g70: number | null
}
export interface MajorDetailOut extends MajorOut {
  year_details: { yr: number; 모집: number; 충원: number; 경쟁률: number; g50: number | null; g70: number | null; 환산50: number | null; 환산70: number | null }[]
}
export interface AiEvalResult {
  academic: number; career: number; community: number; growth: number; total: number
  summary: string; strengths: string[]; improvements: string[]; recommended_majors: string[]
}
export interface AiEvalOut {
  id: number; result: AiEvalResult; created_at: string
}

// ── Payments ─────────────────────────────
// (api 객체에 payments 추가)
