import json
from backend.database import get_db

class ChatService:
    def __init__(self):
        self.knowledge_base = {
            "scconv": "Spatial and Channel Reconstruction Convolution (SCConv) is our key enhancement. It suppresses spatial redundancy (SRU) and channel redundancy (CRU) within the YOLO head, forcing the model to focus strictly on tumor-relevant feature maps.",
            "yolov8": "We use a customized YOLOv8-Nano backbone for real-time performance. By injecting SCConv modules into the C2f blocks, we achieve higher mean Average Precision (mAP) with fewer parameters.",
            "tumors": "This diagnostic system is specialized for Glioma, Meningioma, and Pituitary tumors. It classifies based on Morphological features captured in MRI T1/T2 weighted slices.",
            "disclaimer": "This tool is intended for research and educational purposes. Always consult a certified neurologist or radiologist for clinical diagnosis.",
            "mission": "Our goal is to provide a viewport-locked, high-fidelity dashboard that demonstrates how advanced convolution techniques can improve the accuracy of automated MRI segmentation."
        }

    def get_db_stats(self):
        """Query the database for real-time history statistics."""
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('SELECT predictions FROM predictions')
            rows = cursor.fetchall()
            conn.close()

            total_scans = len(rows)
            gliomas = 0
            meningiomas = 0
            pituitary = 0
            
            for row in rows:
                if row['predictions']:
                    preds = json.loads(row['predictions'])
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
        msg = user_message.lower().strip()
        
        # 1. Greetings
        if msg in ["hi", "hello", "hey", "greetings"]:
            return "Hello! I'm here to help you navigate the NeuroDetect dashboard. You can ask me about how to use the system or your scan history."

        # 2. System Purpose & Usage
        if "what" in msg and ("system" in msg or "about" in msg or "this" in msg):
            return "This system identifies brain tumors (Glioma, Meningioma, Pituitary) from MRI scans using AI. You can upload an image on the left to start."
        
        if "how" in msg and ("use" in msg or "do" in msg or "upload" in msg):
            return "Usage: 1. Drag an MRI image to the box on the left. 2. Click 'Run Diagnostics'. 3. View results in the pop-up modal."

        # 3. Database Stats (Concise)
        if any(k in msg for k in ["how many", "count", "stats", "history", "total"]):
            stats = self.get_db_stats()
            if stats:
                if "meningioma" in msg: return f"Detected {stats['meningioma']} Meningiomas so far."
                if "glioma" in msg: return f"Records show {stats['glioma']} Gliomas."
                if "pituitary" in msg: return f"Total of {stats['pituitary']} Pituitary tumors."
                return f"Total scans: {stats['total']}. Total detections: {stats['glioma'] + stats['meningioma'] + stats['pituitary']}."
            return "I couldn't reach the scan history database right now."

        # 4. Troubleshooting
        if "error" in msg or "problem" in msg or "not working" in msg or "help" in msg:
            return "Troubleshooting: Make sure you are uploading a valid image file. If the scan won't start, please refresh the page or ensure the backend server is running."

        # 5. Conversational Fillers
        if msg in ["ok", "okay", "cool", "thanks", "nice", "got it"]:
            return "You're welcome! Let me know if you need more help with the dashboard."

        # 6. Fallback
        return "I'm here for basic dashboard help and scan stats. For medical advice, please consult a radiologist."

# Singleton instance
chat_engine = ChatService()
