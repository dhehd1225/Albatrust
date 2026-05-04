import { ShieldCheck, Clock, ThumbsUp, Award } from 'lucide-react'

const iconMap = {
  'shield-check': ShieldCheck,
  'clock': Clock,
  'thumbs-up': ThumbsUp,
  'award': Award,
}

export default function Badge({ badge }) {
  const Icon = iconMap[badge.icon] || Award

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-blue" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-sm text-navy">{badge.name}</p>
        <p className="text-xs text-gray-400">{badge.description}</p>
      </div>
    </div>
  )
}
