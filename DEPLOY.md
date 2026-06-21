# 배포 가이드 — Vercel 하나로 (프론트 + 백엔드 + DB)

이 프로젝트는 Vercel **한 곳**에 배포됩니다. Vercel의 **Services** 기능으로
프론트와 백엔드를 한 프로젝트(한 도메인)에 같이 올립니다.
- 프론트엔드(Vite/React) → `web` 서비스, 경로 `/`
- 백엔드(FastAPI) → `api` 서비스, 경로 `/api` (`api/index.py`)
- DB → Vercel Postgres(Neon) — 무료 티어

설정은 `vercel.json` 의 `experimentalServices` 에 들어있습니다. 별도 서버(Render 등) 불필요.

---

## 1. Vercel 프로젝트 생성

1. https://vercel.com → 로그인 → **Add New... → Project**
2. **Albatrust** 저장소 **Import**
3. **Framework Preset** 을 **Services** 로 설정합니다. (멀티 서비스 배포에 필수)
   - Root Directory 는 저장소 루트 `./` 그대로 두세요.
   - 나머지는 `vercel.json` 이 자동 처리합니다.
4. 일단 **Deploy** 누릅니다. (이 시점엔 DB가 없어 저장 기능은 아직 동작 안 함 — 다음 단계에서 연결)

> 참고: "vercel.json required to deploy projects with multiple services" 메시지는
> Framework Preset 을 **Services** 로 바꾸고 `vercel.json`(이미 포함됨)을 인식하면 사라집니다.

## 2. Postgres 데이터베이스 연결 (무료)

1. 배포된 프로젝트 → 상단 **Storage** 탭 → **Create Database**
2. **Postgres** (Neon) 선택 → 이름 입력 → **Create**
3. 생성된 DB를 이 프로젝트에 **Connect** (보통 자동 연결됨).
   - 그러면 `POSTGRES_URL` 등 환경변수가 프로젝트에 자동 주입됩니다.
   - 코드가 이 `POSTGRES_URL` 을 자동 인식해 Postgres를 사용합니다. (별도 설정 불필요)
4. 환경변수가 적용되도록 **Redeploy** (Deployments 탭 → 최근 배포 → ⋯ → Redeploy).

## 3. 확인

- Vercel 도메인 접속 → **사장님으로 로그인** → 가게 생성
- 새로고침해도 가게가 남아있으면 → 프론트 + 백엔드(서버리스) + Postgres 연동 성공 🎉
- API 헬스체크: `https://<도메인>/api/health` → `{"status":"ok"}`
- 저장이 안 되면: 브라우저 F12 → Network 탭에서 `/api/...` 요청이 200인지 확인.
  500이면 Vercel 대시보드 → Deployments → Functions 로그에서 원인 확인.

---

## 로컬 개발

로컬에서는 환경변수가 없으므로 자동으로 **SQLite 파일**(`backend/data/albatrust.db`)을 사용합니다.

```bash
# 백엔드 (SQLite)
cd /home/od1225/albatrust
./backend/venv/bin/python -m uvicorn index:app --app-dir api --port 8000

# 프론트엔드 (다른 터미널)
cd frontend && npm run dev   # http://localhost:3000
```

- 프론트는 개발 모드에서 `http://localhost:8000` 백엔드를 호출합니다.
- 로컬에서 Postgres로 테스트하려면 `POSTGRES_URL` 환경변수를 설정한 뒤 백엔드를 실행하세요.

## 참고

- 로그인은 데모용(프론트 localStorage 기반)이라 실제 인증이 아닙니다. 공개 서비스로 쓰려면 인증을 별도로 붙여야 합니다.
- `api/index.py` 가 백엔드 단일 소스입니다. (로컬 SQLite / 배포 Postgres 자동 전환)
