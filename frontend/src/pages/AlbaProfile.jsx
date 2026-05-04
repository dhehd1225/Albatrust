import { useParams, Link } from 'react-router-dom'
import { CalendarCheck, Briefcase } from 'lucide-react'
import TrustScore from '../components/TrustScore'
import Badge from '../components/Badge'
import StarRating from '../components/StarRating'

const DUMMY_PROFILES = {
  "1": {
    id: "1", name: "김민준", trustScore: 92,
    badges: [
      { id: "no_noshow", name: "노쇼 제로", icon: "shield-check", description: "노쇼 없이 모든 면접에 출석" },
      { id: "no_late", name: "지각 없음", icon: "clock", description: "한 번도 지각하지 않은 성실한 알바생" },
      { id: "boss_recommend", name: "사장님 추천", icon: "thumbs-up", description: "사장님이 직접 추천한 알바생" },
      { id: "long_term", name: "장기 근속", icon: "award", description: "6개월 이상 꾸준히 근무" },
    ],
    interviewAttendance: 12, totalInterviews: 12,
    workHistory: [
      { store: "스타벅스 강남점", period: "2024.03 ~ 2024.09", rating: 5 },
      { store: "CU 역삼점", period: "2024.10 ~ 현재", rating: 5 },
    ],
  },
  "2": {
    id: "2", name: "이서연", trustScore: 78,
    badges: [
      { id: "no_noshow", name: "노쇼 제로", icon: "shield-check", description: "노쇼 없이 모든 면접에 출석" },
      { id: "boss_recommend", name: "사장님 추천", icon: "thumbs-up", description: "사장님이 직접 추천한 알바생" },
    ],
    interviewAttendance: 8, totalInterviews: 9,
    workHistory: [
      { store: "이디야커피 서초점", period: "2024.06 ~ 2024.12", rating: 4 },
    ],
  },
  "3": {
    id: "3", name: "박지호", trustScore: 45,
    badges: [],
    interviewAttendance: 3, totalInterviews: 7,
    workHistory: [
      { store: "GS25 신촌점", period: "2024.01 ~ 2024.03", rating: 3 },
    ],
  },
}

export default function AlbaProfile() {
  const { id } = useParams()
  const profile = DUMMY_PROFILES[id] || null

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">알바생 프로필을 찾을 수 없습니다.</p>
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

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        {['1', '2', '3'].map((pid) => (
          <Link
            key={pid}
            to={`/alba/${pid}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              id === pid
                ? 'bg-blue text-white'
                : 'bg-white text-navy border border-gray-200 hover:border-blue'
            }`}
          >
            프로필 {pid}
          </Link>
        ))}
      </div>
    </div>
  )
}
