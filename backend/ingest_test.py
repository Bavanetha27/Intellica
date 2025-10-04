# backend/test_ingest.py
from ingest import ingest_file

if __name__ == "__main__":
    # change path to the file you copied into data/uploads
    p = r"..\data\uploads\Retrieval.docx"
    items = ingest_file(p)
    print("Chunks created:", len(items))
    for i, it in enumerate(items[:3], start=1):
        print(i, it["file_name"], it.get("source_type"), it["text"][:120])
