from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import shutil
import os
from app.auth import get_current_active_user
from app import models

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        file_location = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        return {"info": f"file '{file.filename}' saved at '{file_location}'", "path": file_location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Placeholder for future verification logic integration
@router.post("/verify-kyc/{farmer_id}")
def verify_kyc_status(farmer_id: int):
    # Logic to check if required docs are uploaded would go here
    return {"message": "KYC verification process initiated"}
