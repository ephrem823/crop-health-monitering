import sqlite3
from pathlib import Path
from tabulate import tabulate

DB_PATH = Path("backend/app/database.db")

def view_all_records():
    """View all diagnosis records from the database."""
    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all records
    cursor.execute("""
        SELECT id, crop_name, disease_name, confidence, timestamp, location, farmer_notes
        FROM diagnosis_history
        ORDER BY timestamp DESC
    """)
    
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        print("📭 No records found in database")
        return
    
    # Display in table format
    headers = ["ID", "Crop", "Disease", "Confidence", "Timestamp", "Location", "Notes"]
    
    # Format confidence as percentage
    formatted_rows = []
    for row in rows:
        formatted_row = list(row)
        formatted_row[3] = f"{row[3]*100:.1f}%"  # Confidence
        formatted_rows.append(formatted_row)
    
    print(f"\n📊 Total Records: {len(rows)}\n")
    print(tabulate(formatted_rows, headers=headers, tablefmt="grid"))
    
    # Statistics
    cursor.execute("SELECT crop_name, COUNT(*) FROM diagnosis_history GROUP BY crop_name")
    crop_stats = cursor.fetchall()
    conn.close()
    
    print("\n📈 Statistics by Crop:")
    for crop, count in crop_stats:
        print(f"  {crop}: {count} diagnoses")

if __name__ == "__main__":
    view_all_records()