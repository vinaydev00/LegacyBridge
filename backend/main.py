# This is the main web server file
# Think of it like the front door of your app
# Anyone who wants to use LegacyBridge talks to this file

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys
import shutil

# Add backend folder to path so we can import our files
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pipeline import LegacyBridgePipeline

# Create the FastAPI app
# Think of this like opening a restaurant
app = FastAPI(
    title="LegacyBridge API",
    description="AI-powered COBOL to modern Python API translator",
    version="1.0.0"
)

# Allow frontend to talk to backend
# Without this, React app cannot call this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Create folders we need
os.makedirs("uploaded_files", exist_ok=True)
os.makedirs("generated_apis", exist_ok=True)

# Store translation history in memory for now
translation_history = []

# Initialize pipeline
pipeline = LegacyBridgePipeline()

# ─────────────────────────────────────────
# ENDPOINT 1 — Health Check
# Like a "is the restaurant open?" check
# ─────────────────────────────────────────
@app.get("/")
def health_check():
    return {
        "status": "running",
        "message": "LegacyBridge API is live!",
        "version": "1.0.0"
    }

# ─────────────────────────────────────────
# ENDPOINT 2 — Upload and Translate
# User uploads COBOL file → gets Python API back
# ─────────────────────────────────────────
@app.post("/translate")
async def translate_cobol(file: UploadFile = File(...)):
    # Check if file is a COBOL file
    if not file.filename.endswith('.cbl') and not file.filename.endswith('.cbl.txt'):
        raise HTTPException(
            status_code=400,
            detail="Only .cbl COBOL files are accepted"
        )

    # Save uploaded file
    file_path = f"uploaded_files/{file.filename.replace('.txt', '')}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    print(f"✅ File uploaded: {file.filename}")

    # Run the pipeline
    try:
        result = pipeline.run(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Save to history
    translation_history.append({
        "id": len(translation_history) + 1,
        "filename": file.filename,
        "program_name": result["program_name"],
        "confidence_score": result["confidence_score"],
        "understanding": result["understanding"],
        "generated_code": result["generated_code"]
    })

    return {
        "success": True,
        "program_name": result["program_name"],
        "understanding": result["understanding"],
        "generated_code": result["generated_code"],
        "confidence_score": result["confidence_score"]
    }

# ─────────────────────────────────────────
# ENDPOINT 3 — Get Translation History
# Shows all past translations
# ─────────────────────────────────────────
@app.get("/history")
def get_history():
    return {
        "total": len(translation_history),
        "translations": translation_history
    }

# ─────────────────────────────────────────
# ENDPOINT 4 — Get Single Translation
# Get details of one specific translation
# ─────────────────────────────────────────
@app.get("/history/{id}")
def get_translation(id: int):
    for t in translation_history:
        if t["id"] == id:
            return t
    raise HTTPException(status_code=404, detail="Translation not found")

# Run the server
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)