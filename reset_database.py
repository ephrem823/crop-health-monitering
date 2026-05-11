import shutil
from pathlib import Path
from backend.app.database import init_db, DB_PATH

# Backup old database
if DB_PATH.exists():
    backup = DB_PATH.with_suffix('.db.backup')
    shutil.copy(DB_PATH, backup)
    print(f"✓ Backed up to {backup}")
    DB_PATH.unlink()

# Create fresh database
init_db()
print("✓ New database created")
