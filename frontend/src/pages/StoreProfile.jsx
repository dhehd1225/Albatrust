import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import TrustScore from '../components/TrustScore'
import StarRating from '../components/StarRating'

import { API_BASE } from '../lib/api'

export default function StoreProfile() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [store, setStore] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/stores/${id}`)
        const payload = await res.json()
        if (!res.ok) {
          throw new Error(payload?.detail || '매장 프로필을 가져오지 못했습니다.')
        }
        setStore(payload)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : '매장 프로필을 가져오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return <p className="text-center py-12 text-gray-400">프로필을 불러오는 중입니다...</p>
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">매장 프로필을 찾을 수 없습니다.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
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

        {store.reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">아직 등록된 후기가 없습니다.</p>
        ) : (
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
        )}
      </div>
    </div>
  )
}
