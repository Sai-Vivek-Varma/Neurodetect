import os
import json
from google import genai
from backend.database import get_db
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path, override=True)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None

class ChatService:
    def __init__(self):
        self.system_prompt = """
You are the AI assistant for the NeuroDetect dashboard.
Rules:
1. Keep responses extremely brief and conversational (1-2 sentences max). No fluff.
2. Get straight to the point. Do not give a long welcome message or repeat the dashboard description unless asked.
3. Only provide a medical disclaimer ("consult a radiologist") IF the user explicitly asks for medical diagnosis or advice.
4. If asked about stats, give the numbers directly.
"""

    def get_db_stats(self):
        """Query the MongoDB database for real-time history statistics."""
        try:
            collection = get_db()
            # Fetch all documents, but only return the 'predictions' field to save memory
            cursor = collection.find({}, {"predictions": 1})
            
            total_scans = 0
            gliomas = 0
            meningiomas = 0
            pituitary = 0
            
            for row in cursor:
                total_scans += 1
                preds = row.get('predictions', [])
                for p in preds:
                    name = p.get('class_name', '').lower()
                    if 'glioma' in name: gliomas += 1
                    elif 'meningioma' in name: meningiomas += 1
                    elif 'pituitary' in name: pituitary += 1
            
            return {
                "total": total_scans,
                "glioma": gliomas,
                "meningioma": meningiomas,
                "pituitary": pituitary
            }
        except Exception as e:
            print(f"Chat stats error: {e}")
            return None

    def get_response(self, user_message: str) -> str:
        if not client:
            return "Please configure your GEMINI_API_KEY in the backend/.env file to use the AI chatbot."
            
        stats = self.get_db_stats()
        stats_context = ""
        if stats:
            stats_context = f"\n\nCurrent Database Statistics:\n- Total Scans Processed: {stats['total']}\n- Gliomas Detected: {stats['glioma']}\n- Meningiomas Detected: {stats['meningioma']}\n- Pituitary Tumors Detected: {stats['pituitary']}\nUse these statistics if the user asks about the dashboard's history or how many tumors have been found."

        full_prompt = f"{self.system_prompt}{stats_context}\n\nUser Message: {user_message}\n\nAI Response:"
        
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=full_prompt
            )
            return response.text
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "I'm having trouble connecting to my AI brain right now. Please try again later."

# Singleton instance
chat_engine = ChatService()