import json
import os
import sqlite3
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="AlbaTrust API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "albatrust.db")


DEFAULT_ALBA_PROFILES = {
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


DEFAULT_STORE_PROFILES = {
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


class InterviewCreate(BaseModel):
    storeName: str
    albaName: str
    date: str
    time: str
    location: str
    notes: Optional[str] = ""


class AttendancePayload(BaseModel):
    present: bool
    method: str = "manual"


class InterviewConfirm(BaseModel):
    confirmed: bool = True


def _get_db() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    with _get_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS alba_profiles (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL UNIQUE,
              trustScore INTEGER NOT NULL,
              interviewAttendance INTEGER NOT NULL,
              totalInterviews INTEGER NOT NULL,
              badges TEXT NOT NULL,
              workHistory TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS store_profiles (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              trustScore INTEGER NOT NULL,
              category TEXT NOT NULL,
              address TEXT NOT NULL,
              wageComplaint INTEGER NOT NULL,
              reviews TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS interviews (
              id TEXT PRIMARY KEY,
              storeName TEXT NOT NULL,
              albaName TEXT NOT NULL,
              date TEXT NOT NULL,
              time TEXT NOT NULL,
              location TEXT NOT NULL,
              notes TEXT NOT NULL,
              confirmed INTEGER NOT NULL DEFAULT 0,
              confirmedAt TEXT,
              qrToken TEXT NOT NULL UNIQUE,
              nfcToken TEXT NOT NULL UNIQUE,
              attendance_present INTEGER,
              attendance_method TEXT,
              attendance_recordedAt TEXT,
              createdAt TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS attendance_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              interview_id TEXT NOT NULL,
              present INTEGER NOT NULL,
              method TEXT NOT NULL,
              recordedAt TEXT NOT NULL,
              FOREIGN KEY(interview_id) REFERENCES interviews(id)
            );

            CREATE TABLE IF NOT EXISTS scan_tokens (
              token TEXT PRIMARY KEY,
              interview_id TEXT NOT NULL,
              method TEXT NOT NULL,
              FOREIGN KEY(interview_id) REFERENCES interviews(id)
            );
            """
        )

        _seed_default_data(conn)


def _seed_default_data(conn: sqlite3.Connection):
    current_alba_count = conn.execute("SELECT COUNT(*) AS cnt FROM alba_profiles").fetchone()["cnt"]
    if current_alba_count == 0:
        for profile in DEFAULT_ALBA_PROFILES.values():
            conn.execute(
                """
                INSERT INTO alba_profiles (
                    id, name, trustScore, interviewAttendance, totalInterviews, badges, workHistory
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    profile["id"],
                    profile["name"],
                    profile["trustScore"],
                    profile["interviewAttendance"],
                    profile["totalInterviews"],
                    json.dumps(profile["badges"], ensure_ascii=False),
                    json.dumps(profile["workHistory"], ensure_ascii=False),
                ),
            )

    current_store_count = conn.execute("SELECT COUNT(*) AS cnt FROM store_profiles").fetchone()["cnt"]
    if current_store_count == 0:
        for profile in DEFAULT_STORE_PROFILES.values():
            conn.execute(
                """
                INSERT INTO store_profiles (
                    id, name, trustScore, category, address, wageComplaint, reviews
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    profile["id"],
                    profile["name"],
                    profile["trustScore"],
                    profile["category"],
                    profile["address"],
                    1 if profile["wageComplaint"] else 0,
                    json.dumps(profile["reviews"], ensure_ascii=False),
                ),
            )


def _to_bool(value: Optional[int]) -> Optional[bool]:
    if value is None:
        return None
    return bool(value)


def _serialize_attendance_history(interview_id: str, conn: Optional[sqlite3.Connection] = None) -> list[dict]:
    if conn is not None:
        rows = conn.execute(
            "SELECT present, method, recordedAt FROM attendance_history WHERE interview_id = ? ORDER BY id ASC",
            (interview_id,),
        ).fetchall()
        return [
            {
                "present": bool(row["present"]),
                "method": row["method"],
                "recordedAt": row["recordedAt"],
            }
            for row in rows
        ]

    with _get_db() as db_conn:
        rows = db_conn.execute(
            "SELECT present, method, recordedAt FROM attendance_history WHERE interview_id = ? ORDER BY id ASC",
            (interview_id,),
        ).fetchall()
        return [
            {
                "present": bool(row["present"]),
                "method": row["method"],
                "recordedAt": row["recordedAt"],
            }
            for row in rows
        ]


def _to_interview_payload(row: sqlite3.Row, conn: Optional[sqlite3.Connection] = None) -> dict:
    attendance_present = _to_bool(row["attendance_present"])
    return {
        "id": row["id"],
        "storeName": row["storeName"],
        "albaName": row["albaName"],
        "date": row["date"],
        "time": row["time"],
        "location": row["location"],
        "notes": row["notes"],
        "confirmed": bool(row["confirmed"]),
        "confirmedAt": row["confirmedAt"],
        "qrToken": row["qrToken"],
        "nfcToken": row["nfcToken"],
        "attendance": {
            "present": attendance_present,
            "method": row["attendance_method"],
            "recordedAt": row["attendance_recordedAt"],
        },
        "attendanceHistory": _serialize_attendance_history(row["id"], conn=conn),
        "createdAt": row["createdAt"],
    }


def _serialize_alba_profile(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "trustScore": row["trustScore"],
        "badges": json.loads(row["badges"]),
        "interviewAttendance": row["interviewAttendance"],
        "totalInterviews": row["totalInterviews"],
        "workHistory": json.loads(row["workHistory"]),
    }


def _serialize_store_profile(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "trustScore": row["trustScore"],
        "category": row["category"],
        "address": row["address"],
        "wageComplaint": bool(row["wageComplaint"]),
        "reviews": json.loads(row["reviews"]),
    }


def _get_profile_by_alba_name(alba_name: str) -> Optional[sqlite3.Row]:
    with _get_db() as conn:
        return conn.execute(
            "SELECT * FROM alba_profiles WHERE name = ?",
            (alba_name,),
        ).fetchone()


def _recalculate_trust_score(total_interviews: int, interview_attendance: int) -> int:
    total = max(total_interviews, 0)
    attendance = max(interview_attendance, 0)
    if total <= 0:
        return 100
    return max(0, min(100, int((attendance / total) * 100)))


def _update_profile_attendance(
    alba_name: str,
    previous_present: Optional[bool],
    next_present: bool,
    conn: Optional[sqlite3.Connection] = None,
):
    if conn is None:
        with _get_db() as sync_conn:
            return _update_profile_attendance(alba_name, previous_present, next_present, sync_conn)

    profile = conn.execute(
        "SELECT * FROM alba_profiles WHERE name = ?",
        (alba_name,),
    ).fetchone()
    if not profile:
        return

    total = profile["totalInterviews"]
    attended = profile["interviewAttendance"]

    if previous_present is None and next_present is not None:
        total += 1
        if next_present:
            attended += 1

    if previous_present is True and next_present is False:
        attended = max(attended - 1, 0)

    if previous_present is False and next_present is True:
        attended += 1

    trust_score = _recalculate_trust_score(total, attended)

    conn.execute(
        """
        UPDATE alba_profiles
        SET interviewAttendance = ?, totalInterviews = ?, trustScore = ?
        WHERE name = ?
        """,
        (attended, total, trust_score, alba_name),
    )


def _set_attendance(interview_id: str, payload: AttendancePayload) -> dict:
    with _get_db() as conn:
        interview = conn.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,)).fetchone()
        if not interview:
            raise HTTPException(status_code=404, detail="면접 정보를 찾을 수 없습니다.")

        if payload.method not in {"qr", "nfc", "manual"}:
            raise HTTPException(status_code=400, detail="지원하지 않는 출석 기록 방식입니다.")

        previous_present = _to_bool(interview["attendance_present"])
        next_present = bool(payload.present)

        if previous_present == next_present:
            return _to_interview_payload(interview, conn=conn)

        now = datetime.now().isoformat()
        conn.execute(
            """
            UPDATE interviews
            SET attendance_present = ?, attendance_method = ?, attendance_recordedAt = ?
            WHERE id = ?
            """,
            (
                1 if next_present else 0,
                payload.method,
                now,
                interview_id,
            ),
        )

        conn.execute(
            """
            INSERT INTO attendance_history (interview_id, present, method, recordedAt)
            VALUES (?, ?, ?, ?)
            """,
            (interview_id, 1 if next_present else 0, payload.method, now),
        )

        _update_profile_attendance(interview["albaName"], previous_present, next_present, conn)

        updated = conn.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,)).fetchone()
        return _to_interview_payload(updated, conn=conn)


def _scan_exists(token: str) -> Optional[sqlite3.Row]:
    with _get_db() as conn:
        return conn.execute(
            "SELECT * FROM scan_tokens WHERE token = ?",
            (token,),
        ).fetchone()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/interviews")
def create_interview(data: InterviewCreate):
    interview_id = str(uuid.uuid4())[:8]
    qr_token = f"qr-{uuid.uuid4().hex}"
    nfc_token = f"nfc-{uuid.uuid4().hex}"
    now = datetime.now().isoformat()

    with _get_db() as conn:
        conn.execute(
            """
            INSERT INTO interviews (
                id, storeName, albaName, date, time, location, notes,
                confirmed, confirmedAt, qrToken, nfcToken,
                attendance_present, attendance_method, attendance_recordedAt, createdAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, NULL, NULL, NULL, ?)
            """,
            (
                interview_id,
                data.storeName,
                data.albaName,
                data.date,
                data.time,
                data.location,
                data.notes,
                qr_token,
                nfc_token,
                now,
            ),
        )
        conn.execute(
            "INSERT INTO scan_tokens (token, interview_id, method) VALUES (?, ?, ?)",
            (qr_token, interview_id, "qr"),
        )
        conn.execute(
            "INSERT INTO scan_tokens (token, interview_id, method) VALUES (?, ?, ?)",
            (nfc_token, interview_id, "nfc"),
        )

        interview = conn.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,)).fetchone()
        return _to_interview_payload(interview)


@app.get("/api/interviews/{interview_id}")
def get_interview(interview_id: str):
    with _get_db() as conn:
        interview = conn.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,)).fetchone()
        if not interview:
            raise HTTPException(status_code=404, detail="면접 정보를 찾을 수 없습니다.")
        return _to_interview_payload(interview)


@app.put("/api/interviews/{interview_id}/confirm")
def confirm_interview(interview_id: str):
    now = datetime.now().isoformat()
    with _get_db() as conn:
        interview = conn.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,)).fetchone()
        if not interview:
            raise HTTPException(status_code=404, detail="면접 정보를 찾을 수 없습니다.")

        conn.execute(
            "UPDATE interviews SET confirmed = 1, confirmedAt = ? WHERE id = ?",
            (now, interview_id),
        )
        updated = conn.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,)).fetchone()
        return _to_interview_payload(updated)


@app.post("/api/interviews/{interview_id}/attendance")
def set_attendance(interview_id: str, payload: AttendancePayload):
    if payload.method not in {"qr", "nfc", "manual"}:
        raise HTTPException(status_code=400, detail="지원하지 않는 출석 기록 방식입니다.")
    return _set_attendance(interview_id, payload)


@app.post("/api/scans/{token}")
def scan_attendance(token: str):
    target = _scan_exists(token)
    if not target:
        raise HTTPException(status_code=404, detail="유효하지 않은 스캔 토큰입니다.")

    interview_id = target["interview_id"]
    with _get_db() as conn:
        interview = conn.execute(
            "SELECT attendance_present FROM interviews WHERE id = ?",
            (interview_id,),
        ).fetchone()
        if not interview:
            raise HTTPException(status_code=404, detail="면접 정보를 찾을 수 없습니다.")
        was_present = _to_bool(interview["attendance_present"])

    payload = AttendancePayload(present=True, method=target["method"])
    interview_payload = _set_attendance(interview_id, payload)

    return {
        "interview": interview_payload,
        "alreadyRecorded": was_present is True,
    }


@app.get("/api/interviews")
def list_interviews():
    with _get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM interviews ORDER BY createdAt DESC"
        ).fetchall()
        return [_to_interview_payload(row) for row in rows]


@app.get("/api/alba/{alba_id}")
def get_alba_profile(alba_id: str):
    with _get_db() as conn:
        profile = conn.execute(
            "SELECT * FROM alba_profiles WHERE id = ?",
            (alba_id,),
        ).fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="알바생 프로필을 찾을 수 없습니다.")
        return _serialize_alba_profile(profile)


@app.get("/api/stores/{store_id}")
def get_store_profile(store_id: str):
    with _get_db() as conn:
        profile = conn.execute(
            "SELECT * FROM store_profiles WHERE id = ?",
            (store_id,),
        ).fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="매장 프로필을 찾을 수 없습니다.")
        return _serialize_store_profile(profile)


_init_db()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
