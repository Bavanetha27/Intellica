# backend/rag_generate.py
import json
from pathlib import Path
import faiss
import torch
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# ---------------- CONFIG -----------------
BASE_DIR = Path(__file__).resolve().parent.parent
VECTOR_DIR = BASE_DIR / "data/vectors"  # vector storage folder
FAISS_FILE = VECTOR_DIR / "faiss_index.bin"
META_FILE = VECTOR_DIR / "metadatas.json"
# Models
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "google/flan-t5-small"  # <= 1.5GB RAM

TOP_K = 5
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ---------------- LOAD FAISS & METADATA -----------------
if not FAISS_FILE.exists() or not META_FILE.exists():
    raise FileNotFoundError("FAISS index or metadata not found. Run Phase 4 first.")

index = faiss.read_index(str(FAISS_FILE))

with open(META_FILE, "r", encoding="utf-8") as f:
    metadata = json.load(f)

# ---------------- LOAD EMBEDDING MODEL -----------------
embed_model = SentenceTransformer(EMBEDDING_MODEL, device=DEVICE)

# ---------------- LOAD LLM -----------------
tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL)
model = AutoModelForSeq2SeqLM.from_pretrained(LLM_MODEL).to(DEVICE)
model.eval()

# ---------------- SEMANTIC SEARCH -----------------
def semantic_search(query, top_k=TOP_K):
    query_vec = embed_model.encode(query, convert_to_numpy=True, normalize_embeddings=True)
    query_vec = query_vec.reshape(1, -1).astype("float32")
    distances, indices = index.search(query_vec, top_k)
    results = []
    for idx in indices[0]:
        if idx != -1:
            results.append(metadata[idx])
    return results

def generate_answer(query, top_k=TOP_K, max_new_tokens=400):
    # ---------------- Retrieve top-k chunks -----------------
    chunks = semantic_search(query, top_k)

    # ---------------- Deduplicate chunk texts -----------------
    unique_chunks = []
    seen_texts = set()
    for c in chunks:
        text = c.get('text', '').strip()
        if text and text not in seen_texts:
            seen_texts.add(text)
            unique_chunks.append(c)

    if not unique_chunks:
        return "No relevant information found in documents.", []

    # ---------------- Build readable context with citations -----------------
    context_lines = []
    for i, c in enumerate(unique_chunks, 1):
        context_lines.append(f"[{i}] {c['text']} (source: {c['file_name']})")
    context_text = "\n\n".join(context_lines)

    # ---------------- Explicit prompt for detailed, beginner-friendly answers -----------------
    prompt = f"""
You are an expert assistant. Answer the question using ONLY the context below.
Explain it clearly in a way that a beginner can understand.
Use multiple sentences if needed.
Cite sources using [number] as shown in the context.

Context:
{context_text}

Question:
{query}

Answer:
"""

    # ---------------- Tokenize and generate -----------------
    inputs = tokenizer(
        prompt, 
        return_tensors="pt", 
        truncation=True, 
        max_length=2048
    ).to(DEVICE)

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id
        )

    # ---------------- Decode and return -----------------
    answer = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    return answer, unique_chunks


# ---------------- INTERACTIVE CLI -----------------
if __name__ == "__main__":
    print("=== Phase 5 RAG (Small Model) ===")
    while True:
        q = input("\nEnter your question (or 'exit' to quit): ").strip()
        if q.lower() in ["exit", "quit"]:
            break
        answer, sources = generate_answer(q)
        print("\n=== Answer ===")
        print(answer)
        print("\n=== Sources ===")
        for i, s in enumerate(sources, 1):
            print(f"[{i}] {s['file_name']} | Type: {s['source_type']} | Path: {s['raw_path']}")