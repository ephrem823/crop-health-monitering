import sqlite3
from contextlib import contextmanager
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.db"


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_connection() as conn:
        conn.execute("""
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
    print(f"✓ Database initialized at {DB_PATH}")


def save_diagnosis(crop_name: str, disease_name: str, confidence: float,
                   image_path: str = None, location: str = None, notes: str = None) -> int:
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO diagnosis_history (crop_name, disease_name, confidence, image_path, location, farmer_notes) VALUES (?, ?, ?, ?, ?, ?)",
            (crop_name, disease_name, confidence, image_path, location, notes)
        )
        return cursor.lastrowid


def get_history(limit: int = 50) -> list:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM diagnosis_history ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()
    return [dict(row) for row in rows]


def search_history(query: str) -> list:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM diagnosis_history WHERE crop_name LIKE ? OR disease_name LIKE ? ORDER BY timestamp DESC",
            (f"%{query}%", f"%{query}%")
        ).fetchall()
    return [dict(row) for row in rows]


def clear_all_history() -> int:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM diagnosis_history")
        return cursor.rowcount


if __name__ == "__main__":
    init_db()
