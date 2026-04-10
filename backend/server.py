import os
import math
import hashlib
import secrets
import random
import string
import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional
from contextlib import asynccontextmanager

import bcrypt
import jwt
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "vocabulous")
JWT_SECRET = os.environ.get("JWT_SECRET", "vocabulous_ethereal_secret_2026_xk9m")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_col = db["users"]
classes_col = db["classes"]
enrollments_col = db["enrollments"]
decks_col = db["decks"]
cards_col = db["cards"]
reviews_col = db["reviews"]
card_states_col = db["card_states"]
achievements_col = db["achievements"]
user_achievements_col = db["user_achievements"]

# Counters for auto-increment IDs
counters_col = db["counters"]
blurting_col = db["blurting_sessions"]
ai_personas_col = db["ai_personas"]

def next_id(collection_name: str) -> int:
    result = counters_col.find_one_and_update(
        {"_id": collection_name},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    return result["seq"]

def generate_class_code() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


# ── FSRS-6 Implementation ──────────────────────────────────────────────────────
FSRS_DEFAULT_W = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]

def fsrs_initial_stability(grade: int, w: list) -> float:
    return max(0.1, w[0] + (grade - 1) * (w[1] - w[0]) / 3)

def fsrs_initial_difficulty(grade: int, w: list) -> float:
    return min(10, max(1, w[2] + (3 - grade) * w[3]))

def fsrs_next_difficulty(d: float, grade: int, w: list) -> float:
    delta = -(grade - 3) * w[4]
    new_d = d + delta * (1 - (1 / (1 + math.exp(-d))))
    return min(10, max(1, new_d))

def fsrs_next_stability(s: float, d: float, r: float, grade: int, w: list) -> float:
    if grade == 1:
        return max(0.1, w[5] * math.pow(d, -w[6]) * (math.pow(s + 1, w[7]) - 1) * math.exp((1 - r) * w[8]))
    else:
        return s * (1 + math.exp(w[9]) * (11 - d) * math.pow(s, -w[10]) * (math.exp((1 - r) * w[11]) - 1))

def fsrs_retrievability(s: float, elapsed_days: float) -> float:
    if s <= 0:
        return 0.0
    return math.pow(1 + elapsed_days / (9 * s), -1)

def compute_next_review(grade: int, stability: Optional[float], difficulty: Optional[float], elapsed_days: float, w: list = None):
    if w is None:
        w = FSRS_DEFAULT_W
    
    now = datetime.now(timezone.utc)
    
    if stability is None or difficulty is None:
        new_s = fsrs_initial_stability(grade, w)
        new_d = fsrs_initial_difficulty(grade, w)
    else:
        r = fsrs_retrievability(stability, elapsed_days) if elapsed_days > 0 else 0.9
        new_d = fsrs_next_difficulty(difficulty, grade, w)
        new_s = fsrs_next_stability(stability, new_d, r, grade, w)
    
    interval_days = max(1, round(new_s * 9 * (1 / 0.9 - 1) ** (-1 / 1)))
    next_review = now + timedelta(days=interval_days)
    
    return {
        "stability": round(new_s, 4),
        "difficulty": round(new_d, 4),
        "next_review_at": next_review.isoformat(),
        "interval_days": interval_days,
    }


# ── Seed Data ───────────────────────────────────────────────────────────────────
def seed_data():
    if users_col.count_documents({}) > 0:
        return
    
    # Reset counters
    for col_name in ["users", "classes", "enrollments", "decks", "cards", "reviews", "card_states", "achievements", "user_achievements"]:
        counters_col.update_one({"_id": col_name}, {"$set": {"seq": 0}}, upsert=True)
    
    # Create teacher
    teacher_pw = bcrypt.hashpw("teacher123".encode(), bcrypt.gensalt()).decode()
    teacher_id = next_id("users")
    users_col.insert_one({
        "id": teacher_id, "name": "Dr. Sarah Chen", "email": "teacher@vocabulous.app",
        "role": "teacher", "password_hash": teacher_pw,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Create student
    student_pw = bcrypt.hashpw("student123".encode(), bcrypt.gensalt()).decode()
    student_id = next_id("users")
    users_col.insert_one({
        "id": student_id, "name": "Alex Rivera", "email": "student@vocabulous.app",
        "role": "student", "password_hash": student_pw,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Create class
    class_id = next_id("classes")
    classes_col.insert_one({
        "id": class_id, "name": "AP Biology", "description": "Advanced Placement Biology",
        "subject": "Biology", "teacher_id": teacher_id,
        "class_code": "APBIO1",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Create second class
    class2_id = next_id("classes")
    classes_col.insert_one({
        "id": class2_id, "name": "World History", "description": "Modern World History",
        "subject": "History", "teacher_id": teacher_id,
        "class_code": "WHIST2",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Enroll student
    enrollments_col.insert_one({
        "id": next_id("enrollments"), "class_id": class_id, "student_id": student_id,
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
    })
    enrollments_col.insert_one({
        "id": next_id("enrollments"), "class_id": class2_id, "student_id": student_id,
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Create decks
    deck1_id = next_id("decks")
    decks_col.insert_one({
        "id": deck1_id, "name": "Cell Biology", "description": "Cell structure and function",
        "class_id": class_id, "teacher_id": teacher_id, "tags": ["biology", "cells"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    deck2_id = next_id("decks")
    decks_col.insert_one({
        "id": deck2_id, "name": "Genetics", "description": "DNA, RNA, and protein synthesis",
        "class_id": class_id, "teacher_id": teacher_id, "tags": ["biology", "genetics"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    deck3_id = next_id("decks")
    decks_col.insert_one({
        "id": deck3_id, "name": "World War II", "description": "Key events and figures",
        "class_id": class2_id, "teacher_id": teacher_id, "tags": ["history", "wwii"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Create cards for deck 1 (Cell Biology)
    cell_cards = [
        ("What is the powerhouse of the cell?", "Mitochondria", "Think about energy production", ["cells", "organelles"]),
        ("What is the function of the cell membrane?", "Controls what enters and exits the cell; selectively permeable barrier", "Think about a gatekeeper", ["cells", "membrane"]),
        ("What organelle contains digestive enzymes?", "Lysosome", "Think about recycling center", ["cells", "organelles"]),
        ("What is the function of the rough endoplasmic reticulum?", "Protein synthesis and modification; studded with ribosomes", "Has bumps on it", ["cells", "organelles"]),
        ("What is the difference between plant and animal cells?", "Plant cells have cell walls, chloroplasts, and a large central vacuole; animal cells do not", "Think about photosynthesis", ["cells", "comparison"]),
        ("What is osmosis?", "Movement of water across a semipermeable membrane from low to high solute concentration", "Water follows the salt", ["cells", "transport"]),
        ("What is the role of the nucleus?", "Contains DNA and controls cell activities; the control center of the cell", "Think about the brain of the cell", ["cells", "organelles"]),
        ("What is ATP?", "Adenosine triphosphate - the energy currency of the cell", "Energy money", ["cells", "energy"]),
    ]
    
    now = datetime.now(timezone.utc)
    for front, back, hint, tags in cell_cards:
        card_id = next_id("cards")
        cards_col.insert_one({
            "id": card_id, "deck_id": deck1_id, "front": front, "back": back,
            "hint": hint, "tags": tags, "status": "active",
            "created_at": now.isoformat(),
        })
    
    # Create cards for deck 2 (Genetics)
    genetics_cards = [
        ("What is DNA?", "Deoxyribonucleic acid - carries genetic information", "Double helix", ["genetics", "dna"]),
        ("What are the four DNA bases?", "Adenine (A), Thymine (T), Guanine (G), Cytosine (C)", "A-T and G-C pair together", ["genetics", "dna"]),
        ("What is a codon?", "A sequence of three nucleotides that codes for an amino acid", "Three letters = one amino acid", ["genetics", "translation"]),
        ("What is the central dogma of molecular biology?", "DNA -> RNA -> Protein", "Information flows one way", ["genetics", "central-dogma"]),
        ("What is a mutation?", "A change in the DNA sequence that may alter gene function", "Copying error", ["genetics", "mutation"]),
    ]
    
    for front, back, hint, tags in genetics_cards:
        card_id = next_id("cards")
        cards_col.insert_one({
            "id": card_id, "deck_id": deck2_id, "front": front, "back": back,
            "hint": hint, "tags": tags, "status": "active",
            "created_at": now.isoformat(),
        })
    
    # Create cards for deck 3 (WWII)
    wwii_cards = [
        ("When did World War II begin?", "September 1, 1939 - Germany invaded Poland", "Think about the invasion", ["history", "dates"]),
        ("What was D-Day?", "June 6, 1944 - Allied invasion of Normandy, France", "Largest amphibious invasion in history", ["history", "battles"]),
        ("Who were the Axis Powers?", "Germany, Italy, and Japan", "Three main countries", ["history", "alliances"]),
        ("What was the Manhattan Project?", "Secret US project to develop the atomic bomb", "Named after a borough", ["history", "technology"]),
    ]
    
    for front, back, hint, tags in wwii_cards:
        card_id = next_id("cards")
        cards_col.insert_one({
            "id": card_id, "deck_id": deck3_id, "front": front, "back": back,
            "hint": hint, "tags": tags, "status": "active",
            "created_at": now.isoformat(),
        })
    
    # Create some review history for the student
    all_cards = list(cards_col.find({"deck_id": {"$in": [deck1_id, deck2_id]}}))
    review_time = now - timedelta(days=5)
    
    for i, card in enumerate(all_cards[:8]):
        grade = 3 if i % 3 != 0 else 2
        recalled = grade >= 2
        review_id = next_id("reviews")
        
        result = compute_next_review(grade, None, None, 0)
        
        reviews_col.insert_one({
            "id": review_id, "student_id": student_id, "card_id": card["id"],
            "deck_id": card["deck_id"], "grade": grade, "recalled": recalled,
            "elapsed_days": 0, "reviewed_at": review_time.isoformat(),
        })
        
        card_states_col.update_one(
            {"student_id": student_id, "card_id": card["id"]},
            {"$set": {
                "student_id": student_id, "card_id": card["id"], "deck_id": card["deck_id"],
                "stability": result["stability"], "difficulty": result["difficulty"],
                "next_review_at": now.isoformat(),
                "last_reviewed_at": review_time.isoformat(),
                "review_count": 1, "lapses": 0 if recalled else 1,
            }},
            upsert=True,
        )
        review_time += timedelta(hours=12)
    
    # Seed achievements
    achievement_defs = [
        ("first_review", "First Steps", "Complete your first review", "streak", 1),
        ("streak_3", "On a Roll", "Maintain a 3-day streak", "streak", 3),
        ("streak_7", "Week Warrior", "Maintain a 7-day streak", "streak", 7),
        ("streak_30", "Monthly Master", "Maintain a 30-day streak", "streak", 30),
        ("reviews_10", "Getting Started", "Complete 10 reviews", "reviews", 10),
        ("reviews_50", "Dedicated Learner", "Complete 50 reviews", "reviews", 50),
        ("reviews_100", "Century Club", "Complete 100 reviews", "reviews", 100),
        ("mastered_5", "Knowledge Builder", "Master 5 cards", "mastery", 5),
        ("mastered_25", "Scholar", "Master 25 cards", "mastery", 25),
        ("mastered_100", "Sage", "Master 100 cards", "mastery", 100),
    ]
    
    for key, name, desc, category, target in achievement_defs:
        ach_id = next_id("achievements")
        achievements_col.insert_one({
            "id": ach_id, "key": key, "name": name, "description": desc,
            "category": category, "target_value": target,
            "created_at": now.isoformat(),
        })
    
    # Give student some achievements
    first_review = achievements_col.find_one({"key": "first_review"})
    if first_review:
        user_achievements_col.insert_one({
            "id": next_id("user_achievements"),
            "user_id": student_id, "achievement_id": first_review["id"],
            "earned_at": (now - timedelta(days=4)).isoformat(),
        })
    
    reviews_10 = achievements_col.find_one({"key": "reviews_10"})
    if reviews_10:
        user_achievements_col.insert_one({
            "id": next_id("user_achievements"),
            "user_id": student_id, "achievement_id": reviews_10["id"],
            "earned_at": (now - timedelta(days=2)).isoformat(),
        })


# ── JWT Helpers ─────────────────────────────────────────────────────────────────
def create_token(user_data: dict) -> str:
    payload = {
        "id": user_data["id"],
        "role": user_data["role"],
        "name": user_data["name"],
        "email": user_data["email"],
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("vocab_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        return None
    return decode_token(token)

def require_auth(request: Request) -> dict:
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


# ── Pydantic Models ─────────────────────────────────────────────────────────────
class SignupBody(BaseModel):
    name: str
    email: str
    password: str
    role: str

class LoginBody(BaseModel):
    email: str
    password: str

class CreateClassBody(BaseModel):
    name: str
    description: str = ""
    subject: str = ""
    teacher_id: int

class CreateDeckBody(BaseModel):
    name: str
    description: str = ""
    class_id: int
    teacher_id: int

class CreateCardBody(BaseModel):
    front: str
    back: str
    hint: str = ""
    tags: list = []

class SubmitReviewBody(BaseModel):
    student_id: int
    card_id: int
    deck_id: int
    grade: int

class UpdateCardBody(BaseModel):
    front: str = ""
    back: str = ""
    hint: str = ""
    tags: list = []

class EnrollBody(BaseModel):
    student_id: int

class JoinClassByCodeBody(BaseModel):
    class_code: str

class BlurtingSessionBody(BaseModel):
    student_id: int
    deck_id: int
    content: str

class UpdateSettingsBody(BaseModel):
    name: str = ""
    theme: str = ""

class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str


# ── App Setup ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_data()
    yield

app = FastAPI(title="Vocabulous API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Utility ─────────────────────────────────────────────────────────────────────
def serialize_doc(doc):
    if doc is None:
        return None
    d = {k: v for k, v in doc.items() if k != "_id"}
    return d

def serialize_list(docs):
    return [serialize_doc(d) for d in docs]


# ── Health ──────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "vocabulous-api"}


# ── Auth ────────────────────────────────────────────────────────────────────────
@app.post("/api/auth/signup")
def signup(body: SignupBody, response: Response):
    if body.role not in ("teacher", "student"):
        raise HTTPException(400, "Role must be 'teacher' or 'student'")
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    
    existing = users_col.find_one({"email": body.email})
    if existing:
        raise HTTPException(409, "An account with that email already exists")
    
    pw_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    user_id = next_id("users")
    user_doc = {
        "id": user_id, "name": body.name, "email": body.email,
        "role": body.role, "password_hash": pw_hash,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users_col.insert_one(user_doc)
    
    token = create_token(user_doc)
    response.set_cookie("vocab_token", token, httponly=True, samesite="lax", max_age=7*24*3600, path="/")
    return {"id": user_id, "name": body.name, "email": body.email, "role": body.role, "token": token}

@app.post("/api/auth/login")
def login(body: LoginBody, response: Response):
    user = users_col.find_one({"email": body.email})
    if not user:
        raise HTTPException(401, "Invalid email or password")
    
    if not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        raise HTTPException(401, "Invalid email or password")
    
    token = create_token(user)
    response.set_cookie("vocab_token", token, httponly=True, samesite="lax", max_age=7*24*3600, path="/")
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "token": token}

@app.get("/api/auth/me")
def get_me(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    return user

@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("vocab_token", path="/")
    return {"ok": True}


# ── Classes ─────────────────────────────────────────────────────────────────────
@app.get("/api/classes")
def list_classes(teacher_id: Optional[int] = None):
    query = {}
    if teacher_id:
        query["teacher_id"] = teacher_id
    
    classes = list(classes_col.find(query))
    result = []
    for cls in classes:
        enrollment_count = enrollments_col.count_documents({"class_id": cls["id"]})
        deck_count = decks_col.count_documents({"class_id": cls["id"]})
        teacher = users_col.find_one({"id": cls["teacher_id"]})
        result.append({
            **serialize_doc(cls),
            "teacher_name": teacher["name"] if teacher else None,
            "enrollment_count": enrollment_count,
            "deck_count": deck_count,
        })
    return result

@app.post("/api/classes")
def create_class(body: CreateClassBody):
    cls_id = next_id("classes")
    code = generate_class_code()
    doc = {
        "id": cls_id, "name": body.name, "description": body.description,
        "subject": body.subject, "teacher_id": body.teacher_id,
        "class_code": code,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    classes_col.insert_one(doc)
    return serialize_doc(doc)

@app.get("/api/classes/{class_id}")
def get_class(class_id: int):
    cls = classes_col.find_one({"id": class_id})
    if not cls:
        raise HTTPException(404, "Class not found")
    enrollment_count = enrollments_col.count_documents({"class_id": class_id})
    deck_count = decks_col.count_documents({"class_id": class_id})
    teacher = users_col.find_one({"id": cls["teacher_id"]})
    return {
        **serialize_doc(cls),
        "teacher_name": teacher["name"] if teacher else None,
        "enrollment_count": enrollment_count,
        "deck_count": deck_count,
    }

@app.post("/api/classes/{class_id}/enroll")
def enroll_student(class_id: int, body: EnrollBody):
    existing = enrollments_col.find_one({"class_id": class_id, "student_id": body.student_id})
    if existing:
        return serialize_doc(existing)
    enroll_id = next_id("enrollments")
    doc = {
        "id": enroll_id, "class_id": class_id, "student_id": body.student_id,
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
    }
    enrollments_col.insert_one(doc)
    return serialize_doc(doc)

@app.get("/api/classes/{class_id}/students")
def list_class_students(class_id: int):
    enrollments = list(enrollments_col.find({"class_id": class_id}))
    result = []
    for e in enrollments:
        student = users_col.find_one({"id": e["student_id"]})
        if not student:
            continue
        reviews = list(reviews_col.find({"student_id": e["student_id"]}))
        total_reviews = len(reviews)
        recalled = sum(1 for r in reviews if r.get("recalled"))
        avg_retention = recalled / total_reviews if total_reviews > 0 else None
        last_reviewed = max((r["reviewed_at"] for r in reviews), default=None) if reviews else None
        result.append({
            "student_id": student["id"], "student_name": student["name"],
            "student_email": student["email"], "enrolled_at": e["enrolled_at"],
            "total_reviews": total_reviews, "average_retention": avg_retention,
            "last_reviewed_at": last_reviewed,
        })
    return result

@app.get("/api/students/{student_id}/classes")
def list_student_classes(student_id: int):
    enrollments = list(enrollments_col.find({"student_id": student_id}))
    result = []
    for e in enrollments:
        cls = classes_col.find_one({"id": e["class_id"]})
        if not cls:
            continue
        teacher = users_col.find_one({"id": cls["teacher_id"]})
        deck_count = decks_col.count_documents({"class_id": cls["id"]})
        result.append({
            **serialize_doc(cls),
            "teacher_name": teacher["name"] if teacher else None,
            "deck_count": deck_count,
        })
    return result


# ── Decks ───────────────────────────────────────────────────────────────────────
@app.get("/api/decks")
def list_decks(class_id: Optional[int] = None, teacher_id: Optional[int] = None):
    query = {}
    if class_id:
        query["class_id"] = class_id
    if teacher_id:
        query["teacher_id"] = teacher_id
    
    decks = list(decks_col.find(query))
    result = []
    for deck in decks:
        card_count = cards_col.count_documents({"deck_id": deck["id"], "status": "active"})
        result.append({**serialize_doc(deck), "card_count": card_count})
    return result

@app.post("/api/decks")
def create_deck(body: CreateDeckBody):
    deck_id = next_id("decks")
    doc = {
        "id": deck_id, "name": body.name, "description": body.description,
        "class_id": body.class_id, "teacher_id": body.teacher_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    decks_col.insert_one(doc)
    return {**serialize_doc(doc), "card_count": 0}

@app.get("/api/decks/{deck_id}")
def get_deck(deck_id: int):
    deck = decks_col.find_one({"id": deck_id})
    if not deck:
        raise HTTPException(404, "Deck not found")
    card_count = cards_col.count_documents({"deck_id": deck_id, "status": "active"})
    return {**serialize_doc(deck), "card_count": card_count}

@app.delete("/api/decks/{deck_id}")
def delete_deck(deck_id: int):
    result = decks_col.delete_one({"id": deck_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Deck not found")
    cards_col.delete_many({"deck_id": deck_id})
    return {"ok": True}


# ── Cards ───────────────────────────────────────────────────────────────────────
@app.get("/api/decks/{deck_id}/cards")
def list_deck_cards(deck_id: int):
    cards = list(cards_col.find({"deck_id": deck_id, "status": "active"}))
    return serialize_list(cards)

@app.post("/api/decks/{deck_id}/cards")
def create_card(deck_id: int, body: CreateCardBody):
    card_id = next_id("cards")
    doc = {
        "id": card_id, "deck_id": deck_id, "front": body.front, "back": body.back,
        "hint": body.hint, "tags": body.tags, "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    cards_col.insert_one(doc)
    return serialize_doc(doc)

@app.get("/api/cards/{card_id}")
def get_card(card_id: int):
    card = cards_col.find_one({"id": card_id})
    if not card:
        raise HTTPException(404, "Card not found")
    return serialize_doc(card)

@app.delete("/api/cards/{card_id}")
def delete_card(card_id: int):
    result = cards_col.delete_one({"id": card_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Card not found")
    return {"ok": True}


# ── Reviews ─────────────────────────────────────────────────────────────────────
@app.post("/api/reviews")
def submit_review(body: SubmitReviewBody):
    now = datetime.now(timezone.utc)
    recalled = body.grade >= 2
    
    state = card_states_col.find_one({"student_id": body.student_id, "card_id": body.card_id})
    
    elapsed_days = 0
    if state and state.get("last_reviewed_at"):
        last = datetime.fromisoformat(state["last_reviewed_at"].replace("Z", "+00:00"))
        elapsed_days = (now - last).total_seconds() / 86400
    
    result = compute_next_review(
        body.grade,
        state.get("stability") if state else None,
        state.get("difficulty") if state else None,
        elapsed_days,
    )
    
    review_id = next_id("reviews")
    review_doc = {
        "id": review_id, "student_id": body.student_id, "card_id": body.card_id,
        "deck_id": body.deck_id, "grade": body.grade, "recalled": recalled,
        "elapsed_days": elapsed_days, "reviewed_at": now.isoformat(),
    }
    reviews_col.insert_one(review_doc)
    
    state_data = {
        "student_id": body.student_id, "card_id": body.card_id, "deck_id": body.deck_id,
        "stability": result["stability"], "difficulty": result["difficulty"],
        "next_review_at": result["next_review_at"],
        "last_reviewed_at": now.isoformat(),
        "review_count": (state["review_count"] + 1) if state else 1,
        "lapses": ((state.get("lapses", 0)) + (1 if not recalled else 0)) if state else (0 if recalled else 1),
    }
    
    card_states_col.update_one(
        {"student_id": body.student_id, "card_id": body.card_id},
        {"$set": state_data},
        upsert=True,
    )
    
    return serialize_doc(review_doc)


@app.get("/api/students/{student_id}/due-cards")
def get_due_cards(student_id: int, deck_id: Optional[int] = None):
    now = datetime.now(timezone.utc)
    
    # Get enrollments to find which decks this student has access to
    enrollments = list(enrollments_col.find({"student_id": student_id}))
    class_ids = [e["class_id"] for e in enrollments]
    
    deck_query = {"class_id": {"$in": class_ids}} if class_ids else {}
    if deck_id:
        deck_query["id"] = deck_id
    
    decks = list(decks_col.find(deck_query))
    deck_ids = [d["id"] for d in decks]
    
    if not deck_ids:
        return []
    
    all_cards = list(cards_col.find({"deck_id": {"$in": deck_ids}, "status": "active"}))
    
    result = []
    for card in all_cards:
        state = card_states_col.find_one({"student_id": student_id, "card_id": card["id"]})
        
        if state:
            next_rev = state.get("next_review_at")
            if next_rev:
                next_dt = datetime.fromisoformat(next_rev.replace("Z", "+00:00"))
                if next_dt > now:
                    continue
        
        predicted_retention = None
        if state and state.get("last_reviewed_at") and state.get("stability"):
            last = datetime.fromisoformat(state["last_reviewed_at"].replace("Z", "+00:00"))
            elapsed = (now - last).total_seconds() / 86400
            predicted_retention = round(fsrs_retrievability(state["stability"], elapsed), 4)
        
        result.append({
            "card_id": card["id"],
            "deck_id": card["deck_id"],
            "front": card["front"],
            "back": card["back"],
            "hint": card.get("hint", ""),
            "tags": card.get("tags", []),
            "is_new": state is None,
            "review_count": state["review_count"] if state else 0,
            "predicted_retention": predicted_retention,
        })
    
    result.sort(key=lambda x: (not x["is_new"], x.get("predicted_retention") or 0))
    return result[:50]


@app.get("/api/students/{student_id}/reviews")
def list_student_reviews(student_id: int, deck_id: Optional[int] = None, limit: int = 100):
    query = {"student_id": student_id}
    if deck_id:
        query["deck_id"] = deck_id
    reviews = list(reviews_col.find(query).sort("reviewed_at", -1).limit(limit))
    return serialize_list(reviews)


# ── Analytics ───────────────────────────────────────────────────────────────────
@app.get("/api/analytics/student/{student_id}")
def get_student_analytics(student_id: int):
    now = datetime.now(timezone.utc)
    student = users_col.find_one({"id": student_id})
    
    reviews = list(reviews_col.find({"student_id": student_id}))
    total_reviews = len(reviews)
    recalled = sum(1 for r in reviews if r.get("recalled"))
    avg_retention = recalled / total_reviews if total_reviews > 0 else None
    
    card_states = list(card_states_col.find({"student_id": student_id}))
    cards_mastered = sum(1 for s in card_states if (s.get("stability", 0) or 0) >= 21)
    cards_learning = len(card_states) - cards_mastered
    
    due_today = 0
    for s in card_states:
        if s.get("next_review_at"):
            next_dt = datetime.fromisoformat(s["next_review_at"].replace("Z", "+00:00"))
            if next_dt <= now:
                due_today += 1
    
    # Compute streak
    review_days = set()
    for r in reviews:
        dt = datetime.fromisoformat(r["reviewed_at"].replace("Z", "+00:00"))
        review_days.add(dt.strftime("%Y-%m-%d"))
    
    streak = 0
    check_date = now.date()
    while True:
        date_str = check_date.strftime("%Y-%m-%d")
        if date_str in review_days:
            streak += 1
            check_date -= timedelta(days=1)
        elif streak == 0:
            check_date -= timedelta(days=1)
            if check_date < now.date() - timedelta(days=1):
                break
        else:
            break
    
    # Deck progress
    enrollments = list(enrollments_col.find({"student_id": student_id}))
    class_ids = [e["class_id"] for e in enrollments]
    student_decks = list(decks_col.find({"class_id": {"$in": class_ids}})) if class_ids else []
    
    deck_progress = []
    for deck in student_decks:
        deck_cards = list(cards_col.find({"deck_id": deck["id"], "status": "active"}))
        total_cards = len(deck_cards)
        card_ids = [c["id"] for c in deck_cards]
        
        deck_states = list(card_states_col.find({"student_id": student_id, "card_id": {"$in": card_ids}}))
        mastered = sum(1 for s in deck_states if (s.get("stability", 0) or 0) >= 21)
        learning = len(deck_states) - mastered
        new_count = total_cards - len(deck_states)
        
        deck_due = 0
        for s in deck_states:
            if s.get("next_review_at"):
                next_dt = datetime.fromisoformat(s["next_review_at"].replace("Z", "+00:00"))
                if next_dt <= now:
                    deck_due += 1
        
        deck_progress.append({
            "deck_id": deck["id"], "deck_name": deck["name"],
            "total_cards": total_cards, "mastered": mastered,
            "learning": learning, "new": new_count, "due_today": deck_due,
        })
    
    return {
        "student_id": student_id,
        "student_name": student["name"] if student else "",
        "total_reviews": total_reviews,
        "cards_learning": cards_learning,
        "cards_mastered": cards_mastered,
        "average_retention": avg_retention,
        "current_streak": streak,
        "deck_progress": deck_progress,
    }


@app.get("/api/analytics/teacher/{teacher_id}")
def get_teacher_analytics(teacher_id: int):
    teacher_classes = list(classes_col.find({"teacher_id": teacher_id}))
    total_classes = len(teacher_classes)
    class_ids = [c["id"] for c in teacher_classes]
    
    total_students_set = set()
    total_decks = 0
    total_cards = 0
    total_reviews = 0
    
    class_breakdown = []
    for cls in teacher_classes:
        enrollments = list(enrollments_col.find({"class_id": cls["id"]}))
        student_ids = [e["student_id"] for e in enrollments]
        total_students_set.update(student_ids)
        
        deck_count = decks_col.count_documents({"class_id": cls["id"]})
        total_decks += deck_count
        
        decks = list(decks_col.find({"class_id": cls["id"]}))
        deck_ids = [d["id"] for d in decks]
        card_count = cards_col.count_documents({"deck_id": {"$in": deck_ids}}) if deck_ids else 0
        total_cards += card_count
        
        cls_reviews = list(reviews_col.find({"student_id": {"$in": student_ids}})) if student_ids else []
        cls_total_reviews = len(cls_reviews)
        total_reviews += cls_total_reviews
        cls_recalled = sum(1 for r in cls_reviews if r.get("recalled"))
        cls_retention = cls_recalled / cls_total_reviews if cls_total_reviews > 0 else None
        
        class_breakdown.append({
            "class_id": cls["id"], "class_name": cls["name"],
            "student_count": len(student_ids), "total_reviews": cls_total_reviews,
            "average_retention": cls_retention, "at_risk_count": 0,
        })
    
    avg_retention = None
    retentions = [c["average_retention"] for c in class_breakdown if c["average_retention"] is not None]
    if retentions:
        avg_retention = sum(retentions) / len(retentions)
    
    return {
        "teacher_id": teacher_id,
        "total_classes": total_classes,
        "total_students": len(total_students_set),
        "total_decks": total_decks,
        "total_cards": total_cards,
        "total_reviews": total_reviews,
        "average_class_retention": avg_retention,
        "class_breakdown": class_breakdown,
    }


@app.get("/api/students/{student_id}/knowledge-graph")
def get_knowledge_graph(student_id: int):
    now = datetime.now(timezone.utc)
    card_states = list(card_states_col.find({"student_id": student_id}))
    
    tag_map = {}
    for state in card_states:
        card = cards_col.find_one({"id": state["card_id"]})
        if not card:
            continue
        tags = card.get("tags", []) or ["untagged"]
        for tag in tags:
            if tag not in tag_map:
                tag_map[tag] = {"total": 0, "mastered": 0, "due": 0}
            tag_map[tag]["total"] += 1
            if (state.get("stability", 0) or 0) >= 21:
                tag_map[tag]["mastered"] += 1
            if state.get("next_review_at"):
                next_dt = datetime.fromisoformat(state["next_review_at"].replace("Z", "+00:00"))
                if next_dt <= now:
                    tag_map[tag]["due"] += 1
    
    result = []
    for tag, data in tag_map.items():
        mastery_pct = round((data["mastered"] / data["total"]) * 100) if data["total"] > 0 else 0
        result.append({
            "tag": tag, "total_cards": data["total"],
            "mastered_cards": data["mastered"], "due_cards": data["due"],
            "mastery_percent": mastery_pct,
        })
    
    result.sort(key=lambda x: x["mastery_percent"], reverse=True)
    return result


@app.get("/api/students/{student_id}/achievements")
def get_student_achievements(student_id: int):
    earned = []
    user_achs = list(user_achievements_col.find({"user_id": student_id}))
    for ua in user_achs:
        ach = achievements_col.find_one({"id": ua["achievement_id"]})
        if ach:
            earned.append({
                "id": ua["id"], "achievement_id": ua["achievement_id"],
                "earned_at": ua["earned_at"],
                "achievement": serialize_doc(ach),
            })
    
    all_achs = list(achievements_col.find({}))
    earned_ids = set(ua["achievement_id"] for ua in user_achs)
    locked = [serialize_doc(a) for a in all_achs if a["id"] not in earned_ids]
    
    return {"earned": earned, "locked": locked}


@app.get("/api/students/{student_id}/study-time")
def get_study_time(student_id: int):
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=now.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    reviews = list(reviews_col.find({
        "student_id": student_id,
        "reviewed_at": {"$gte": week_start.isoformat()},
    }))
    
    estimated_seconds = len(reviews) * 15
    hours = round(estimated_seconds / 3600, 1)
    
    return {"student_id": student_id, "hours_this_week": hours, "total_seconds_this_week": estimated_seconds}


@app.get("/api/teacher/{teacher_id}/milestones")
def get_teacher_milestones(teacher_id: int):
    return []


@app.get("/api/students/{student_id}/persona")
async def get_student_persona(student_id: int):
    # Check for cached persona (refresh weekly)
    existing = ai_personas_col.find_one({"student_id": student_id})
    now = datetime.now(timezone.utc)
    
    if existing:
        updated = datetime.fromisoformat(existing.get("updated_at", "2020-01-01").replace("Z", "+00:00"))
        if (now - updated).days < 7:
            return serialize_doc(existing)
    # Gather stats for AI prompt
    reviews = list(reviews_col.find({"student_id": student_id}))
    total = len(reviews)
    recalled = sum(1 for r in reviews if r.get("recalled"))
    avg_retention = recalled / total if total > 0 else 0
    avg_grade = sum(r.get("grade", 0) for r in reviews) / total if total > 0 else 0
    
    card_states = list(card_states_col.find({"student_id": student_id}))
    mastered = sum(1 for s in card_states if (s.get("stability", 0) or 0) >= 21)
    total_states = len(card_states)
    avg_reviews_per_card = sum(s.get("review_count", 0) for s in card_states) / total_states if total_states else 0
    
    student = users_col.find_one({"id": student_id})
    student_name = student["name"] if student else "Student"
    
    # Try AI-powered persona generation
    persona_data = None
    llm_key = os.environ.get("EMERGENT_LLM_KEY", "")
    
    if llm_key and total >= 1:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            prompt = f"""You are analyzing a student's spaced repetition learning data to generate a learning persona.

Student: {student_name}
Total reviews: {total}
Average retention: {round(avg_retention * 100)}%
Average grade (1=Again, 4=Easy): {round(avg_grade, 2)}
Cards mastered (stability >= 21 days): {mastered} of {total_states}
Average review count per card: {round(avg_reviews_per_card, 1)}

Generate a learning persona with the following JSON format. Respond with ONLY valid JSON, no markdown:
{{
  "persona_type": "one of: Sprinter, Marathoner, Deep Diver, Juggler, Perfectionist, Explorer",
  "persona_label": "a short catchy label like 'The Deep Diver'",
  "persona_description": "2-3 sentences describing this student's learning style based on the data",
  "grit_score": "integer from 1-100 representing persistence",
  "grit_label": "short label like 'High Persistence' or 'Building Momentum'",
  "flow_state": "one of: in_flow, approaching, warming_up, starting_out",
  "flow_label": "short label like 'In the Zone' or 'Finding Your Rhythm'"
}}"""
            
            chat = LlmChat(
                api_key=llm_key,
                session_id=f"persona-{student_id}-{now.strftime('%Y%m%d')}",
                system_message="You are a learning analytics AI. Always respond with valid JSON only."
            ).with_model("openai", "gpt-4.1-mini")
            
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse JSON from response
            text = response.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            persona_data = json.loads(text)
            persona_data["grit_score"] = int(persona_data.get("grit_score", 50))
        except Exception as e:
            print(f"AI persona generation failed: {e}")
            persona_data = None
    
    # Fallback to rule-based
    if not persona_data:
        if total >= 50 and avg_retention >= 0.8:
            persona_data = {"persona_type": "Deep Diver", "persona_label": "The Deep Diver", "persona_description": "You consistently demonstrate thorough understanding and strong recall. Your study patterns show deep engagement with the material.", "grit_score": 85, "grit_label": "High Persistence", "flow_state": "in_flow", "flow_label": "In the Zone"}
        elif total >= 20:
            persona_data = {"persona_type": "Marathoner", "persona_label": "The Marathoner", "persona_description": "You maintain a steady pace of learning with consistent practice sessions. Building strong foundations over time.", "grit_score": 65, "grit_label": "Steady Progress", "flow_state": "approaching", "flow_label": "Building Momentum"}
        elif total >= 5:
            persona_data = {"persona_type": "Explorer", "persona_label": "The Explorer", "persona_description": "You're actively discovering your learning patterns and building good study habits.", "grit_score": 45, "grit_label": "Building Momentum", "flow_state": "warming_up", "flow_label": "Finding Your Rhythm"}
        else:
            persona_data = {"persona_type": "Sprinter", "persona_label": "The Sprinter", "persona_description": "You're just getting started on your learning journey. Every review counts!", "grit_score": 25, "grit_label": "Getting Started", "flow_state": "starting_out", "flow_label": "Taking First Steps"}
    
    # Upsert into cache
    doc = {"student_id": student_id, **persona_data, "updated_at": now.isoformat()}
    if existing:
        ai_personas_col.update_one({"student_id": student_id}, {"$set": doc})
    else:
        ai_personas_col.insert_one(doc)
    
    return serialize_doc(ai_personas_col.find_one({"student_id": student_id}))


# ── Settings Endpoints ──────────────────────────────────────────────────────────
@app.get("/api/settings")
def get_settings(request: Request):
    user_jwt = get_current_user(request)
    if not user_jwt:
        raise HTTPException(401, "Authentication required")
    user = users_col.find_one({"id": user_jwt["id"]})
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "theme": user.get("theme", "light"),
    }

@app.patch("/api/settings")
def update_settings(body: UpdateSettingsBody, request: Request):
    user_jwt = get_current_user(request)
    if not user_jwt:
        raise HTTPException(401, "Authentication required")
    
    update = {}
    if body.name:
        update["name"] = body.name
    if body.theme in ("light", "dark"):
        update["theme"] = body.theme
    
    if update:
        users_col.update_one({"id": user_jwt["id"]}, {"$set": update})
    
    user = users_col.find_one({"id": user_jwt["id"]})
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "theme": user.get("theme", "light"),
    }

@app.post("/api/settings/password")
def change_password(body: ChangePasswordBody, request: Request):
    user_jwt = get_current_user(request)
    if not user_jwt:
        raise HTTPException(401, "Authentication required")
    
    user = users_col.find_one({"id": user_jwt["id"]})
    if not user:
        raise HTTPException(404, "User not found")
    
    if not bcrypt.checkpw(body.current_password.encode(), user["password_hash"].encode()):
        raise HTTPException(400, "Current password is incorrect")
    
    if len(body.new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")
    
    new_hash = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
    users_col.update_one({"id": user_jwt["id"]}, {"$set": {"password_hash": new_hash}})
    return {"message": "Password updated successfully"}



# ── Join Class by Code (Student Enrollment) ─────────────────────────────────────
@app.post("/api/classes/join")
def join_class_by_code(body: JoinClassByCodeBody, request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(401, "Authentication required")
    if user.get("role") != "student":
        raise HTTPException(403, "Only students can join classes")
    
    cls = classes_col.find_one({"class_code": body.class_code.upper().strip()})
    if not cls:
        raise HTTPException(404, "Invalid class code. Please check with your teacher.")
    
    existing = enrollments_col.find_one({"class_id": cls["id"], "student_id": user["id"]})
    if existing:
        return {"message": "Already enrolled", "class": serialize_doc(cls)}
    
    enroll_id = next_id("enrollments")
    enrollments_col.insert_one({
        "id": enroll_id, "class_id": cls["id"], "student_id": user["id"],
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
    })
    teacher = users_col.find_one({"id": cls["teacher_id"]})
    return {
        "message": "Successfully enrolled!",
        "class": {**serialize_doc(cls), "teacher_name": teacher["name"] if teacher else None},
    }


# ── Update Card ─────────────────────────────────────────────────────────────────
@app.patch("/api/cards/{card_id}")
def update_card(card_id: int, body: UpdateCardBody):
    card = cards_col.find_one({"id": card_id})
    if not card:
        raise HTTPException(404, "Card not found")
    
    update_data = {}
    if body.front:
        update_data["front"] = body.front
    if body.back:
        update_data["back"] = body.back
    if body.hint is not None:
        update_data["hint"] = body.hint
    if body.tags is not None:
        update_data["tags"] = body.tags
    
    if update_data:
        cards_col.update_one({"id": card_id}, {"$set": update_data})
    
    updated = cards_col.find_one({"id": card_id})
    return serialize_doc(updated)


# ── Teacher Student Heatmap ─────────────────────────────────────────────────────
@app.get("/api/analytics/teacher/{teacher_id}/heatmap")
def get_teacher_heatmap(teacher_id: int):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    teacher_classes = list(classes_col.find({"teacher_id": teacher_id}))
    class_ids = [c["id"] for c in teacher_classes]
    if not class_ids:
        return {"students": [], "dates": []}
    
    enrollments = list(enrollments_col.find({"class_id": {"$in": class_ids}}))
    student_ids = list(set(e["student_id"] for e in enrollments))
    if not student_ids:
        return {"students": [], "dates": []}
    
    students = list(users_col.find({"id": {"$in": student_ids}}))
    student_map = {s["id"]: s["name"] for s in students}
    
    reviews = list(reviews_col.find({
        "student_id": {"$in": student_ids},
        "reviewed_at": {"$gte": thirty_days_ago.isoformat()},
    }))
    
    dates = []
    for i in range(30):
        d = (now - timedelta(days=29 - i)).strftime("%Y-%m-%d")
        dates.append(d)
    
    heatmap_students = []
    for sid in student_ids:
        student_reviews = [r for r in reviews if r["student_id"] == sid]
        activity = {}
        for r in student_reviews:
            day = r["reviewed_at"][:10]
            if day not in activity:
                activity[day] = {"count": 0, "recalled": 0}
            activity[day]["count"] += 1
            if r.get("recalled"):
                activity[day]["recalled"] += 1
        
        days_data = []
        for d in dates:
            if d in activity:
                cnt = activity[d]["count"]
                rec = activity[d]["recalled"]
                retention = rec / cnt if cnt > 0 else 0
                days_data.append({"date": d, "reviews": cnt, "retention": round(retention, 2)})
            else:
                days_data.append({"date": d, "reviews": 0, "retention": 0})
        
        total = len(student_reviews)
        recalled = sum(1 for r in student_reviews if r.get("recalled"))
        
        heatmap_students.append({
            "student_id": sid,
            "student_name": student_map.get(sid, ""),
            "total_reviews": total,
            "avg_retention": round(recalled / total, 2) if total > 0 else 0,
            "days": days_data,
        })
    
    heatmap_students.sort(key=lambda x: x["avg_retention"], reverse=True)
    return {"students": heatmap_students, "dates": dates}


# ── Teacher Bottleneck Analysis ─────────────────────────────────────────────────
@app.get("/api/analytics/teacher/{teacher_id}/bottlenecks")
def get_teacher_bottlenecks(teacher_id: int):
    teacher_classes = list(classes_col.find({"teacher_id": teacher_id}))
    class_ids = [c["id"] for c in teacher_classes]
    if not class_ids:
        return {"struggle_cards": [], "tag_retention": [], "class_overdue": []}
    
    decks = list(decks_col.find({"class_id": {"$in": class_ids}}))
    deck_ids = [d["id"] for d in decks]
    deck_map = {d["id"]: d["name"] for d in decks}
    
    if not deck_ids:
        return {"struggle_cards": [], "tag_retention": [], "class_overdue": []}
    
    all_cards = list(cards_col.find({"deck_id": {"$in": deck_ids}, "status": "active"}))
    card_ids = [c["id"] for c in all_cards]
    card_map = {c["id"]: c for c in all_cards}
    
    reviews = list(reviews_col.find({"card_id": {"$in": card_ids}})) if card_ids else []
    
    card_stats = {}
    for r in reviews:
        cid = r["card_id"]
        if cid not in card_stats:
            card_stats[cid] = {"total": 0, "recalled": 0, "grade_sum": 0}
        card_stats[cid]["total"] += 1
        if r.get("recalled"):
            card_stats[cid]["recalled"] += 1
        card_stats[cid]["grade_sum"] += r.get("grade", 0)
    
    struggle_cards = []
    for cid, stats in card_stats.items():
        card = card_map.get(cid)
        if not card:
            continue
        recall_rate = stats["recalled"] / stats["total"] if stats["total"] > 0 else 0
        avg_grade = stats["grade_sum"] / stats["total"] if stats["total"] > 0 else 0
        struggle_cards.append({
            "card_id": cid,
            "deck_id": card["deck_id"],
            "deck_name": deck_map.get(card["deck_id"], ""),
            "front": card["front"],
            "back": card["back"],
            "tags": card.get("tags", []),
            "recall_rate": round(recall_rate, 2),
            "avg_grade": round(avg_grade, 2),
            "review_count": stats["total"],
        })
    
    struggle_cards.sort(key=lambda x: x["recall_rate"])
    
    tag_retention = {}
    for card in all_cards:
        cid = card["id"]
        stats = card_stats.get(cid)
        if not stats:
            continue
        for tag in (card.get("tags") or []):
            if tag not in tag_retention:
                tag_retention[tag] = {"total": 0, "recalled": 0, "card_count": 0}
            tag_retention[tag]["total"] += stats["total"]
            tag_retention[tag]["recalled"] += stats["recalled"]
            tag_retention[tag]["card_count"] += 1
    
    tag_list = []
    for tag, data in tag_retention.items():
        tag_list.append({
            "tag": tag,
            "avg_recall": round(data["recalled"] / data["total"], 2) if data["total"] > 0 else 0,
            "card_count": data["card_count"],
        })
    tag_list.sort(key=lambda x: x["avg_recall"])
    
    now = datetime.now(timezone.utc)
    class_overdue = []
    for cls in teacher_classes:
        class_decks = [d for d in decks if d["class_id"] == cls["id"]]
        class_deck_ids = [d["id"] for d in class_decks]
        overdue = 0
        if class_deck_ids:
            states = list(card_states_col.find({
                "deck_id": {"$in": class_deck_ids},
                "next_review_at": {"$lte": now.isoformat()},
            }))
            overdue = len(states)
        class_overdue.append({
            "class_id": cls["id"],
            "class_name": cls["name"],
            "overdue_count": overdue,
        })
    class_overdue.sort(key=lambda x: x["overdue_count"], reverse=True)
    
    return {
        "struggle_cards": struggle_cards[:20],
        "tag_retention": tag_list,
        "class_overdue": class_overdue,
    }


# ── Student Research Decks (Practice Mode) ──────────────────────────────────────
@app.get("/api/students/{student_id}/research-decks")
def get_research_decks(student_id: int):
    enrollments = list(enrollments_col.find({"student_id": student_id}))
    class_ids = [e["class_id"] for e in enrollments]
    if not class_ids:
        return []
    
    decks = list(decks_col.find({"class_id": {"$in": class_ids}}))
    result = []
    for deck in decks:
        card_count = cards_col.count_documents({"deck_id": deck["id"], "status": "active"})
        cls = classes_col.find_one({"id": deck["class_id"]})
        
        states = list(card_states_col.find({"student_id": student_id, "deck_id": deck["id"]}))
        mastered = sum(1 for s in states if (s.get("stability", 0) or 0) >= 21)
        mastery_pct = round(mastered / card_count, 2) if card_count > 0 else 0
        
        if mastered >= card_count * 0.8 and card_count > 0:
            mastery_level = "mastered"
        elif len(states) > 0:
            mastery_level = "learning"
        else:
            mastery_level = "new"
        
        all_tags = set()
        for card in cards_col.find({"deck_id": deck["id"]}):
            for t in (card.get("tags") or []):
                all_tags.add(t)
        
        result.append({
            "deck_id": deck["id"],
            "deck_name": deck["name"],
            "class_id": deck["class_id"],
            "class_name": cls["name"] if cls else None,
            "card_count": card_count,
            "mastery_pct": mastery_pct,
            "mastery_level": mastery_level,
            "tags": list(all_tags),
        })
    
    return result


# ── All Cards for a Deck (for practice mode, returns all, ignoring due dates) ──
@app.get("/api/students/{student_id}/practice-cards/{deck_id}")
def get_practice_cards(student_id: int, deck_id: int):
    cards = list(cards_col.find({"deck_id": deck_id, "status": "active"}))
    result = []
    for card in cards:
        result.append({
            "card_id": card["id"],
            "deck_id": card["deck_id"],
            "front": card["front"],
            "back": card["back"],
            "hint": card.get("hint", ""),
            "tags": card.get("tags", []),
            "is_new": False,
            "review_count": 0,
            "predicted_retention": None,
        })
    return result


# ── Blurting Sessions ───────────────────────────────────────────────────────────
@app.post("/api/blurting-sessions")
def create_blurting_session(body: BlurtingSessionBody):
    deck = decks_col.find_one({"id": body.deck_id})
    if not deck:
        raise HTTPException(404, "Deck not found")
    
    cards = list(cards_col.find({"deck_id": body.deck_id, "status": "active"}))
    all_terms = set()
    for card in cards:
        for word in card["back"].lower().split():
            clean = ''.join(c for c in word if c.isalnum())
            if len(clean) > 3:
                all_terms.add(clean)
        for word in card["front"].lower().split():
            clean = ''.join(c for c in word if c.isalnum())
            if len(clean) > 3:
                all_terms.add(clean)
    
    user_words = set()
    for word in body.content.lower().split():
        clean = ''.join(c for c in word if c.isalnum())
        if len(clean) > 3:
            user_words.add(clean)
    
    matched = user_words & all_terms
    total_terms = len(all_terms) if all_terms else 1
    coverage = round(len(matched) / total_terms, 2)
    
    missed_cards = []
    for card in cards:
        card_terms = set()
        for word in (card["back"].lower() + " " + card["front"].lower()).split():
            clean = ''.join(c for c in word if c.isalnum())
            if len(clean) > 3:
                card_terms.add(clean)
        if not (card_terms & user_words):
            missed_cards.append({"card_id": card["id"], "front": card["front"], "back": card["back"]})
    
    session_id = next_id("blurting_sessions")
    doc = {
        "id": session_id,
        "student_id": body.student_id,
        "deck_id": body.deck_id,
        "deck_name": deck["name"],
        "content": body.content,
        "coverage": coverage,
        "matched_terms": len(matched),
        "total_terms": len(all_terms),
        "missed_cards": missed_cards[:10],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    blurting_col.insert_one(doc)
    return serialize_doc(doc)


@app.get("/api/students/{student_id}/blurting-sessions")
def list_blurting_sessions(student_id: int):
    sessions = list(blurting_col.find({"student_id": student_id}).sort("created_at", -1).limit(20))
    return serialize_list(sessions)
