# AlbaTrust 개발 문서

알바생과 사장님 사이의 신뢰를 만드는 플랫폼. 면접 노쇼·급여 체불 등의 문제를
**신뢰 점수(Trust Score)** 기반 프로필과 가게 출퇴근·임금 관리로 해결합니다.

## 링크

- 배포 사이트: https://albatrust.vercel.app/
- GitHub 저장소: https://github.com/dhehd1225/Albatrust

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend | FastAPI (Python), Pydantic |
| DB | 로컬 SQLite / 배포 PostgreSQL (자동 전환) |
| 배포 | Vercel (Services: 프론트 + 백엔드 한 프로젝트) |

## 폴더 구조

```
albatrust/
├── api/
│   └── index.py          # 백엔드 단일 진입점 (FastAPI). SQLite/Postgres 자동 전환
├── frontend/
│   └── src/
│       ├── App.jsx       # 라우팅 + 레이아웃
│       ├── lib/api.js    # API 베이스 주소
│       ├── components/   # Badge, StarRating, TrustScore
│       └── pages/        # 화면별 컴포넌트
├── vercel.json           # Vercel Services 설정
├── DEPLOY.md             # 배포 가이드
└── DEVELOPMENT.md        # (이 문서)
```

## 로컬 실행

```bash
# 백엔드 (로컬은 SQLite 사용 — backend/data/albatrust.db)
./backend/venv/bin/python -m uvicorn index:app --app-dir api --port 8000

# 프론트엔드 (다른 터미널)
cd frontend && npm install && npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8000
- API 자동 문서(Swagger): http://localhost:8000/docs

## 환경변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `POSTGRES_URL` | 백엔드 | 있으면 PostgreSQL 사용(배포). 없으면 SQLite(로컬) |
| `DATABASE_PATH` | 백엔드 | 로컬 SQLite 파일 경로 덮어쓰기(선택) |
| `VITE_API_BASE_URL` | 프론트 | API 주소 강제 지정(선택). 미설정 시 로컬=localhost:8000, 배포=같은 도메인 `/api` |

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/health` | 상태 확인 |
| POST | `/api/interviews` | 면접 생성(QR·NFC 토큰 발급) |
| GET | `/api/interviews` | 면접 목록 |
| GET | `/api/interviews/{id}` | 면접 상세 |
| PUT | `/api/interviews/{id}/confirm` | 면접 확정 |
| POST | `/api/interviews/{id}/attendance` | 출석 수동 기록 |
| POST | `/api/scans/{token}` | QR/NFC 스캔 출석 |
| GET | `/api/alba/{id}` | 알바생 프로필 |
| GET | `/api/stores/{id}` | 매장 프로필 |
| POST | `/api/workplaces` | 가게 생성 |
| GET | `/api/workplaces?owner=` | 사장님 가게 목록 |
| GET | `/api/workplaces/{id}` | 가게 상세(멤버·근무·임금) |
| DELETE | `/api/workplaces/{id}` | 가게 삭제 |
| POST | `/api/workplaces/{id}/members` | 알바생 초대 |
| DELETE | `/api/workplaces/{id}/members/{mid}` | 알바생 삭제 |
| POST | `/api/workplaces/{id}/members/{mid}/clock-in` | 출근 |
| POST | `/api/workplaces/{id}/members/{mid}/clock-out` | 퇴근 |
| POST | `/api/workplaces/join` | 초대코드로 합류 |

## 데이터 모델 (주요 테이블)

| 테이블 | 용도 |
|--------|------|
| `alba_profiles` | 알바생 신뢰 점수·뱃지·근무 이력 |
| `store_profiles` | 매장 평판·리뷰·임금체불 여부 |
| `interviews` / `attendance_history` / `scan_tokens` | 면접·출석·스캔 토큰 |
| `workplaces` / `workplace_members` / `work_shifts` | 가게·멤버·출퇴근 기록 |

## 핵심 로직

- **신뢰 점수**: `출석 면접 / 전체 면접 × 100` (0~100)
- **주휴수당**: 1주 소정근로 15시간 이상이면 `(주 소정근로시간 ÷ 40 × 8) × 시급`
- **임금**: 출퇴근 기록의 근무 분(分) × 시급. (2026년 최저시급 10,320원 기본값)

## 배포

Vercel 한 곳에 프론트+백엔드+Postgres를 올립니다. 자세한 절차는 [DEPLOY.md](./DEPLOY.md) 참고.

## 참고 / 한계

- 로그인은 데모용(프론트 localStorage 기반)으로 실제 인증이 아님 → 공개 서비스화 시 인증 추가 필요.
