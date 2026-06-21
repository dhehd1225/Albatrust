import { useState } from 'react'
import { CheckCircle2, FileCheck2, FileText, Upload } from 'lucide-react'

const initialContracts = []

export default function ContractVault() {
  const [contracts, setContracts] = useState(initialContracts)
  const [selectedId, setSelectedId] = useState(null)
  const selected = contracts.find((contract) => contract.id === selectedId)

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const contract = {
      id: `contract-${Date.now()}`,
      title: file.name,
      type: '업로드 사본',
      period: '기간 미지정',
      linkedCareer: '경력 연결 대기',
      status: '확인 필요',
    }

    setContracts((current) => [contract, ...current])
    setSelectedId(contract.id)
    event.target.value = ''
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue mb-2">Contract Vault</p>
          <h1 className="text-3xl font-bold text-navy">계약서 보관함</h1>
          <p className="text-gray-500 mt-2">경력 인증에 필요한 계약서를 한 곳에서 확인합니다.</p>
        </div>

        <label className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue text-white text-sm font-semibold hover:bg-blue-light transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          계약서 업로드
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-navy mb-4">보관 중인 계약서</h2>
          {contracts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-bg p-10 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">보관 중인 계약서가 없습니다. 위에서 계약서를 업로드하세요.</p>
            </div>
          ) : (
          <div className="space-y-3">
            {contracts.map((contract) => {
              const active = selectedId === contract.id

              return (
                <button
                  key={contract.id}
                  onClick={() => setSelectedId(contract.id)}
                  className={`w-full text-left rounded-xl p-4 border transition-colors ${
                    active
                      ? 'border-blue bg-blue/5'
                      : 'border-gray-100 bg-bg hover:border-blue/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-navy truncate">{contract.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{contract.type} · {contract.period}</p>
                      <span
                        className={`inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          contract.status === '경력 연결됨'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {contract.status === '경력 연결됨' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <FileCheck2 className="w-3.5 h-3.5" />
                        )}
                        {contract.status}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          )}
        </div>

        {selected ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="aspect-[4/3] rounded-2xl bg-bg border border-gray-100 flex items-center justify-center mb-5">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue mx-auto mb-3" />
              <p className="font-bold text-navy">{selected?.title}</p>
              <p className="text-sm text-gray-400 mt-1">{selected?.type}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">근무 기간</span>
              <span className="font-medium text-navy text-right">{selected?.period}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">연결 경력</span>
              <span className="font-medium text-navy text-right">{selected?.linkedCareer}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">상태</span>
              <span className="font-medium text-navy text-right">{selected?.status}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 py-3 rounded-xl bg-navy text-white text-sm font-medium hover:bg-navy-light transition-colors">
              계약서 열람
            </button>
            <button className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-navy hover:border-blue transition-colors">
              경력 연결
            </button>
          </div>
        </div>
        ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center min-h-[280px]">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">계약서를 선택하면 상세 정보가 표시됩니다.</p>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
