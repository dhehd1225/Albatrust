import { Star } from 'lucide-react'

export default function StarRating({ rating, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
        />
      ))}
    </div>
  )
}
