import sqlite3
import os
from pathlib import Path
from datetime import datetime

# Get absolute path for database
BASE_DIR = Path(__file__).resolve().parent  # backend/app/
DB_PATH = BASE_DIR / "database.db"

def init_db():
    """Initialize the database with required tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Diagnosis history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS diagnosis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop_name TEXT NOT NULL,
            disease_name TEXT NOT NULL,
            confidence REAL NOT NULL,
            image_path TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            location TEXT,
            farmer_notes TEXT
        )
    """)
    
    conn.commit()
    conn.close()
    print(f"✓ Database initialized at {DB_PATH}")

def save_diagnosis(crop_name: str, disease_name: str, confidence: float, 
                   image_path: str = None, location: str = None, notes: str = None):
    """Save a diagnosis to history."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO diagnosis_history (crop_name, disease_name, confidence, image_path, location, farmer_notes)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (crop_name, disease_name, confidence, image_path, location, notes))
    
    conn.commit()
    diagnosis_id = cursor.lastrowid
    conn.close()
    return diagnosis_id

def get_history(limit: int = 50):
    """Get recent diagnosis history."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM diagnosis_history 
        ORDER BY timestamp DESC 
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def search_history(query: str):
    """Search diagnosis history by crop or disease name."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM diagnosis_history 
        WHERE crop_name LIKE ? OR disease_name LIKE ?
        ORDER BY timestamp DESC
    """, (f"%{query}%", f"%{query}%"))
    
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def clear_all_history():
    """Delete all diagnosis history."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM diagnosis_history")
    
    conn.commit()
    deleted_count = cursor.rowcount
    conn.close()
    
    return deleted_count

if __name__ == "__main__":
    init_db()
