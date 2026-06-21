import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, PlusCircle, Users, KeyRound, ChevronRight } from 'lucide-react'

import { API_BASE } from '../lib/api'

export default function StoreManager({ user }) {
  const ownerName = user?.name || ''
  const [stores, setStores] = useState([])
  const [form, setForm] = useState({ name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadStores = useCallback(() => {
    if (!ownerName) return
    fetch(`${API_BASE}/api/workplaces?owner=${encodeURIComponent(ownerName)}`)
      .then((res) => res.json())
      .then((list) => setStores(Array.isArray(list) ? list : []))
      .catch(() => setError('가게 목록을 불러오지 못했습니다.'))
  }, [ownerName])

  useEffect(() => {
    loadStores()
  }, [loadStores])

  const handleCreate = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('가게 이름을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    fetch(`${API_BASE}/api/workplaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name.trim(), ownerName }),
    })
      .then(async (res) => {
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.detail || '가게 생성에 실패했습니다.')
        return payload
      })
      .then(() => {
        setForm({ name: '' })
        loadStores()
      })
      .catch((err) => setError(err instanceof Error ? err.message : '가게 생성에 실패했습니다.'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="py-8 space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue mb-2">Workplace</p>
        <h1 className="text-3xl font-bold text-navy">내 가게</h1>
        <p className="text-gray-500 mt-2">
          가게를 만들고 알바생을 초대하면, 가게 안에서 출퇴근 · 임금 · 주휴수당이 관리됩니다.
        </p>
      </div>

      {/* 가게 만들기 */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue" /> 가게 만들기
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-navy mb-1">가게 이름</label>
          <input
            type="text"
            placeholder="예: 메가커피 서울대점"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue text-white text-sm font-semibold hover:bg-blue-light transition-colors disabled:opacity-50"
        >
          <Store className="w-4 h-4" /> {loading ? '생성 중...' : '가게 생성'}
        </button>
        <p className="text-xs text-gray-400 mt-3">
          사장님: <strong>{ownerName || '로그인 필요'}</strong> · 시급은 알바생을 초대할 때 한 명씩
          설정합니다. (2026년 최저시급 10,320원)
        </p>
        {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
      </form>

      {/* 가게 목록 */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-4">내가 만든 가게 ({stores.length})</h2>
        {stores.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
            <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">아직 만든 가게가 없습니다. 위에서 가게를 만들어보세요.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {stores.map((s) => (
              <Link
                key={s.id}
                to={`/attendance/${s.id}`}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-blue/10 text-blue flex items-center justify-center mb-4">
                    <Store className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-navy group-hover:text-blue transition-colors">
                  {s.name}
                </h3>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> 알바생 {s.memberCount}명
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> {s.inviteCode}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
