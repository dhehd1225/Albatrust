import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Store,
  Users,
  Timer,
  Wallet,
  Gift,
  KeyRound,
  Copy,
  Check,
  UserPlus,
  LogIn,
  LogOut,
  Trash2,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { API_BASE } from '../lib/api'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h <= 0) return `${m}분`
  return `${h}시간 ${m}분`
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

function formatWorkDays(days) {
  if (!days || days.length === 0) return '-'
  return [...days].sort((a, b) => a - b).map((d) => WEEKDAYS[d]).join(' ')
}

export default function StoreDetail() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [memberForm, setMemberForm] = useState({
    albaName: '',
    hourlyWage: 10320,
    scheduledStart: '09:00',
    scheduledEnd: '18:00',
    workDays: [1, 2, 3, 4, 5],
  })
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState('calendar')
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const loadData = useCallback(() => {
    fetch(`${API_BASE}/api/workplaces/${storeId}`)
      .then(async (res) => {
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.detail || '가게를 불러오지 못했습니다.')
        return payload
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : '불러오기 실패'))
  }, [storeId])

  useEffect(() => {
    loadData()
    const timer = setInterval(loadData, 30000)
    return () => clearInterval(timer)
  }, [loadData])

  const action = (url, options = {}) => {
    setBusy(true)
    setError('')
    return fetch(url, options)
      .then(async (res) => {
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.detail || '처리에 실패했습니다.')
        return payload
      })
      .then((payload) => {
        setData(payload)
        return payload
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '처리에 실패했습니다.')
      })
      .finally(() => setBusy(false))
  }

  const handleAddMember = (e) => {
    e.preventDefault()
    if (!memberForm.albaName.trim()) {
      setError('알바생 이름을 입력해주세요.')
      return
    }
    if (!memberForm.hourlyWage || Number(memberForm.hourlyWage) <= 0) {
      setError('시급을 입력해주세요.')
      return
    }
    if (memberForm.workDays.length === 0) {
      setError('근무 요일을 1개 이상 선택해주세요.')
      return
    }
    action(`${API_BASE}/api/workplaces/${storeId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        albaName: memberForm.albaName.trim(),
        hourlyWage: Number(memberForm.hourlyWage),
        scheduledStart: memberForm.scheduledStart,
        scheduledEnd: memberForm.scheduledEnd,
        workDays: memberForm.workDays,
      }),
    }).then((payload) => {
      if (payload) {
        setMemberForm({
          albaName: '',
          hourlyWage: 10320,
          scheduledStart: '09:00',
          scheduledEnd: '18:00',
          workDays: [1, 2, 3, 4, 5],
        })
      }
    })
  }

  const toggleDay = (day) => {
    setMemberForm((prev) => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter((d) => d !== day)
        : [...prev.workDays, day],
    }))
  }

  const clock = (memberId, type) =>
    action(`${API_BASE}/api/workplaces/${storeId}/members/${memberId}/${type}`, { method: 'POST' })

  const removeMember = (memberId, name) => {
    if (!window.confirm(`${name} 알바생을 가게에서 삭제할까요? 출퇴근 기록도 함께 삭제됩니다.`)) return
    action(`${API_BASE}/api/workplaces/${storeId}/members/${memberId}`, { method: 'DELETE' })
  }

  const deleteStore = () => {
    if (!window.confirm('이 가게를 삭제할까요? 모든 알바생과 출퇴근 기록이 삭제됩니다.')) return
    fetch(`${API_BASE}/api/workplaces/${storeId}`, { method: 'DELETE' })
      .then(() => navigate('/attendance'))
      .catch(() => setError('삭제에 실패했습니다.'))
  }

  const copyInvite = () => {
    if (!data) return
    navigator.clipboard.writeText(data.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shifts = data?.shifts || []
  const members = data?.members || []

  const totalMinutes = members.reduce((sum, m) => sum + m.totalMinutes, 0)
  const totalWage = members.reduce((sum, m) => sum + m.totalWage, 0)
  const totalHolidayPay = members.reduce((sum, m) => sum + m.holidayPay, 0)

  const calendarCells = useMemo(() => {
    const { year, month } = cursor
    const byDay = {}
    shifts.forEach((s) => {
      const d = new Date(s.clockIn)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        const cell = byDay[day] || { minutes: 0, wage: 0, count: 0 }
        cell.minutes += s.workedMinutes
        cell.wage += s.wage
        cell.count += 1
        byDay[day] = cell
      }
    })
    const startWeekday = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < startWeekday; i += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, ...(byDay[day] || { minutes: 0, wage: 0, count: 0 }) })
    }
    return cells
  }, [shifts, cursor])

  const moveMonth = (delta) => {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  if (!data) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">{error || '불러오는 중...'}</p>
        <Link to="/attendance" className="text-sm text-blue mt-3 inline-block">
          ← 내 가게로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      <Link
        to="/attendance"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> 내 가게
      </Link>

      {/* 가게 헤더 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue/10 text-blue flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">{data.name}</h1>
              <p className="text-sm text-gray-400 mt-1">
                사장님 {data.ownerName} · 알바생 {members.length}명
              </p>
            </div>
          </div>
          <button
            onClick={deleteStore}
            className="self-start inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> 가게 삭제
          </button>
        </div>

        <div className="mt-4 bg-bg rounded-xl p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> 초대코드
            </p>
            <p className="text-lg font-bold tracking-widest text-navy">{data.inviteCode}</p>
            <p className="text-xs text-gray-400 mt-1">알바생에게 이 코드를 알려주면 가게에 입장할 수 있어요.</p>
          </div>
          <button
            onClick={copyInvite}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Users className="w-5 h-5 text-blue mb-3" />
          <p className="text-2xl font-bold text-navy">{members.length}명</p>
          <p className="text-sm text-gray-400 mt-1">알바생</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Timer className="w-5 h-5 text-blue mb-3" />
          <p className="text-2xl font-bold text-navy">{formatDuration(totalMinutes)}</p>
          <p className="text-sm text-gray-400 mt-1">총 근무 시간</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Wallet className="w-5 h-5 text-blue mb-3" />
          <p className="text-2xl font-bold text-navy">{formatWon(totalWage)}</p>
          <p className="text-sm text-gray-400 mt-1">총 기본 임금</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <Gift className="w-5 h-5 text-purple-500 mb-3" />
          <p className="text-2xl font-bold text-navy">{formatWon(totalHolidayPay)}</p>
          <p className="text-sm text-gray-400 mt-1">총 주휴수당</p>
        </div>
      </div>

      {/* 알바생 초대 */}
      <form
        onSubmit={handleAddMember}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue" /> 알바생 초대
        </h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">이름</label>
            <input
              type="text"
              placeholder="예: 김알바"
              value={memberForm.albaName}
              onChange={(e) => setMemberForm({ ...memberForm, albaName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">시급 (원)</label>
            <input
              type="number"
              min="0"
              value={memberForm.hourlyWage}
              onChange={(e) => setMemberForm({ ...memberForm, hourlyWage: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">출근</label>
              <input
                type="time"
                value={memberForm.scheduledStart}
                onChange={(e) => setMemberForm({ ...memberForm, scheduledStart: e.target.value })}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">퇴근</label>
              <input
                type="time"
                value={memberForm.scheduledEnd}
                onChange={(e) => setMemberForm({ ...memberForm, scheduledEnd: e.target.value })}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-navy mb-2">근무 요일</label>
          <div className="flex gap-1.5">
            {WEEKDAYS.map((d, i) => {
              const active = memberForm.workDays.includes(i)
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => toggleDay(i)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-blue text-white'
                      : 'bg-bg text-gray-400 hover:bg-gray-100'
                  } ${i === 0 && !active ? 'text-red-400' : ''}`}
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue text-white text-sm font-semibold hover:bg-blue-light transition-colors disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" /> 알바생 초대
        </button>
        {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : null}
      </form>

      {/* 알바생별 출퇴근 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-navy mb-4">알바생 출퇴근</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            아직 초대된 알바생이 없습니다. 위에서 알바생을 초대해보세요.
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-4 ${
                  m.working ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-bg'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-bold text-navy flex items-center gap-2">
                      {m.albaName}
                      {m.working && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                          </span>
                          근무 중
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      시급 {formatWon(m.hourlyWage)} · 예정 {m.scheduledStart}~{m.scheduledEnd} ·{' '}
                      {formatWorkDays(m.workDays)} (주 {m.weeklyHours}h)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      누적 {m.shiftCount}회 · {formatDuration(m.totalMinutes)} · {formatWon(m.totalWage)}
                      {m.holidayEligible && (
                        <span className="ml-2 inline-block text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full font-semibold">
                          주휴 {formatWon(m.holidayPay)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.working ? (
                      <button
                        onClick={() => clock(m.id, 'clock-out')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4" /> 퇴근
                      </button>
                    ) : (
                      <button
                        onClick={() => clock(m.id, 'clock-in')}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue text-white text-sm font-semibold hover:bg-blue-light transition-colors disabled:opacity-50"
                      >
                        <LogIn className="w-4 h-4" /> 출근
                      </button>
                    )}
                    <button
                      onClick={() => removeMember(m.id, m.albaName)}
                      className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="알바생 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 주휴수당 정산 */}
      {members.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-navy mb-1 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" /> 주휴수당 정산
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            소정근로시간(예정 근무) 주 15시간 이상이면 (주 근로시간 ÷ 40 × 8) × 시급으로 자동 지급됩니다.
          </p>
          <div className="space-y-3">
            {members.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border p-4 ${
                  m.holidayEligible ? 'border-purple-100 bg-purple-50/60' : 'border-gray-100 bg-bg'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-navy">{m.albaName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      예정 {m.scheduledStart}~{m.scheduledEnd} · {formatWorkDays(m.workDays)} · 주{' '}
                      {m.weeklyHours}시간 · 시급 {formatWon(m.hourlyWage)}
                    </p>
                  </div>
                  <div className="text-right">
                    {m.holidayEligible ? (
                      <>
                        <span className="inline-block text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full mb-1">
                          주휴수당 대상
                        </span>
                        <p className="text-lg font-bold text-purple-700">{formatWon(m.holidayPay)}</p>
                      </>
                    ) : (
                      <span className="inline-block text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        15시간 미만 · 대상 아님
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 출퇴근 기록: 캘린더 / 목록 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">출퇴근 기록</h2>
          <div className="flex gap-1 bg-bg rounded-xl p-1">
            <button
              onClick={() => setView('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar' ? 'bg-white text-navy shadow-sm' : 'text-gray-400'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> 캘린더
            </button>
            <button
              onClick={() => setView('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white text-navy shadow-sm' : 'text-gray-400'
              }`}
            >
              <List className="w-4 h-4" /> 목록
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => moveMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <p className="font-bold text-navy">
                {cursor.year}년 {cursor.month + 1}월
              </p>
              <button onClick={() => moveMonth(1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div
                  key={d}
                  className={`text-center text-xs font-medium py-1 ${
                    i === 0 ? 'text-red-400' : i === 6 ? 'text-blue' : 'text-gray-400'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (!cell) return <div key={`empty-${idx}`} className="aspect-square" />
                const worked = cell.count > 0
                return (
                  <div
                    key={cell.day}
                    className={`aspect-square rounded-lg border p-1.5 flex flex-col ${
                      worked ? 'border-blue/30 bg-blue/5' : 'border-gray-100'
                    }`}
                  >
                    <span className="text-xs text-gray-500">{cell.day}</span>
                    {worked && (
                      <div className="mt-auto text-right leading-tight">
                        <p className="text-[10px] font-semibold text-navy">{formatDuration(cell.minutes)}</p>
                        <p className="text-[10px] text-blue">{formatWon(cell.wage)}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : shifts.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">아직 출퇴근 기록이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-3 font-medium">알바생</th>
                  <th className="py-2 pr-3 font-medium">출근</th>
                  <th className="py-2 pr-3 font-medium">퇴근</th>
                  <th className="py-2 pr-3 font-medium">근무</th>
                  <th className="py-2 pr-3 font-medium">상태</th>
                  <th className="py-2 pr-3 font-medium text-right">임금</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-3 font-medium text-navy">{s.albaName}</td>
                    <td className="py-3 pr-3 text-gray-500">{formatTime(s.clockIn)}</td>
                    <td className="py-3 pr-3 text-gray-500">
                      {s.ongoing ? (
                        <span className="text-green-600 font-semibold">근무 중</span>
                      ) : (
                        formatTime(s.clockOut)
                      )}
                    </td>
                    <td className="py-3 pr-3 text-gray-600">{formatDuration(s.workedMinutes)}</td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {s.lateMinutes > 0 && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            지각 {s.lateMinutes}분
                          </span>
                        )}
                        {s.earlyLeaveMinutes > 0 && (
                          <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                            조퇴 {s.earlyLeaveMinutes}분
                          </span>
                        )}
                        {!s.ongoing && s.lateMinutes === 0 && s.earlyLeaveMinutes === 0 && (
                          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            정상
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-navy">{formatWon(s.wage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
