import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Calendar, Clock, FileText, CheckCircle2, UserCheck, Store } from 'lucide-react'

export default function InterviewView() {
  const { id } = useParams()
  const [tab, setTab] = useState('alba')
  const [confirmed, setConfirmed] = useState(false)
  const [attended, setAttended] = useState(null) // null = 미확인, true = 출석, false = 노쇼

  const interview = {
    id,
    storeName: '스타벅스 강남점',
    albaName: '김민준',
    date: '2025-06-15',
    time: '14:00',
    location: '매장 내 (강남역 2번 출구 도보 3분)',
    notes: '편한 복장으로 오시면 됩니다.',
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

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Tab */}
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
        {/* 알바생 탭 */}
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

            <div className="p-4 bg-navy/5 rounded-xl mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">매장명</span>
                <span className="font-medium text-navy">{interview.storeName}</span>
              </div>
            </div>

            {!confirmed && (
              <button
                onClick={() => setConfirmed(true)}
                className="w-full py-3.5 bg-blue text-white font-medium rounded-xl hover:bg-blue-light transition-colors text-lg"
              >
                면접 확정하기
              </button>
            )}
          </>
        )}

        {/* 사장님 탭 */}
        {tab === 'boss' && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-navy mb-1">면접 출석 확인</h2>
              <p className="text-gray-400 text-sm">
                <strong className="text-navy">{interview.albaName}</strong>님의 면접 출석 여부를 확인해주세요.
              </p>
            </div>

            {/* 알바생 확정 상태 */}
            <div className={`p-4 rounded-xl mb-4 ${confirmed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
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

            {/* 출석 확인 */}
            {attended === null ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center mb-2">알바생이 면접에 출석했나요?</p>
                <button
                  onClick={() => setAttended(true)}
                  className="w-full py-3.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors text-lg"
                >
                  출석 확인
                </button>
                <button
                  onClick={() => setAttended(false)}
                  className="w-full py-3.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors text-lg"
                >
                  노쇼 (불참)
                </button>
              </div>
            ) : (
              <div className={`p-5 rounded-xl text-center ${attended ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${attended ? 'bg-green-100' : 'bg-red-100'}`}>
                  {attended ? (
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  ) : (
                    <span className="text-2xl">&#10005;</span>
                  )}
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
                  onClick={() => setAttended(null)}
                  className="mt-3 text-sm text-gray-400 hover:text-navy underline"
                >
                  다시 선택하기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
