# 배포 가이드 (프론트 = Vercel / 백엔드 = Railway·Render)

프론트엔드는 Vercel, 백엔드(FastAPI + SQLite)는 디스크를 지원하는 별도 호스팅에 배포합니다.
Vercel 서버리스는 파일시스템이 일시적이라 SQLite 데이터가 유지되지 않으므로 백엔드는 Vercel에 올리지 않습니다.

---

## 1. 백엔드 먼저 배포 (Render 예시)

1. Render(또는 Railway/Fly.io)에서 새 **Web Service** 생성, 이 저장소 연결.
2. 설정:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     (또는 저장소의 `backend/Procfile` 자동 인식)
3. **데이터 영속성(중요)**: SQLite 파일이 재배포 시 사라지지 않도록 디스크를 붙입니다.
   - Render: **Disks** 에서 디스크 추가 → Mount Path 예: `/var/data`
   - 환경변수 **`DATABASE_PATH`** = `/var/data/albatrust.db` 설정
   - (디스크를 안 붙이면 재배포/재시작 때 데이터가 초기화됩니다.)
4. 배포 완료 후 발급되는 URL을 복사 (예: `https://albatrust-api.onrender.com`).
   - 헬스체크: `https.../api/health` → `{"status":"ok"}`

## 2. 프론트엔드 배포 (Vercel)

1. Vercel에서 **New Project** → 이 저장소 import.
2. 설정:
   - **Root Directory**: `frontend`
   - Framework Preset: **Vite** (자동 인식)
   - Build Command / Output: 기본값(`vite build` / `dist`)
3. **환경변수** 추가:
   - `VITE_API_BASE_URL` = 1단계에서 받은 백엔드 URL (예: `https://albatrust-api.onrender.com`)
4. Deploy. `frontend/vercel.json` 의 rewrite 설정으로 새로고침 시에도 라우팅이 동작합니다.

## 3. 확인

- Vercel 도메인 접속 → 사장/알바 테스트 로그인 → 가게 생성 등이 백엔드에 저장되는지 확인.
- 저장이 안 되면 브라우저 콘솔에서 CORS/네트워크 오류와 `VITE_API_BASE_URL` 값을 점검하세요.

---

### 참고: 로컬 개발
- `VITE_API_BASE_URL` 미설정 시 자동으로 `http://localhost:8000` 사용.
- 백엔드: `cd backend && ./venv/bin/python -m uvicorn main:app --port 8000`
- 프론트: `cd frontend && npm run dev`
