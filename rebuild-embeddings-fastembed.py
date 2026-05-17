"""
Rebuild all embeddings using fastembed (ONNX-based, fast CPU inference).
Model: sentence-transformers/paraphrase-multilingual-mpnet-base-v2 (768 dims)
"""
import json, os, sys, time, warnings
warnings.filterwarnings("ignore")
from fastembed import TextEmbedding

V4_PATH = "api/legal-systems/embeddings-cache-v4.json"
TEMP_PATH = "api/legal-systems/embeddings-cache-v4-rebuilding.json"
MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
BATCH_SIZE = 32

NEW_DOMAIN_FILES = [
    {"file": "api/legal-systems/cybercrime-chunks.json",         "domain": "cybercrime",         "prefix": "cybercrime"},
    {"file": "api/legal-systems/civil-procedure-chunks.json",    "domain": "litigation",         "prefix": "civil"},
    {"file": "api/legal-systems/criminal-procedure-chunks.json", "domain": "criminal_procedure", "prefix": "criminal"},
    {"file": "api/legal-systems/companies-chunks.json",          "domain": "commercial_courts",  "prefix": "commercial"},
]

def main():
    print("=== FastEmbed Rebuild ===")
    print("Model: {} | Batch: {}".format(MODEL, BATCH_SIZE), flush=True)

    print("Loading model...", flush=True)
    t0 = time.time()
    model = TextEmbedding(MODEL)
    print("Model loaded in {:.1f}s\n".format(time.time() - t0), flush=True)

    # Load existing v4
    with open(V4_PATH) as f:
        existing_v4 = json.load(f)
    print("Existing v4 chunks: {}".format(len(existing_v4)))

    # Build new domain chunks
    new_chunks = []
    for cfg in NEW_DOMAIN_FILES:
        with open(cfg["file"]) as f:
            data = json.load(f)
        chunks = data.get("chunks", [])
        domain = cfg["domain"]
        prefix = cfg["prefix"]
        for i, chunk in enumerate(chunks):
            num = str(i + 1).zfill(4)
            article_id = "{}_{}".format(prefix, num)
            tags = ", ".join(chunk.get("tags", []))
            law = chunk["law_name"]
            art_num = chunk["article_number"]
            art_text = chunk["article_text"]
            chapter = chunk.get("chapter", "")

            official_content = "{} - {}\n{}".format(law, art_num, art_text)
            enriched_content = "{} - {}\nتصنيف: {}\nكلمات مفتاحية: {}\nالباب: {}\nملخص: {}".format(
                law, art_num, domain, tags, chapter, art_text[:200]
            )

            new_chunks.append({
                "id": "{}_official".format(article_id),
                "article_id": article_id,
                "law_name": law,
                "domain": domain,
                "chunk_type": "official_text",
                "content": official_content,
                "embedding": None,
            })
            new_chunks.append({
                "id": "{}_enriched".format(article_id),
                "article_id": article_id,
                "law_name": law,
                "domain": domain,
                "chunk_type": "enriched",
                "content": enriched_content,
                "embedding": None,
            })
        print("  {}: {} chunks".format(domain, len(chunks) * 2))

    # Identify chunks to re-embed
    to_re_embed = [c for c in existing_v4 if not c.get("embedding") or len(c["embedding"]) != 384]
    total = len(to_re_embed) + len(new_chunks)
    print("\nTo re-embed: {} existing + {} new = {} total".format(len(to_re_embed), len(new_chunks), total))

    def embed_all(items, label):
        texts = [c["content"] for c in items]
        results = []
        t_start = time.time()
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i:i + BATCH_SIZE]
            embeddings = list(model.embed(batch))
            results.extend([e.tolist() for e in embeddings])
            done = min(i + BATCH_SIZE, len(texts))
            elapsed = time.time() - t_start
            rate = done / elapsed if elapsed > 0 else 0
            eta = int((len(texts) - done) / rate) if rate > 0 else 9999
            print("{}: {}/{} ({}%) rate={:.1f}/s eta={}s".format(
                label, done, len(texts), 100 * done // len(texts), rate, eta
            ), flush=True)
        return results

    # Re-embed existing
    if to_re_embed:
        print("\nRe-embedding existing...", flush=True)
        embeddings = embed_all(to_re_embed, "existing")
        emb_map = {c["id"]: emb for c, emb in zip(to_re_embed, embeddings)}
        for chunk in existing_v4:
            if chunk["id"] in emb_map:
                chunk["embedding"] = emb_map[chunk["id"]]
        print("Existing done.\n", flush=True)

    # Embed new chunks
    if new_chunks:
        print("Embedding new domain chunks...", flush=True)
        embeddings = embed_all(new_chunks, "new")
        for chunk, emb in zip(new_chunks, embeddings):
            chunk["embedding"] = emb
        print("New done.\n", flush=True)

    # Save
    final_cache = existing_v4 + new_chunks
    print("Saving {} chunks...".format(len(final_cache)), flush=True)
    with open(TEMP_PATH, "w") as f:
        json.dump(final_cache, f)
    os.rename(TEMP_PATH, V4_PATH)
    print("Saved!")

    # Summary
    domains = {}
    for c in final_cache:
        domains[c["domain"]] = domains.get(c["domain"], 0) + 1
    print("\nDomains:")
    for d, n in sorted(domains.items()):
        print("  {}: {}".format(d, n))
    embedding_dims = len(final_cache[0].get("embedding", []))
    print("Dims: {}".format(embedding_dims))

if __name__ == "__main__":
    main()
