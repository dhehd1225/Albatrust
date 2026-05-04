from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid

app = FastAPI(title="AlbaTrust API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory storage ──────────────────────────────────────────────

interviews: dict = {}

# ── Dummy data ──────────────────────────────────────────────────────

alba_profiles = {
    "1": {
        "id": "1",
        "name": "김민준",
        "trustScore": 92,
        "badges": [
            {"id": "no_noshow", "name": "노쇼 제로", "icon": "shield-check", "description": "노쇼 없이 모든 면접에 출석"},
            {"id": "no_late", "name": "지각 없음", "icon": "clock", "description": "한 번도 지각하지 않은 성실한 알바생"},
            {"id": "boss_recommend", "name": "사장님 추천", "icon": "thumbs-up", "description": "사장님이 직접 추천한 알바생"},
            {"id": "long_term", "name": "장기 근속", "icon": "award", "description": "6개월 이상 꾸준히 근무"},
        ],
        "interviewAttendance": 12,
        "totalInterviews": 12,
        "workHistory": [
            {"store": "스타벅스 강남점", "period": "2024.03 ~ 2024.09", "rating": 5},
            {"store": "CU 역삼점", "period": "2024.10 ~ 현재", "rating": 5},
        ],
    },
    "2": {
        "id": "2",
        "name": "이서연",
        "trustScore": 78,
        "badges": [
            {"id": "no_noshow", "name": "노쇼 제로", "icon": "shield-check", "description": "노쇼 없이 모든 면접에 출석"},
            {"id": "boss_recommend", "name": "사장님 추천", "icon": "thumbs-up", "description": "사장님이 직접 추천한 알바생"},
        ],
        "interviewAttendance": 8,
        "totalInterviews": 9,
        "workHistory": [
            {"store": "이디야커피 서초점", "period": "2024.06 ~ 2024.12", "rating": 4},
        ],
    },
    "3": {
        "id": "3",
        "name": "박지호",
        "trustScore": 45,
        "badges": [],
        "interviewAttendance": 3,
        "totalInterviews": 7,
        "workHistory": [
            {"store": "GS25 신촌점", "period": "2024.01 ~ 2024.03", "rating": 3},
        ],
    },
}

store_profiles = {
    "1": {
        "id": "1",
        "name": "스타벅스 강남점",
        "trustScore": 95,
        "category": "카페",
        "address": "서울시 강남구 테헤란로 123",
        "wageComplaint": False,
        "reviews": [
            {"author": "김민준", "rating": 5, "comment": "시급도 정확하고, 매니저님이 정말 친절해요!", "date": "2024.09.15"},
            {"author": "이서연", "rating": 5, "comment": "체계적인 교육과 좋은 근무 환경이에요.", "date": "2024.08.20"},
            {"author": "최유진", "rating": 4, "comment": "바쁜 시간대가 힘들지만 전반적으로 좋아요.", "date": "2024.07.10"},
        ],
    },
    "2": {
        "id": "2",
        "name": "CU 역삼점",
        "trustScore": 72,
        "category": "편의점",
        "address": "서울시 강남구 역삼로 45",
        "wageComplaint": False,
        "reviews": [
            {"author": "박지호", "rating": 3, "comment": "급여는 정시에 나오지만, 야간 수당이 좀 아쉬워요.", "date": "2024.11.05"},
            {"author": "정하은", "rating": 4, "comment": "혼자 일하는 시간이 많지만 편해요.", "date": "2024.10.15"},
        ],
    },
    "3": {
        "id": "3",
        "name": "맘스터치 신림점",
        "trustScore": 38,
        "category": "패스트푸드",
        "address": "서울시 관악구 신림로 67",
        "wageComplaint": True,
        "reviews": [
            {"author": "김도윤", "rating": 2, "comment": "급여가 늦게 들어올 때가 있어요.", "date": "2024.09.20"},
            {"author": "이하린", "rating": 1, "comment": "야근 수당이 제대로 안 나왔어요. 주의하세요.", "date": "2024.08.15"},
            {"author": "박서준", "rating": 3, "comment": "사람은 좋은데 시스템이 아쉽습니다.", "date": "2024.07.01"},
        ],
    },
}

# ── Models ──────────────────────────────────────────────────────────

class InterviewCreate(BaseModel):
    storeName: str
    albaName: str
    date: str
    time: str
    location: str
    notes: Optional[str] = ""

class InterviewConfirm(BaseModel):
    confirmed: bool = True

# ── API Endpoints ───────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}

# Interview endpoints
@app.post("/api/interviews")
def create_interview(data: InterviewCreate):
    interview_id = str(uuid.uuid4())[:8]
    interviews[interview_id] = {
        "id": interview_id,
        "storeName": data.storeName,
        "albaName": data.albaName,
        "date": data.date,
        "time": data.time,
        "location": data.location,
        "notes": data.notes,
        "confirmed": False,
        "confirmedAt": None,
        "createdAt": datetime.now().isoformat(),
    }
    return interviews[interview_id]

@app.get("/api/interviews/{interview_id}")
def get_interview(interview_id: str):
    if interview_id not in interviews:
        raise HTTPException(status_code=404, detail="면접 정보를 찾을 수 없습니다.")
    return interviews[interview_id]

@app.put("/api/interviews/{interview_id}/confirm")
def confirm_interview(interview_id: str):
    if interview_id not in interviews:
        raise HTTPException(status_code=404, detail="면접 정보를 찾을 수 없습니다.")
    interviews[interview_id]["confirmed"] = True
    interviews[interview_id]["confirmedAt"] = datetime.now().isoformat()
    return interviews[interview_id]

@app.get("/api/interviews")
def list_interviews():
    return list(interviews.values())

# Alba profile endpoints
@app.get("/api/alba/{alba_id}")
def get_alba_profile(alba_id: str):
    if alba_id not in alba_profiles:
        raise HTTPException(status_code=404, detail="알바생 프로필을 찾을 수 없습니다.")
    return alba_profiles[alba_id]

# Store profile endpoints
@app.get("/api/stores/{store_id}")
def get_store_profile(store_id: str):
    if store_id not in store_profiles:
        raise HTTPException(status_code=404, detail="매장 프로필을 찾을 수 없습니다.")
    return store_profiles[store_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
