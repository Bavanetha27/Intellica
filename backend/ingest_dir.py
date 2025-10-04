# backend/ingest_dir.py
import sys
from pathlib import Path
from ingest import ingest_file, UPLOADS_DIR

def ingest_all_in_uploads():
    upload_dir = UPLOADS_DIR
    files = list(upload_dir.glob("*"))
    if not files:
        print("No files found in uploads. Put files into:", upload_dir)
        return
    total = 0
    for f in files:
        print("Processing:", f.name)
        items = ingest_file(str(f))
        total += len(items)
    print("Done. Total chunks ingested:", total)

if __name__ == "__main__":
    ingest_all_in_uploads()
