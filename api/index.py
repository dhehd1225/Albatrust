"""
AlbaTrust API — Vercel 서버리스 함수 진입점.

DB는 환경변수에 따라 자동 전환됩니다:
- POSTGRES_URL(또는 DATABASE_URL)이 있으면 PostgreSQL 사용 (Vercel 배포 환경)
- 없으면 로컬 SQLite 파일 사용 (로컬 개발)

로컬 실행:  uvicorn index:app --app-dir api --port 8000
"""
import json
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI(title="AlbaTrust API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 모든 엔드포인트는 이 라우터에 접두사 없이 정의하고, 아래에서 두 번 등록한다.
# - 로컬: 프론트가 /api/... 로 호출 → prefix="/api" 등록분이 처리
# - Vercel: routePrefix(/api)를 떼고 전달(root_path) → 접두사 없는 등록분이 처리
router = APIRouter()

# ---------------------------------------------------------------------------
# DB 추상화 (SQLite / PostgreSQL 공용)
# ---------------------------------------------------------------------------
DATABASE_URL = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL")
USE_PG = bool(DATABASE_URL)

# 로컬 SQLite 파일 경로 (PG 미사용 시).
# Vercel 서버리스는 파일시스템이 읽기 전용이라 /tmp 만 쓰기 가능하다.
_DEFAULT_DB = (
    "/tmp/albatrust.db"
    if os.environ.get("VERCEL")
    else os.path.join(os.path.dirname(__file__), "..", "backend", "data", "albatrust.db")
)
DB_PATH = os.environ.get("DATABASE_PATH", _DEFAULT_DB)


class CIRow(dict):
    """대소문자를 구분하지 않는 행(dict). PostgreSQL이 식별자를 소문자로 접는 문제를 흡수한다."""

    def __init__(self, items):
        super().__init__()
        for key, value in items:
            super().__setitem__(key.lower(), value)

    def __getitem__(self, key):
        return super().__getitem__(key.lower())

    def __contains__(self, key):
        return super().__contains__(key.lower())

    def get(self, key, default=None):
        return super().get(key.lower(), default)


class CursorWrap:
    """fetch 결과를 CIRow로 감싸 SQLite/PG 동일하게 동작하도록 한다."""

    def __init__(self, cursor):
        self.cursor = cursor

    def _cols(self):
        return [d[0] for d in self.cursor.description] if self.cursor.description else []

    def fetchone(self):
        row = self.cursor.fetchone()
        if row is None:
            return None
        return CIRow(zip(self._cols(), row))

    def fetchall(self):
        cols = self._cols()
        return [CIRow(zip(cols, row)) for row in self.cursor.fetchall()]


class DB:
    def __init__(self, raw, is_pg):
        self.raw = raw
        self.is_pg = is_pg

    def execute(self, sql, params=()):
        if self.is_pg:
            sql = sql.replace("?", "%s")
        if params:
            cursor = self.raw.execute(sql, params)
        else:
            cursor = self.raw.execute(sql)
        return CursorWrap(cursor)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            if exc_type is None:
                self.raw.commit()
            else:
                self.raw.rollback()
        finally:
            self.raw.close()


def _open_db() -> DB:
    if USE_PG:
        import psycopg

        return DB(psycopg.connect(DATABASE_URL), True)

    import sqlite3

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return DB(sqlite3.connect(DB_PATH), False)


_DB_READY = False


def _get_db() -> DB:
    """첫 사용 시 1회만 테이블을 보장한 뒤, 매번 새 연결을 돌려준다.

    import 시점이 아니라 첫 요청 때 초기화하므로, DB가 아직 없거나
    연결이 안 되어도 모듈 import(및 /api/health)는 실패하지 않는다.
    """
    global _DB_READY
    if not _DB_READY:
        with _open_db() as conn:
            for statement in SCHEMA:
                conn.execute(statement)
        _DB_READY = True
    return _open_db()


AUTO_PK = "SERIAL PRIMARY KEY" if USE_PG else "INTEGER PRIMARY KEY AUTOINCREMENT"

SCHEMA = [
    """
    CREATE TABLE IF NOT EXISTS alba_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      trustScore INTEGER NOT NULL,
      interviewAttendance INTEGER NOT NULL,
      totalInterviews INTEGER NOT NULL,
      badges TEXT NOT NULL,
      workHistory TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS store_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trustScore INTEGER NOT NULL,
      category TEXT NOT NULL,
      address TEXT NOT NULL,
      wageComplaint INTEGER NOT NULL,
      reviews TEXT NOT NULL
    )
    """,
    """
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
    )
    """,
    f"""
    CREATE TABLE IF NOT EXISTS attendance_history (
      id {AUTO_PK},
      interview_id TEXT NOT NULL,
      present INTEGER NOT NULL,
      method TEXT NOT NULL,
      recordedAt TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS scan_tokens (
      token TEXT PRIMARY KEY,
      interview_id TEXT NOT NULL,
      method TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS work_shifts (
      id TEXT PRIMARY KEY,
      albaName TEXT NOT NULL,
      storeName TEXT NOT NULL,
      hourlyWage INTEGER NOT NULL,
      clockIn TEXT NOT NULL,
      clockOut TEXT,
      createdAt TEXT NOT NULL,
      workplace_id TEXT,
      member_id TEXT
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS workplaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ownerName TEXT NOT NULL,
      hourlyWage INTEGER NOT NULL,
      inviteCode TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS workplace_members (
      id TEXT PRIMARY KEY,
      workplace_id TEXT NOT NULL,
      albaName TEXT NOT NULL,
      hourlyWage INTEGER,
      joinedAt TEXT NOT NULL,
      scheduledStart TEXT,
      scheduledEnd TEXT,
      workDays TEXT
    )
    """,
]


# ---------------------------------------------------------------------------
# Pydantic 모델
# ---------------------------------------------------------------------------
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


# 2026년 최저시급 (원/시간)
DEFAULT_HOURLY_WAGE = 10320

# 주휴수당 지급 기준: 1주 소정근로시간 (분)
WEEKLY_HOLIDAY_THRESHOLD_MINUTES = 15 * 60


class WorkplaceCreate(BaseModel):
    name: str
    ownerName: str


class MemberCreate(BaseModel):
    albaName: str
    hourlyWage: int = DEFAULT_HOURLY_WAGE
    scheduledStart: str = "09:00"
    scheduledEnd: str = "18:00"
    workDays: list[int] = [1, 2, 3, 4, 5]  # 0=일 ... 6=토


class JoinWorkplace(BaseModel):
    inviteCode: str
    albaName: str


# ---------------------------------------------------------------------------
# 직렬화 / 헬퍼
# ---------------------------------------------------------------------------
def _to_bool(value: Optional[int]) -> Optional[bool]:
    if value is None:
        return None
    return bool(value)


def _serialize_attendance_history(interview_id: str, conn: Optional[DB] = None) -> list[dict]:
    def _run(db: DB):
        rows = db.execute(
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

    if conn is not None:
        return _run(conn)
    with _get_db() as db_conn:
        return _run(db_conn)


def _to_interview_payload(row, conn: Optional[DB] = None) -> dict:
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


def _serialize_alba_profile(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "trustScore": row["trustScore"],
        "badges": json.loads(row["badges"]),
        "interviewAttendance": row["interviewAttendance"],
        "totalInterviews": row["totalInterviews"],
        "workHistory": json.loads(row["workHistory"]),
    }


def _serialize_store_profile(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "trustScore": row["trustScore"],
        "category": row["category"],
        "address": row["address"],
        "wageComplaint": bool(row["wageComplaint"]),
        "reviews": json.loads(row["reviews"]),
    }


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
    conn: Optional[DB] = None,
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
            (1 if next_present else 0, payload.method, now, interview_id),
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


def _serialize_shift(row) -> dict:
    clock_in_dt = datetime.fromisoformat(row["clockIn"])
    if row["clockOut"]:
        end_dt = datetime.fromisoformat(row["clockOut"])
        ongoing = False
    else:
        end_dt = datetime.now()
        ongoing = True

    worked_minutes = max(0, int((end_dt - clock_in_dt).total_seconds() // 60))
    wage = round(worked_minutes / 60 * row["hourlyWage"])

    return {
        "id": row["id"],
        "albaName": row["albaName"],
        "storeName": row["storeName"],
        "hourlyWage": row["hourlyWage"],
        "clockIn": row["clockIn"],
        "clockOut": row["clockOut"],
        "ongoing": ongoing,
        "workedMinutes": worked_minutes,
        "wage": wage,
        "memberId": row["member_id"] if "member_id" in row else None,
        "createdAt": row["createdAt"],
    }


def _scan_exists(token: str):
    with _get_db() as conn:
        return conn.execute(
            "SELECT * FROM scan_tokens WHERE token = ?",
            (token,),
        ).fetchone()


def _hhmm_to_minutes(value: Optional[str], default: int) -> int:
    if not value:
        return default
    try:
        hour, minute = value.split(":")
        return int(hour) * 60 + int(minute)
    except (ValueError, AttributeError):
        return default


def _member_workdays(member) -> list[int]:
    raw = member["workDays"] if "workDays" in member else None
    if not raw:
        return [1, 2, 3, 4, 5]
    try:
        days = json.loads(raw)
        return [int(d) for d in days]
    except (ValueError, TypeError):
        return [1, 2, 3, 4, 5]


def _member_schedule(member) -> dict:
    """알바생의 소정근로시간(예정 근무)과 주휴수당을 계산한다."""
    start = member["scheduledStart"] or "09:00"
    end = member["scheduledEnd"] or "18:00"
    days = _member_workdays(member)
    daily_minutes = max(0, _hhmm_to_minutes(end, 1080) - _hhmm_to_minutes(start, 540))
    weekly_minutes = daily_minutes * len(days)
    return {
        "scheduledStart": start,
        "scheduledEnd": end,
        "workDays": days,
        "scheduledDailyMinutes": daily_minutes,
        "scheduledWeeklyMinutes": weekly_minutes,
        "weeklyHours": round(weekly_minutes / 60, 1),
    }


def _generate_invite_code(conn: DB) -> str:
    while True:
        code = uuid.uuid4().hex[:6].upper()
        exists = conn.execute(
            "SELECT 1 FROM workplaces WHERE inviteCode = ?", (code,)
        ).fetchone()
        if not exists:
            return code


def _member_effective_wage(member, workplace) -> int:
    return member["hourlyWage"] if member["hourlyWage"] is not None else workplace["hourlyWage"]


def _member_stats(member, workplace, conn: DB) -> dict:
    shift_rows = conn.execute(
        "SELECT * FROM work_shifts WHERE member_id = ? ORDER BY clockIn DESC",
        (member["id"],),
    ).fetchall()
    shifts = [_serialize_shift(row) for row in shift_rows]
    wage = _member_effective_wage(member, workplace)
    schedule = _member_schedule(member)

    # 주휴수당: 1주 소정근로시간 15시간 이상이면 (주 소정근로시간 ÷ 40 × 8) × 시급
    weekly_minutes = schedule["scheduledWeeklyMinutes"]
    eligible = weekly_minutes >= WEEKLY_HOLIDAY_THRESHOLD_MINUTES
    capped = min(weekly_minutes, 40 * 60)
    holiday_pay = round(capped / (40 * 60) * 8 * wage) if eligible else 0

    return {
        "id": member["id"],
        "albaName": member["albaName"],
        "hourlyWage": wage,
        "joinedAt": member["joinedAt"],
        **schedule,
        "holidayEligible": eligible,
        "holidayPay": holiday_pay,
        "working": any(s["ongoing"] for s in shifts),
        "shiftCount": len(shifts),
        "totalMinutes": sum(s["workedMinutes"] for s in shifts),
        "totalWage": sum(s["wage"] for s in shifts),
    }


def _serialize_workplace(row, conn: DB) -> dict:
    member_count = conn.execute(
        "SELECT COUNT(*) AS cnt FROM workplace_members WHERE workplace_id = ?",
        (row["id"],),
    ).fetchone()["cnt"]
    return {
        "id": row["id"],
        "name": row["name"],
        "ownerName": row["ownerName"],
        "hourlyWage": row["hourlyWage"],
        "inviteCode": row["inviteCode"],
        "createdAt": row["createdAt"],
        "memberCount": member_count,
    }


def _serialize_workplace_detail(row, conn: DB) -> dict:
    detail = _serialize_workplace(row, conn)
    member_rows = conn.execute(
        "SELECT * FROM workplace_members WHERE workplace_id = ? ORDER BY joinedAt ASC",
        (row["id"],),
    ).fetchall()
    shift_rows = conn.execute(
        "SELECT * FROM work_shifts WHERE workplace_id = ? ORDER BY clockIn DESC",
        (row["id"],),
    ).fetchall()

    schedule_by_member = {member["id"]: _member_schedule(member) for member in member_rows}

    shifts = []
    for shift_row in shift_rows:
        shift = _serialize_shift(shift_row)
        schedule = schedule_by_member.get(shift["memberId"])
        if schedule:
            start_min = _hhmm_to_minutes(schedule["scheduledStart"], 540)
            end_min = _hhmm_to_minutes(schedule["scheduledEnd"], 1080)
            clock_in_dt = datetime.fromisoformat(shift["clockIn"])
            shift["lateMinutes"] = max(0, (clock_in_dt.hour * 60 + clock_in_dt.minute) - start_min)
            if shift["clockOut"]:
                clock_out_dt = datetime.fromisoformat(shift["clockOut"])
                shift["earlyLeaveMinutes"] = max(
                    0, end_min - (clock_out_dt.hour * 60 + clock_out_dt.minute)
                )
            else:
                shift["earlyLeaveMinutes"] = 0
        else:
            shift["lateMinutes"] = 0
            shift["earlyLeaveMinutes"] = 0
        shifts.append(shift)

    detail["members"] = [_member_stats(member, row, conn) for member in member_rows]
    detail["shifts"] = shifts
    return detail


def _get_workplace_or_404(conn: DB, workplace_id: str):
    workplace = conn.execute(
        "SELECT * FROM workplaces WHERE id = ?", (workplace_id,)
    ).fetchone()
    if not workplace:
        raise HTTPException(status_code=404, detail="가게를 찾을 수 없습니다.")
    return workplace


def _get_member_or_404(conn: DB, workplace_id: str, member_id: str):
    member = conn.execute(
        "SELECT * FROM workplace_members WHERE id = ? AND workplace_id = ?",
        (member_id, workplace_id),
    ).fetchone()
    if not member:
        raise HTTPException(status_code=404, detail="알바생을 찾을 수 없습니다.")
    return member


# ---------------------------------------------------------------------------
# 엔드포인트
# ---------------------------------------------------------------------------
@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/interviews")
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
        return _to_interview_payload(interview, conn=conn)


@router.get("/interviews/{interview_id}")
def get_interview(interview_id: str):
    with _get_db() as conn:
        interview = conn.execute("SELECT * FROM interviews WHERE id = ?", (interview_id,)).fetchone()
        if not interview:
            raise HTTPException(status_code=404, detail="면접 정보를 찾을 수 없습니다.")
        return _to_interview_payload(interview, conn=conn)


@router.put("/interviews/{interview_id}/confirm")
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
        return _to_interview_payload(updated, conn=conn)


@router.post("/interviews/{interview_id}/attendance")
def set_attendance(interview_id: str, payload: AttendancePayload):
    if payload.method not in {"qr", "nfc", "manual"}:
        raise HTTPException(status_code=400, detail="지원하지 않는 출석 기록 방식입니다.")
    return _set_attendance(interview_id, payload)


@router.post("/scans/{token}")
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


@router.get("/interviews")
def list_interviews():
    with _get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM interviews ORDER BY createdAt DESC"
        ).fetchall()
        return [_to_interview_payload(row, conn=conn) for row in rows]


@router.get("/alba/{alba_id}")
def get_alba_profile(alba_id: str):
    with _get_db() as conn:
        profile = conn.execute(
            "SELECT * FROM alba_profiles WHERE id = ?",
            (alba_id,),
        ).fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="알바생 프로필을 찾을 수 없습니다.")
        return _serialize_alba_profile(profile)


@router.get("/stores/{store_id}")
def get_store_profile(store_id: str):
    with _get_db() as conn:
        profile = conn.execute(
            "SELECT * FROM store_profiles WHERE id = ?",
            (store_id,),
        ).fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="매장 프로필을 찾을 수 없습니다.")
        return _serialize_store_profile(profile)


@router.post("/workplaces")
def create_workplace(data: WorkplaceCreate):
    name = data.name.strip()
    owner = data.ownerName.strip()
    if not name or not owner:
        raise HTTPException(status_code=400, detail="가게 이름과 사장님 이름을 입력해주세요.")

    workplace_id = str(uuid.uuid4())[:8]
    now = datetime.now().isoformat()
    with _get_db() as conn:
        invite_code = _generate_invite_code(conn)
        conn.execute(
            """
            INSERT INTO workplaces (id, name, ownerName, hourlyWage, inviteCode, createdAt)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (workplace_id, name, owner, DEFAULT_HOURLY_WAGE, invite_code, now),
        )
        workplace = conn.execute(
            "SELECT * FROM workplaces WHERE id = ?", (workplace_id,)
        ).fetchone()
        return _serialize_workplace_detail(workplace, conn)


@router.get("/workplaces")
def list_workplaces(owner: Optional[str] = None):
    with _get_db() as conn:
        if owner:
            rows = conn.execute(
                "SELECT * FROM workplaces WHERE ownerName = ? ORDER BY createdAt DESC",
                (owner,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM workplaces ORDER BY createdAt DESC"
            ).fetchall()
        return [_serialize_workplace(row, conn) for row in rows]


@router.get("/workplaces/{workplace_id}")
def get_workplace(workplace_id: str):
    with _get_db() as conn:
        workplace = _get_workplace_or_404(conn, workplace_id)
        return _serialize_workplace_detail(workplace, conn)


@router.delete("/workplaces/{workplace_id}")
def delete_workplace(workplace_id: str):
    with _get_db() as conn:
        _get_workplace_or_404(conn, workplace_id)
        conn.execute("DELETE FROM work_shifts WHERE workplace_id = ?", (workplace_id,))
        conn.execute("DELETE FROM workplace_members WHERE workplace_id = ?", (workplace_id,))
        conn.execute("DELETE FROM workplaces WHERE id = ?", (workplace_id,))
        return {"deleted": True}


@router.post("/workplaces/{workplace_id}/members")
def add_member(workplace_id: str, data: MemberCreate):
    alba_name = data.albaName.strip()
    if not alba_name:
        raise HTTPException(status_code=400, detail="알바생 이름을 입력해주세요.")
    if data.hourlyWage <= 0:
        raise HTTPException(status_code=400, detail="시급을 올바르게 입력해주세요.")
    if not data.workDays:
        raise HTTPException(status_code=400, detail="근무 요일을 1개 이상 선택해주세요.")
    if _hhmm_to_minutes(data.scheduledEnd, 1080) <= _hhmm_to_minutes(data.scheduledStart, 540):
        raise HTTPException(status_code=400, detail="퇴근 시간은 출근 시간보다 늦어야 합니다.")

    now = datetime.now().isoformat()
    with _get_db() as conn:
        _get_workplace_or_404(conn, workplace_id)
        existing = conn.execute(
            "SELECT 1 FROM workplace_members WHERE workplace_id = ? AND albaName = ?",
            (workplace_id, alba_name),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="이미 초대된 알바생입니다.")

        member_id = str(uuid.uuid4())[:8]
        conn.execute(
            """
            INSERT INTO workplace_members
                (id, workplace_id, albaName, hourlyWage, scheduledStart, scheduledEnd, workDays, joinedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                member_id,
                workplace_id,
                alba_name,
                data.hourlyWage,
                data.scheduledStart,
                data.scheduledEnd,
                json.dumps(sorted(set(data.workDays))),
                now,
            ),
        )
        workplace = conn.execute(
            "SELECT * FROM workplaces WHERE id = ?", (workplace_id,)
        ).fetchone()
        return _serialize_workplace_detail(workplace, conn)


@router.delete("/workplaces/{workplace_id}/members/{member_id}")
def remove_member(workplace_id: str, member_id: str):
    with _get_db() as conn:
        workplace = _get_workplace_or_404(conn, workplace_id)
        _get_member_or_404(conn, workplace_id, member_id)
        conn.execute("DELETE FROM work_shifts WHERE member_id = ?", (member_id,))
        conn.execute("DELETE FROM workplace_members WHERE id = ?", (member_id,))
        return _serialize_workplace_detail(workplace, conn)


@router.post("/workplaces/{workplace_id}/members/{member_id}/clock-in")
def member_clock_in(workplace_id: str, member_id: str):
    now = datetime.now().isoformat()
    with _get_db() as conn:
        workplace = _get_workplace_or_404(conn, workplace_id)
        member = _get_member_or_404(conn, workplace_id, member_id)

        open_shift = conn.execute(
            "SELECT id FROM work_shifts WHERE member_id = ? AND clockOut IS NULL",
            (member_id,),
        ).fetchone()
        if open_shift:
            raise HTTPException(status_code=400, detail="이미 출근 중입니다. 먼저 퇴근을 찍어주세요.")

        shift_id = str(uuid.uuid4())[:8]
        conn.execute(
            """
            INSERT INTO work_shifts (
                id, albaName, storeName, hourlyWage, clockIn, clockOut, createdAt,
                workplace_id, member_id
            )
            VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?)
            """,
            (
                shift_id,
                member["albaName"],
                workplace["name"],
                _member_effective_wage(member, workplace),
                now,
                now,
                workplace_id,
                member_id,
            ),
        )
        return _serialize_workplace_detail(workplace, conn)


@router.post("/workplaces/{workplace_id}/members/{member_id}/clock-out")
def member_clock_out(workplace_id: str, member_id: str):
    now = datetime.now().isoformat()
    with _get_db() as conn:
        workplace = _get_workplace_or_404(conn, workplace_id)
        _get_member_or_404(conn, workplace_id, member_id)

        open_shift = conn.execute(
            "SELECT * FROM work_shifts WHERE member_id = ? AND clockOut IS NULL ORDER BY clockIn DESC LIMIT 1",
            (member_id,),
        ).fetchone()
        if not open_shift:
            raise HTTPException(status_code=400, detail="출근 기록이 없습니다. 먼저 출근을 찍어주세요.")

        conn.execute(
            "UPDATE work_shifts SET clockOut = ? WHERE id = ?",
            (now, open_shift["id"]),
        )
        return _serialize_workplace_detail(workplace, conn)


@router.post("/workplaces/join")
def join_workplace(data: JoinWorkplace):
    invite_code = data.inviteCode.strip().upper()
    alba_name = data.albaName.strip()
    if not invite_code or not alba_name:
        raise HTTPException(status_code=400, detail="초대코드와 이름을 입력해주세요.")

    now = datetime.now().isoformat()
    with _get_db() as conn:
        workplace = conn.execute(
            "SELECT * FROM workplaces WHERE inviteCode = ?", (invite_code,)
        ).fetchone()
        if not workplace:
            raise HTTPException(status_code=404, detail="유효하지 않은 초대코드입니다.")

        existing = conn.execute(
            "SELECT 1 FROM workplace_members WHERE workplace_id = ? AND albaName = ?",
            (workplace["id"], alba_name),
        ).fetchone()
        if not existing:
            member_id = str(uuid.uuid4())[:8]
            conn.execute(
                """
                INSERT INTO workplace_members
                    (id, workplace_id, albaName, hourlyWage, scheduledStart, scheduledEnd, workDays, joinedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    member_id,
                    workplace["id"],
                    alba_name,
                    DEFAULT_HOURLY_WAGE,
                    "09:00",
                    "18:00",
                    json.dumps([1, 2, 3, 4, 5]),
                    now,
                ),
            )

        return _serialize_workplace_detail(workplace, conn)


# 라우터를 두 경로 모두에 등록 (로컬 /api/... 과 Vercel root_path 둘 다 호환)
app.include_router(router)
app.include_router(router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
