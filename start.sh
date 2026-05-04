#!/bin/bash
# AlbaTrust 로컬 실행 스크립트
# 백엔드(FastAPI)와 프론트엔드(React)를 동시에 실행합니다.

echo "🚀 AlbaTrust 시작 중..."
echo ""

# 백엔드 실행
echo "📦 백엔드 서버 시작 (http://localhost:8000)..."
cd "$(dirname "$0")/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 프론트엔드 실행
echo "🎨 프론트엔드 서버 시작 (http://localhost:3000)..."
cd "$(dirname "$0")/frontend"
npx vite --host &
FRONTEND_PID=$!

echo ""
echo "✅ AlbaTrust가 실행 중입니다!"
echo "   프론트엔드: http://localhost:3000"
echo "   백엔드 API: http://localhost:8000"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
