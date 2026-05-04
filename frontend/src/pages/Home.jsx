import { Link } from 'react-router-dom'
import { CalendarCheck, UserCheck, Store } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: CalendarCheck,
      title: '면접 확정',
      desc: '링크 하나로 면접 일정을 확정하세요. 가입 없이 간편하게.',
      link: '/interview',
      color: 'bg-blue/10 text-blue',
    },
    {
      icon: UserCheck,
      title: '알바생 프로필',
      desc: 'Trust Score와 배지로 신뢰할 수 있는 알바생을 확인하세요.',
      link: '/alba/1',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: Store,
      title: '매장 프로필',
      desc: '실제 알바생 후기와 신뢰도로 좋은 매장을 찾으세요.',
      link: '/store/1',
      color: 'bg-orange-500/10 text-orange-600',
    },
  ]

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy mb-3">
          알바, 이제 <span className="text-blue">신뢰</span>로 연결하세요
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          알바생과 사장님 모두를 위한 투명한 신뢰 플랫폼
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <Link
            key={f.title}
            to={f.link}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2 group-hover:text-blue transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-navy mb-4">데모 바로가기</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/alba/1" className="px-4 py-2 bg-bg rounded-lg text-sm text-navy hover:bg-blue hover:text-white transition-colors">
            김민준 (Trust 92)
          </Link>
          <Link to="/alba/2" className="px-4 py-2 bg-bg rounded-lg text-sm text-navy hover:bg-blue hover:text-white transition-colors">
            이서연 (Trust 78)
          </Link>
          <Link to="/alba/3" className="px-4 py-2 bg-bg rounded-lg text-sm text-navy hover:bg-blue hover:text-white transition-colors">
            박지호 (Trust 45)
          </Link>
          <Link to="/store/1" className="px-4 py-2 bg-bg rounded-lg text-sm text-navy hover:bg-blue hover:text-white transition-colors">
            스타벅스 강남점 (95)
          </Link>
          <Link to="/store/2" className="px-4 py-2 bg-bg rounded-lg text-sm text-navy hover:bg-blue hover:text-white transition-colors">
            CU 역삼점 (72)
          </Link>
          <Link to="/store/3" className="px-4 py-2 bg-bg rounded-lg text-sm text-navy hover:bg-blue hover:text-white transition-colors">
            맘스터치 신림점 (38)
          </Link>
        </div>
      </div>
    </div>
  )
}
