import { Link } from 'react-router-dom'
import { CalendarCheck, FileText, ShieldCheck } from 'lucide-react'

export default function Home({ isAuthenticated }) {
  const features = [
    {
      icon: ShieldCheck,
      title: '내 경력',
      desc: '인증된 아르바이트 이력을 한 곳에서 관리하세요.',
      link: isAuthenticated ? '/career' : '/login',
      color: 'bg-green-500/10 text-green-600',
    },
    {
      icon: FileText,
      title: '계약서 보관함',
      desc: '전자계약서와 계약서 사본을 안전하게 확인하세요.',
      link: isAuthenticated ? '/contracts' : '/login',
      color: 'bg-orange-500/10 text-orange-600',
    },
    {
      icon: CalendarCheck,
      title: '면접 확정',
      desc: '면접 일정을 확정하고 출석 기록으로 연결하세요.',
      link: isAuthenticated ? '/interview' : '/login',
      color: 'bg-blue/10 text-blue',
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

    </div>
  )
}
