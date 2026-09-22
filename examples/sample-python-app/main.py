import os
from fastapi import FastAPI

app = FastAPI(title="FusionHost Sample FastAPI App")

@app.get("/")
def home():
    db_url = os.environ.get("DATABASE_URL", "Not set")
    return {
        "message": "Shipped with FusionHost!",
        "runtime": "python-fastapi",
        "database_connected": bool(os.environ.get("DATABASE_URL")),
        "database_url_masked": db_url[:25] + "..." if len(db_url) > 25 else db_url
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
