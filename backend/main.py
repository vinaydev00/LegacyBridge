from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import uvicorn
import os
import sys
import shutil

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline import LegacyBridgePipeline
from database.models import create_tables, get_db, User, Translation
from auth import hash_password, verify_password, create_access_token, get_current_user

app = FastAPI(
    title="LegacyBridge API",
    description="AI-powered COBOL to modern Python API translator",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("uploaded_files", exist_ok=True)
os.makedirs("generated_apis", exist_ok=True)

create_tables()
pipeline = LegacyBridgePipeline()

# ─────────────────────────────────────────
# SCHEMAS — Request/Response models
# ─────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ─────────────────────────────────────────
# ENDPOINT 1 — Health Check
# ─────────────────────────────────────────
@app.get("/")
def health_check():
    return {
        "status": "running",
        "message": "LegacyBridge API v2.0 is live!",
    }

# ─────────────────────────────────────────
# ENDPOINT 2 — Register
# ─────────────────────────────────────────
@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        name=request.name,
        email=request.email,
        hashed_password=hash_password(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Return token immediately so user is logged in
    token = create_access_token({"sub": user.email})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }

# ─────────────────────────────────────────
# ENDPOINT 3 — Login
# ─────────────────────────────────────────
@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }

# ─────────────────────────────────────────
# ENDPOINT 4 — Get Current User
# ─────────────────────────────────────────
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at
    }

# ─────────────────────────────────────────
# ENDPOINT 5 — Translate COBOL
# ─────────────────────────────────────────
@app.post("/translate")
async def translate_cobol(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith('.cbl') and not file.filename.endswith('.cbl.txt'):
        raise HTTPException(status_code=400, detail="Only .cbl COBOL files are accepted")

    file_path = f"uploaded_files/{file.filename.replace('.txt', '')}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = pipeline.run(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Save to database
    translation = Translation(
        filename=file.filename,
        program_name=result["program_name"],
        understanding=result["understanding"],
        generated_code=result["generated_code"],
        confidence_score=result["confidence_score"],
        user_id=current_user.id
    )
    db.add(translation)
    db.commit()
    db.refresh(translation)

    return {
        "success": True,
        "id": translation.id,
        "program_name": result["program_name"],
        "understanding": result["understanding"],
        "generated_code": result["generated_code"],
        "confidence_score": result["confidence_score"],
        "created_at": translation.created_at
    }

# ─────────────────────────────────────────
# ENDPOINT 6 — Get History
# ─────────────────────────────────────────
@app.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    translations = db.query(Translation).filter(
        Translation.user_id == current_user.id
    ).order_by(Translation.created_at.desc()).all()

    return {
        "total": len(translations),
        "translations": [
            {
                "id": t.id,
                "filename": t.filename,
                "program_name": t.program_name,
                "confidence_score": t.confidence_score,
                "understanding": t.understanding,
                "generated_code": t.generated_code,
                "created_at": t.created_at
            }
            for t in translations
        ]
    }

# ─────────────────────────────────────────
# ENDPOINT 7 — Delete Translation
# ─────────────────────────────────────────
@app.delete("/history/{id}")
def delete_translation(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    translation = db.query(Translation).filter(
        Translation.id == id,
        Translation.user_id == current_user.id
    ).first()

    if not translation:
        raise HTTPException(status_code=404, detail="Translation not found")

    db.delete(translation)
    db.commit()
    return {"success": True, "message": "Translation deleted"}

# ─────────────────────────────────────────
# ENDPOINT 8 — Get Stats
# ─────────────────────────────────────────
@app.get("/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    translations = db.query(Translation).filter(
        Translation.user_id == current_user.id
    ).all()

    if not translations:
        return {
            "total_translations": 0,
            "avg_confidence": 0,
            "highest_confidence": 0,
            "programs": []
        }

    avg_confidence = sum(t.confidence_score for t in translations) / len(translations)
    highest = max(t.confidence_score for t in translations)

    return {
        "total_translations": len(translations),
        "avg_confidence": round(avg_confidence, 1),
        "highest_confidence": highest,
        "programs": [t.program_name for t in translations]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)