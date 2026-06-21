import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Copy, Check, ExternalLink, QrCode, Smartphone } from 'lucide-react'

import { API_BASE } from '../lib/api'

export default function InterviewCreate() {
  const [form, setForm] = useState({
    storeName: '',
    albaName: '',
    date: '',
    time: '',
    location: '',
    notes: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    fetch(`${API_BASE}/api/interviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        const payload = await res.json()
        if (!res.ok) {
          throw new Error(payload?.detail || '면접 생성에 실패했습니다.')
        }
        setResult(payload)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : '면접 생성에 실패했습니다.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const interviewLink = result
    ? `${window.location.origin}/interview/${result.id}`
    : ''
  const qrScanLink = result ? `${window.location.origin}/scan/${result.qrToken}` : ''
  const nfcScanLink = result ? `${window.location.origin}/scan/${result.nfcToken}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(interviewLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-navy mb-2">면접 링크가 생성되었습니다!</h2>
          <p className="text-gray-500 text-sm mb-6">
            아래 링크를 <strong>{result.albaName}</strong>님에게 전달해주세요.
          </p>

          <div className="bg-bg rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-400 mb-1">면접 확정 링크</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-blue flex-1 break-all">{interviewLink}</code>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="bg-bg rounded-xl p-4 mb-6 space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <QrCode className="w-3 h-3" /> QR 스캔 링크
              </p>
              <code className="text-sm text-blue break-all">{qrScanLink}</code>
              <p className="text-xs text-gray-400 mt-1">QR 스티커나 배너에 넣을 링크입니다.</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> NFC 스티커 링크
              </p>
              <code className="text-sm text-blue break-all">{nfcScanLink}</code>
              <p className="text-xs text-gray-400 mt-1">NFC 태그 URL로 연동됩니다.</p>
            </div>
          </div>

          <div className="bg-bg rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">매장명</span>
              <span className="font-medium text-navy">{result.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">알바생</span>
              <span className="font-medium text-navy">{result.albaName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">날짜</span>
              <span className="font-medium text-navy">{result.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">시간</span>
              <span className="font-medium text-navy">{result.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">장소</span>
              <span className="font-medium text-navy">{result.location}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setResult(null); setForm({ storeName: '', albaName: '', date: '', time: '', location: '', notes: '' }) }}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              새로 만들기
            </button>
            <Link
              to={`/interview/${result.id}`}
              className="flex-1 py-3 rounded-xl bg-blue text-white text-sm font-medium hover:bg-blue-light transition-colors flex items-center justify-center gap-1"
            >
              미리보기 <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={() => { navigator.clipboard.writeText(qrScanLink) }}
              className="flex-1 py-3 rounded-xl border border-blue text-blue text-sm font-medium hover:bg-blue/5 transition-colors"
            >
              QR 링크 복사
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-navy mb-1">면접 일정 만들기</h1>
        <p className="text-gray-400 text-sm">알바생에게 보낼 면접 확정 링크를 생성합니다</p>
      </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">매장명</label>
          <input
            type="text"
            required
            placeholder="예: 스타벅스 강남점"
            value={form.storeName}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">알바생 이름</label>
          <input
            type="text"
            required
            placeholder="예: 김민준"
            value={form.albaName}
            onChange={(e) => setForm({ ...form, albaName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">면접 날짜</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">면접 시간</label>
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">면접 장소</label>
          <input
            type="text"
            required
            placeholder="예: 매장 내 / 강남역 3번 출구 카페"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">메모 (선택)</label>
          <textarea
            placeholder="알바생에게 전달할 메모를 입력하세요"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue text-white font-medium rounded-xl hover:bg-blue-light transition-colors disabled:opacity-50"
        >
          {loading ? '생성 중...' : '면접 링크 생성하기'}
        </button>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </form>
    </div>
  )
}
