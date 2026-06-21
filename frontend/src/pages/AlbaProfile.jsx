import { useParams } from 'react-router-dom'
import { CalendarCheck, Briefcase } from 'lucide-react'
import TrustScore from '../components/TrustScore'
import Badge from '../components/Badge'
import StarRating from '../components/StarRating'
import { useEffect, useState } from 'react'

import { API_BASE } from '../lib/api'

export default function AlbaProfile() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/alba/${id}`)
        const payload = await res.json()
        if (!res.ok) {
          throw new Error(payload?.detail || '알바생 프로필을 가져오지 못했습니다.')
        }
        setProfile(payload)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : '알바생 프로필을 가져오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return <p className="text-center py-12 text-gray-400">프로필을 불러오는 중입니다...</p>
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">알바생 프로필을 찾을 수 없습니다.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-navy">
          {profile.name[0]}
        </div>
        <h1 className="text-2xl font-bold text-navy mb-1">{profile.name}</h1>
        <p className="text-gray-400 text-sm mb-4">알바생 프로필</p>
        <div className="flex justify-center">
          <TrustScore score={profile.trustScore} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <CalendarCheck className="w-6 h-6 text-blue mx-auto mb-2" />
          <p className="text-2xl font-bold text-navy">
            {profile.interviewAttendance}<span className="text-sm text-gray-400 font-normal">/{profile.totalInterviews}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">면접 출석</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
          <Briefcase className="w-6 h-6 text-blue mx-auto mb-2" />
          <p className="text-2xl font-bold text-navy">{profile.workHistory.length}</p>
          <p className="text-xs text-gray-400 mt-1">근무 이력</p>
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-navy mb-4">업적 배지</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {profile.badges.map((badge) => (
              <Badge key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {profile.badges.length === 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <h2 className="text-lg font-bold text-navy mb-2">업적 배지</h2>
          <p className="text-gray-400 text-sm">아직 획득한 배지가 없습니다.</p>
        </div>
      )}

      {/* Work History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-navy mb-4">근무 이력</h2>
        <div className="space-y-3">
          {profile.workHistory.map((work, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-bg rounded-xl">
              <div>
                <p className="font-medium text-navy text-sm">{work.store}</p>
                <p className="text-xs text-gray-400">{work.period}</p>
              </div>
              <StarRating rating={work.rating} size={14} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
