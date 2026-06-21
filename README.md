# AlbaTrust

> 알바생과 사장님이 **서로 믿고 일할 수 있게** 돕는 아르바이트 신뢰 플랫폼

🔗 **바로 써보기:** https://albatrust.vercel.app/ (로그인 화면에서 "사장님/알바생으로 로그인" 버튼으로 둘러볼 수 있어요)

## 이게 뭔가요?

아르바이트에는 **면접 노쇼**, **급여 체불** 같은 신뢰 문제가 자주 생깁니다.
AlbaTrust는 이런 걸 점수와 기록으로 투명하게 만들어 줍니다.

- **알바생**은 성실히 일한 기록이 **신뢰 점수와 경력**으로 쌓여 다음 지원에 스펙이 됩니다.
- **사장님**은 가게를 만들어 알바생을 초대하고, **출퇴근·임금·주휴수당**을 한 곳에서 관리합니다.

## 주요 기능

### 👤 알바생용
- **내 신뢰 프로필** — 면접 출석률·근무 이력으로 계산되는 **신뢰 점수**, 뱃지(노쇼 제로·사장님 추천 등)
- **내 경력(Career Passport)** — 인증된 근무 이력을 지원용 스펙으로 정리
- **계약서 보관함** — 근로계약서를 올려두고 경력과 연결
- **가게 합류** — 사장님이 준 **초대코드**로 가게에 들어가 출퇴근 기록

### 🏪 사장님용
- **내 가게** — 가게를 만들고 알바생 초대 (초대코드 발급)
- **출퇴근 기록** — 알바생 출근/퇴근 체크, 근무시간 자동 집계
- **임금·주휴수당 자동 계산** — 시급 기준으로 임금과 주휴수당을 자동으로 계산 (2026년 최저시급 반영)
- **매장 신뢰 프로필** — 급여 체불 여부·알바생 리뷰로 보는 가게 평판

### 🤝 공통
- **면접 관리** — 면접 일정을 만들어 확정 링크를 보내고, **QR·NFC 스캔으로 출석** 체크
- **테스트 로그인** — 가입 없이 사장님/알바생 계정으로 바로 체험

## 화면 흐름 (한눈에)

```
[사장님] 가게 만들기 → 알바생 초대(코드 발급) → 출퇴근 체크 → 임금·주휴수당 확인
[알바생] 초대코드로 합류 → 출퇴근 → 신뢰 점수·경력 쌓기
[공통]   면접 잡기 → QR/NFC 스캔으로 출석 → 출석 기록이 신뢰 점수에 반영
```

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | FastAPI, Pydantic |
| DB | SQLite(로컬) / PostgreSQL(배포) 자동 전환 |
| 라우팅 | React Router v7 |
| 아이콘 | Lucide React |
| 배포 | Vercel (Services: 프론트 + 백엔드 한 프로젝트) |

## 실행 방법

### 한 번에 실행

```bash
chmod +x start.sh
./start.sh
```

### 개별 실행

**백엔드** (진입점: `api/index.py`)

```bash
python3 -m venv backend/venv
backend/venv/bin/pip install -r requirements.txt
backend/venv/bin/python -m uvicorn index:app --app-dir api --host 0.0.0.0 --port 8000
```

**프론트엔드**

```bash
cd frontend
npm install
npm run dev
```

## 접속

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs

## 문서

- [개발 문서 (DEVELOPMENT.md)](./DEVELOPMENT.md) — 구조, 실행, API, 데이터 모델
- [배포 가이드 (DEPLOY.md)](./DEPLOY.md) — Vercel 배포
