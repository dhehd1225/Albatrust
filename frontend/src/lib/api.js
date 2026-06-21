// API 기본 주소.
// 배포 시 Vercel 환경변수 VITE_API_BASE_URL 에 백엔드 주소를 넣으면 그 값을 사용하고,
// 로컬 개발에서는 http://localhost:8000 으로 동작합니다.
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
