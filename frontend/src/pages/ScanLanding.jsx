import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, AlertTriangle } from 'lucide-react'

import { API_BASE } from '../lib/api'

export default function ScanLanding() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [interview, setInterview] = useState(null)
  const [alreadyRecorded, setAlreadyRecorded] = useState(false)

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setError('유효하지 않은 토큰입니다.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/api/scans/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        const payload = await res.json()

        if (!res.ok) {
          throw new Error(payload?.detail || '출근/면접 기록 요청이 실패했습니다.')
        }

        setInterview(payload.interview)
        setAlreadyRecorded(payload.alreadyRecorded)
        setMessage(
          payload.alreadyRecorded
            ? '이미 출석으로 기록된 스캔입니다.'
            : '출석이 성공적으로 기록되었습니다.'
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : '요청 처리 중 문제가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [token])

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        {loading ? (
          <p className="text-gray-500 text-sm">스캔 처리 중입니다...</p>
        ) : error ? (
          <div className="space-y-3">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-red-600 font-medium">{error}</p>
            <Link to="/" className="text-sm text-blue underline">
              홈으로 이동
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <p className="font-medium text-navy">{message}</p>
            {interview ? (
              <>
                <p className="text-sm text-gray-500">
                  {interview.albaName}님 - {interview.storeName}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  면접일: {interview.date} {interview.time}
                </p>
              </>
            ) : null}
            {alreadyRecorded ? (
              <p className="text-xs text-gray-400">이미 기록된 이력을 다시 확인한 경우 상태는 그대로 유지됩니다.</p>
            ) : null}
            <Link to={`/interview/${interview?.id}`} className="inline-block mt-2 text-sm text-blue underline">
              면접 상세로 이동
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

