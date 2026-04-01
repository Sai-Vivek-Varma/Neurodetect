from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time
import json
from backend.model import predict_image
from backend.database import get_db
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    
    try:
        result = predict_image(contents)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Prediction failed: {str(e)}"}
        
    ts = time.time()
    inserted_id = None
    
    try:
        collection = get_db()
        result_data = {
            "filename": file.filename,
            "annotated_image": result["annotated_image"],
            "predictions": result["predictions"],
            "timestamp": ts
        }
        res = collection.insert_one(result_data)
        inserted_id = str(res.inserted_id)
    except Exception as e:
        print(f"MongoDB saving failed: {e}")
    
    return {
        "_id": inserted_id,
        "filename": file.filename,
        "annotated_image": result["annotated_image"],
        "predictions": result["predictions"],
        "timestamp": ts
    }

@app.get("/api/history")
async def get_history():
    try:
        collection = get_db()
        # Find latest 50 predictions
        cursor = collection.find().sort("timestamp", -1).limit(50)
        
        history = []
        for row in cursor:
            history.append({
                "_id": str(row["_id"]),
                "filename": row.get("filename"),
                "annotated_image": row.get("annotated_image"),
                "predictions": row.get("predictions", []),
                "timestamp": row.get("timestamp")
            })
        return history
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}

from pydantic import BaseModel
from backend.chat_service import chat_engine

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = chat_engine.get_response(request.message)
        return {"response": response}
    except Exception as e:
        print(f"Chat error: {e}")
        return {"response": "I'm having trouble with my knowledge base right now. Please try again."}

@app.delete("/api/history")
async def clear_history():
    try:
        collection = get_db()
        collection.delete_many({})
        return {"message": "Database wiped successfully"}
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
