# AlbaTrust

알바생과 사장님 사이의 신뢰를 만드는 플랫폼입니다.

면접 노쇼, 급여 체불 등 아르바이트 시장의 신뢰 문제를 해결하기 위해 **신뢰 점수(Trust Score)** 기반의 프로필 시스템을 제공합니다.

## 주요 기능

- **알바생 신뢰 프로필** — 면접 출석률, 근무 이력, 뱃지(노쇼 제로, 사장님 추천 등)로 구성된 신뢰 점수
- **매장 신뢰 프로필** — 급여 체불 여부, 알바생 리뷰 기반의 매장 평판 시스템
- **면접 관리** — 면접 일정 생성 및 출석 확인

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | FastAPI, Pydantic |
| 라우팅 | React Router v7 |
| 아이콘 | Lucide React |

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
