import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Calendar, Clock, FileText, CheckCircle2, UserCheck, Store, QrCode, Smartphone } from 'lucide-react'

const API_BASE = 'http://localhost:8000'

export default function InterviewView() {
  const { id } = useParams()
  const [tab, setTab] = useState('alba')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interview, setInterview] = useState(null)

  const loadInterview = async () => {
    const res = await fetch(`${API_BASE}/api/interviews/${id}`)
    const payload = await res.json()

    if (!res.ok) {
      throw new Error(payload?.detail || '면접 정보를 불러오지 못했습니다.')
    }

    setInterview(payload)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError('')

      try {
        await loadInterview()
      } catch (err) {
        setError(err instanceof Error ? err.message : '면접 정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [id])

  const confirmInterview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/interviews/${id}/confirm`, {
        method: 'PUT',
      })
      const payload = await res.json()

      if (!res.ok) {
        throw new Error(payload?.detail || '면접 확정 처리에 실패했습니다.')
      }

      setInterview(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : '면접 확정 처리에 실패했습니다.')
    }
  }

  const submitAttendance = async (present) => {
    try {
      const res = await fetch(`${API_BASE}/api/interviews/${id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          present,
          method: 'manual',
        }),
      })

      const payload = await res.json()

      if (!res.ok) {
        throw new Error(payload?.detail || '출석 기록 처리에 실패했습니다.')
      }

      setInterview(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : '출석 기록 처리에 실패했습니다.')
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 py-12">면접 정보를 불러오는 중입니다...</p>
  }

  if (!interview) {
    return (
      <p className="text-center text-gray-500 py-12">{error || '면접 정보를 찾을 수 없습니다.'}</p>
    )
  }

  const confirmed = Boolean(interview.confirmed)
  const attended = interview.attendance?.present
  const qrScanLink = `${window.location.origin}/scan/${interview.qrToken}`
  const nfcScanLink = `${window.location.origin}/scan/${interview.nfcToken}`
  const attendanceHistory = interview.attendanceHistory || []
  const methodLabel = (method) => {
    if (method === 'qr') return 'QR 스캔'
    if (method === 'nfc') return 'NFC 스캔'
    if (method === 'manual') return '수동 입력'
    return '기타'
  }

  const infoCards = (
    <div className="space-y-4 mb-6">
      <div className="flex items-start gap-3 p-4 bg-bg rounded-xl">
        <Calendar className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">면접 날짜</p>
          <p className="font-medium text-navy">{interview.date}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 bg-bg rounded-xl">
        <Clock className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">면접 시간</p>
          <p className="font-medium text-navy">{interview.time}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 bg-bg rounded-xl">
        <MapPin className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">면접 장소</p>
          <p className="font-medium text-navy">{interview.location}</p>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 bg-bg rounded-xl">
        <FileText className="w-5 h-5 text-blue mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-400">메모</p>
          <p className="font-medium text-navy">{interview.notes}</p>
        </div>
      </div>
    </div>
  )

  const attendanceHistorySection = (
    <div className="bg-bg rounded-xl p-4 space-y-3 mb-6">
      <p className="text-sm font-semibold text-navy">출근(출석) 이력</p>
      {attendanceHistory.length === 0 ? (
        <p className="text-xs text-gray-400">아직 출근/출석 기록이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {attendanceHistory.map((entry, index) => (
            <div
              key={`${entry.recordedAt}-${entry.method}-${index}`}
              className={`rounded-lg p-3 text-xs border ${
                entry.present ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className={`font-semibold ${entry.present ? 'text-green-700' : 'text-red-700'}`}>
                {entry.present ? '출석' : '노쇼'}
              </div>
              <div className="text-gray-500 mt-1 flex justify-between gap-3">
                <span>{methodLabel(entry.method)}</span>
                <span>{entry.recordedAt || '시간 미기록'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-4">
        <button
          onClick={() => setTab('alba')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'alba' ? 'bg-blue text-white' : 'text-gray-400 hover:text-navy'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 알바생
        </button>
        <button
          onClick={() => setTab('boss')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'boss' ? 'bg-navy text-white' : 'text-gray-400 hover:text-navy'
          }`}
        >
          <Store className="w-4 h-4" /> 사장님
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {tab === 'alba' && (
          <>
            {confirmed ? (
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-600 mb-1">면접이 확정되었습니다!</h2>
                <p className="text-gray-400 text-sm">아래 일정에 맞춰 면접에 참석해주세요.</p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-navy mb-1">면접 일정 안내</h2>
                <p className="text-gray-400 text-sm">
                  <strong className="text-navy">{interview.albaName}</strong>님, 면접 정보를 확인하고 확정해주세요.
                </p>
              </div>
            )}

            {infoCards}
            {attendanceHistorySection}

            <div className="p-4 bg-navy/5 rounded-xl mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">매장명</span>
                <span className="font-medium text-navy">{interview.storeName}</span>
              </div>
            </div>

            <div className="bg-bg rounded-xl p-4 space-y-2 text-sm mb-6">
              <p className="text-xs text-gray-400">QR 스캔 링크</p>
              <p className="text-blue break-all">{qrScanLink}</p>
              <p className="text-xs text-gray-400 mt-2">NFC 스캔 링크</p>
              <p className="text-blue break-all">{nfcScanLink}</p>
            </div>

            {!confirmed && (
              <button
                onClick={confirmInterview}
                className="w-full py-3.5 bg-blue text-white font-medium rounded-xl hover:bg-blue-light transition-colors text-lg"
              >
                면접 확정하기
              </button>
            )}
          </>
        )}

        {tab === 'boss' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-navy mb-1">면접 출석 확인</h2>
              <p className="text-gray-400 text-sm">
                <strong className="text-navy">{interview.albaName}</strong>님의 면접 출석 여부를 확인해주세요.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl mb-4 ${
                confirmed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">알바생 면접 확정</span>
                {confirmed ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> 확정됨
                  </span>
                ) : (
                  <span className="text-gray-400">대기 중</span>
                )}
              </div>
            </div>

            {infoCards}
            {attendanceHistorySection}

            {attended === null ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center mb-2">알바생이 면접에 출석했나요?</p>
                <button
                  onClick={() => submitAttendance(true)}
                  className="w-full py-3.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors text-lg"
                >
                  출석 확인
                </button>
                <button
                  onClick={() => submitAttendance(false)}
                  className="w-full py-3.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors text-lg"
                >
                  노쇼 (불참)
                </button>
              </div>
            ) : (
              <div className={`p-5 rounded-xl text-center ${attended ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    attended ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {attended ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <span className="text-2xl">&#10005;</span>}
                </div>
                <p className={`font-bold text-lg ${attended ? 'text-green-700' : 'text-red-700'}`}>
                  {attended ? '출석 확인 완료' : '노쇼 처리 완료'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {attended
                    ? `${interview.albaName}님의 출석이 기록되었습니다.`
                    : `${interview.albaName}님의 노쇼가 기록되었습니다.`}
                </p>
                <button
                  onClick={() => {
                    loadInterview().catch(() => {
                      setError('데이터를 불러오지 못했습니다.')
                    })
                  }}
                  className="mt-3 text-sm text-gray-400 hover:text-navy underline"
                >
                  상태 새로고침
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-gray-100 pt-6 space-y-2">
              <p className="text-sm text-gray-500">QR/NFC 스캔 링크</p>
              <p className="text-xs text-blue flex items-center gap-1 break-all">
                <QrCode className="w-4 h-4" />
                <Link to={`/scan/${interview.qrToken}`}>{qrScanLink}</Link>
              </p>
              <p className="text-xs text-blue flex items-center gap-1 break-all">
                <Smartphone className="w-4 h-4" />
                <Link to={`/scan/${interview.nfcToken}`}>{nfcScanLink}</Link>
              </p>
            </div>
          </>
        )}
      </div>

      {error ? <p className="text-sm text-red-500 mt-3">{error}</p> : null}
    </div>
  )
}
