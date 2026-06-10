import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Send } from 'lucide-react'

const emptyForm = {
  storeName: '',
  role: '',
  startDate: '',
  endDate: '',
  managerContact: '',
  memo: '',
}

export default function CareerRequest() {
  const [form, setForm] = useState(emptyForm)
  const [submitted, setSubmitted] = useState(false)

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-navy mb-2">인증 요청이 준비되었습니다</h1>
          <p className="text-sm text-gray-500 mb-6">
            {form.storeName} · {form.role}
          </p>

          <div className="bg-bg rounded-xl p-4 text-left text-sm space-y-2 mb-6">
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">근무 기간</span>
              <span className="font-medium text-navy text-right">
                {form.startDate} ~ {form.endDate || '현재'}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">인증 담당자</span>
              <span className="font-medium text-navy text-right">{form.managerContact}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSubmitted(false)
                setForm(emptyForm)
              }}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              새 요청
            </button>
            <Link
              to="/career"
              className="flex-1 py-3 rounded-xl bg-blue text-white text-sm font-medium hover:bg-blue-light transition-colors"
            >
              내 경력으로
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-navy mb-1">경력 인증 요청</h1>
        <p className="text-gray-400 text-sm">근무 이력을 인증 가능한 경력으로 등록합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">근무처</label>
          <input
            type="text"
            required
            placeholder="예: CU 역삼점"
            value={form.storeName}
            onChange={(event) => updateForm('storeName', event.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">직무</label>
          <input
            type="text"
            required
            placeholder="예: 편의점 스태프 / 사무보조"
            value={form.role}
            onChange={(event) => updateForm('role', event.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">시작일</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(event) => updateForm('startDate', event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">종료일</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => updateForm('endDate', event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">인증 담당자 연락처</label>
          <input
            type="text"
            required
            placeholder="예: 점장님 휴대폰 또는 이메일"
            value={form.managerContact}
            onChange={(event) => updateForm('managerContact', event.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-1">담당 업무</label>
          <textarea
            placeholder="예: 계산, 재고 정리, 정산 보조"
            value={form.memo}
            onChange={(event) => updateForm('memo', event.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none text-sm transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue text-white font-medium rounded-xl hover:bg-blue-light transition-colors flex items-center justify-center gap-2"
        >
          인증 요청 보내기
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
