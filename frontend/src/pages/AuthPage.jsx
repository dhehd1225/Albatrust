import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, LockKeyhole, Mail, UserRound } from 'lucide-react'

export default function AuthPage({ mode, onAuth }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSignup = mode === 'signup'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'alba',
  })

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const fallbackName = form.email.split('@')[0] || '김민준'
    const nextUser = {
      name: isSignup ? form.name : fallbackName,
      email: form.email,
      role: form.role,
    }

    onAuth(nextUser)
    navigate(location.state?.from || '/career', { replace: true })
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BriefcaseBusiness className="w-7 h-7 text-blue" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">
          {isSignup ? 'AlbaTrust 시작하기' : 'AlbaTrust 로그인'}
        </h1>
        <p className="text-gray-400 text-sm">
          {isSignup
            ? '인증 가능한 아르바이트 경력을 내 스펙으로 관리하세요'
            : '내 경력과 계약서 보관함을 확인하세요'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        {isSignup && (
          <div>
            <label className="block text-sm font-medium text-navy mb-1">이름</label>
            <div className="relative">
              <UserRound className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="예: 김민준"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-navy mb-1">이메일</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">비밀번호</label>
          <div className="relative">
            <LockKeyhole className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">회원 유형</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateForm('role', 'alba')}
              className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                form.role === 'alba'
                  ? 'bg-blue text-white border-blue'
                  : 'bg-bg text-gray-500 border-gray-200 hover:border-blue'
              }`}
            >
              알바생
            </button>
            <button
              type="button"
              onClick={() => updateForm('role', 'boss')}
              className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                form.role === 'boss'
                  ? 'bg-navy text-white border-navy'
                  : 'bg-bg text-gray-500 border-gray-200 hover:border-blue'
              }`}
            >
              사장님
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue text-white font-medium rounded-xl hover:bg-blue-light transition-colors"
        >
          {isSignup ? '회원가입 후 내 경력 보기' : '로그인하고 내 경력 보기'}
        </button>
      </form>

      <div className="text-center mt-5 text-sm text-gray-500">
        {isSignup ? (
          <>
            이미 계정이 있나요?{' '}
            <Link to="/login" className="font-semibold text-blue hover:text-blue-light">
              로그인
            </Link>
          </>
        ) : (
          <>
            처음 이용하시나요?{' '}
            <Link to="/signup" className="font-semibold text-blue hover:text-blue-light">
              회원가입
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
