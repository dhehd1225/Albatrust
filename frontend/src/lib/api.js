// API 기본 주소.
// - 프로덕션(Vercel): 같은 도메인의 /api 서버리스 함수를 사용하므로 빈 문자열(상대경로).
// - 로컬 개발: http://localhost:8000 백엔드 사용.
// - 필요 시 VITE_API_BASE_URL 환경변수로 강제 지정 가능.
const fromEnv = import.meta.env.VITE_API_BASE_URL

export const API_BASE =
  fromEnv !== undefined && fromEnv !== ''
    ? fromEnv
    : import.meta.env.DEV
      ? 'http://localhost:8000'
      : ''
