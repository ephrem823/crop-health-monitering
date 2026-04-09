import sqlite3
import csv
from pathlib import Path
from datetime import datetime

DB_PATH = Path("backend/app/database.db")
OUTPUT_FILE = f"diagnosis_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

def export_to_csv():
    """Export all diagnosis records to CSV file."""
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
    conn.close()
    
    if not rows:
        print("📭 No records found in database")
        return
    
    # Write to CSV
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Write header
        writer.writerow(['ID', 'Crop', 'Disease', 'Confidence (%)', 'Timestamp', 'Location', 'Notes'])
        
        # Write data
        for row in rows:
            formatted_row = list(row)
            formatted_row[3] = f"{row[3]*100:.1f}"  # Confidence as percentage
            writer.writerow(formatted_row)
    
    print(f"✅ Exported {len(rows)} records to: {OUTPUT_FILE}")
    print(f"📂 Open with Excel or any spreadsheet application")

if __name__ == "__main__":
    export_to_csv()
