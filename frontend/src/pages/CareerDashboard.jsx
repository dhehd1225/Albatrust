import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react'

const careers = [
  {
    id: 'career-1',
    store: 'CU 역삼점',
    role: '편의점 스태프',
    period: '2024.10 ~ 2025.03',
    status: '인증 완료',
    proof: '근무 6개월 · 정산 이슈 없음',
    strength: '직영점 지원 시 매장 운영 경험으로 활용 가능',
  },
  {
    id: 'career-2',
    store: '한빛세무회계',
    role: '사무보조',
    period: '2025.04 ~ 현재',
    status: '인증 대기',
    proof: '계약서 확인 완료 · 담당자 승인 대기',
    strength: '경리직 지원 시 문서 정리 경험으로 활용 가능',
  },
]

const stats = [
  { label: '인증 경력', value: '1건', icon: ShieldCheck },
  { label: '대기 중', value: '1건', icon: Clock },
  { label: '계약서', value: '2건', icon: FileText },
]

export default function CareerDashboard() {
  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue mb-2">Career Passport</p>
          <h1 className="text-3xl font-bold text-navy">내 경력</h1>
          <p className="text-gray-500 mt-2">인증된 근무 이력을 지원용 스펙으로 정리합니다.</p>
        </div>
        <Link
          to="/career/request"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue text-white text-sm font-semibold hover:bg-blue-light transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          경력 인증 요청
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <stat.icon className="w-5 h-5 text-blue mb-3" />
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-navy">경력 타임라인</h2>
          <Link to="/contracts" className="text-sm font-semibold text-blue hover:text-blue-light">
            계약서 보기
          </Link>
        </div>

        <div className="space-y-4">
          {careers.map((career) => {
            const verified = career.status === '인증 완료'

            return (
              <div key={career.id} className="rounded-xl border border-gray-100 bg-bg p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BriefcaseBusiness className="w-4 h-4 text-blue" />
                      <p className="font-bold text-navy">{career.store}</p>
                    </div>
                    <p className="text-sm text-gray-600">{career.role}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      {career.period}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold self-start ${
                      verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {career.status}
                  </span>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">인증 근거</p>
                    <p className="text-sm font-medium text-navy">{career.proof}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">스펙 활용</p>
                    <p className="text-sm font-medium text-navy">{career.strength}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button className="bg-navy text-white rounded-2xl p-5 text-left hover:bg-navy-light transition-colors">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            인증서 공유
            <ArrowUpRight className="w-4 h-4" />
          </span>
          <p className="text-sm text-blue-light mt-2">지원서에 첨부할 공개 프로필 링크를 만듭니다.</p>
        </button>
        <Link
          to="/contracts"
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">
            계약서 보관함
            <ArrowUpRight className="w-4 h-4" />
          </span>
          <p className="text-sm text-gray-500 mt-2">근무 이력과 연결된 계약서를 확인합니다.</p>
        </Link>
      </div>
    </div>
  )
}
