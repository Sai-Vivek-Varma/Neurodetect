from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "scc_yolo"
COLLECTION_NAME = "predictions"

def get_db():
    """Returns the MongoDB collection for predictions."""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    return db[COLLECTION_NAME]

def init_db():
    """MongoDB handles collection creation automatically, but we can ensure indices here."""
    collection = get_db()
    # Create an index on timestamp for faster history retrieval
    collection.create_index([("timestamp", -1)])
    print("MongoDB connection established and indices ensured.")

# Initialize connection check/indices on import
try:
    init_db()
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
