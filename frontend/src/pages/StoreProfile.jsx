import { useParams, Link } from 'react-router-dom'
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import TrustScore from '../components/TrustScore'
import StarRating from '../components/StarRating'

const DUMMY_STORES = {
  "1": {
    id: "1", name: "스타벅스 강남점", trustScore: 95, category: "카페",
    address: "서울시 강남구 테헤란로 123", wageComplaint: false,
    reviews: [
      { author: "김민준", rating: 5, comment: "시급도 정확하고, 매니저님이 정말 친절해요!", date: "2024.09.15" },
      { author: "이서연", rating: 5, comment: "체계적인 교육과 좋은 근무 환경이에요.", date: "2024.08.20" },
      { author: "최유진", rating: 4, comment: "바쁜 시간대가 힘들지만 전반적으로 좋아요.", date: "2024.07.10" },
    ],
  },
  "2": {
    id: "2", name: "CU 역삼점", trustScore: 72, category: "편의점",
    address: "서울시 강남구 역삼로 45", wageComplaint: false,
    reviews: [
      { author: "박지호", rating: 3, comment: "급여는 정시에 나오지만, 야간 수당이 좀 아쉬워요.", date: "2024.11.05" },
      { author: "정하은", rating: 4, comment: "혼자 일하는 시간이 많지만 편해요.", date: "2024.10.15" },
    ],
  },
  "3": {
    id: "3", name: "맘스터치 신림점", trustScore: 38, category: "패스트푸드",
    address: "서울시 관악구 신림로 67", wageComplaint: true,
    reviews: [
      { author: "김도윤", rating: 2, comment: "급여가 늦게 들어올 때가 있어요.", date: "2024.09.20" },
      { author: "이하린", rating: 1, comment: "야근 수당이 제대로 안 나왔어요. 주의하세요.", date: "2024.08.15" },
      { author: "박서준", rating: 3, comment: "사람은 좋은데 시스템이 아쉽습니다.", date: "2024.07.01" },
    ],
  },
}

export default function StoreProfile() {
  const { id } = useParams()
  const store = DUMMY_STORES[id] || null

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">매장 프로필을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const avgRating = store.reviews.length
    ? (store.reviews.reduce((sum, r) => sum + r.rating, 0) / store.reviews.length).toFixed(1)
    : 0

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue/10 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
          🏪
        </div>
        <h1 className="text-2xl font-bold text-navy mb-1">{store.name}</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-1">
          <span className="px-2 py-0.5 bg-bg rounded text-xs font-medium">{store.category}</span>
        </div>
        <div className="flex items-center justify-center gap-1 text-sm text-gray-400 mb-4">
          <MapPin className="w-3 h-3" />
          <span>{store.address}</span>
        </div>
        <div className="flex justify-center">
          <TrustScore score={store.trustScore} />
        </div>
      </div>

      {/* Wage Complaint Status */}
      <div className={`rounded-2xl p-5 shadow-sm border ${
        store.wageComplaint
          ? 'bg-red-50 border-red-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center gap-3">
          {store.wageComplaint ? (
            <>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-red-700 text-sm">임금체불 신고 이력 있음</p>
                <p className="text-xs text-red-500">이 매장에 대한 임금체불 신고가 접수된 적이 있습니다.</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-700 text-sm">임금체불 신고 없음</p>
                <p className="text-xs text-green-600">이 매장에 대한 임금체불 신고 이력이 없습니다.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">알바생 후기</h2>
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(Number(avgRating))} size={14} />
            <span className="text-sm font-bold text-navy">{avgRating}</span>
            <span className="text-xs text-gray-400">({store.reviews.length}개)</span>
          </div>
        </div>

        <div className="space-y-3">
          {store.reviews.map((review, i) => (
            <div key={i} className="p-4 bg-bg rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-navy/10 rounded-full flex items-center justify-center text-xs font-bold text-navy">
                    {review.author[0]}
                  </div>
                  <span className="font-medium text-navy text-sm">{review.author}</span>
                </div>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
              <StarRating rating={review.rating} size={12} />
              <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        {['1', '2', '3'].map((sid) => (
          <Link
            key={sid}
            to={`/store/${sid}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              id === sid
                ? 'bg-blue text-white'
                : 'bg-white text-navy border border-gray-200 hover:border-blue'
            }`}
          >
            매장 {sid}
          </Link>
        ))}
      </div>
    </div>
  )
}
