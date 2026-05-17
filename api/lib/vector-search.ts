import fs from "fs";
import path from "path";

// V4 cache (new — richer content, 7 laws)
const CACHE_V4_PATH   = path.resolve("api/legal-systems/embeddings-cache-v4.json");
// V1 cache (fallback — 4 laws)
const CACHE_V1_PATH   = path.resolve("api/legal-systems/embeddings-cache.json");
// V4 source chunks (for official_text lookup)
const SOURCE_V4_PATH  = path.resolve("api/legal-systems/v4-chunks.json");
// V1 source chunks (fallback)
const SOURCE_V1_PATH  = path.resolve("api/legal-systems/extracted-temp/legal-rag-masaoul/output/chunks.json");

const OLLAMA_MODEL = "nomic-embed-text"; // dim=768, local (no API key needed)
const OPENAI_MODEL_SMALL  = "text-embedding-3-small";  // dim=1536
const OPENAI_MODEL_LARGE  = "text-embedding-3-large";  // dim=3072

export interface EmbeddedChunk {
  id: string;
  article_id?: string;
  law_name: string;
  domain: string;
  chunk_type?: string;
  article_number?: string;
  chapter?: string;
  content: string;
  embedding: number[];
}

export interface VectorSearchResult {
  law_name: string;
  domain: string;
  article_number: string;
  chapter: string;
  content: string;
  similarity: number;
}

// Maps app category names → domain values in the embeddings cache
const CATEGORY_TO_DOMAIN: Record<string, string> = {
  enforcement:    "execution",
  drugs:          "drug_crimes",
  family:         "personal_status",
  labor:          "labor",
  cybercrime:     "cybercrime",
  civil:          "litigation",
  criminal:       "criminal_procedure",
  commercial:     "commercial_courts",
  forgery:        "forgery",
  prison:         "prison",
};

// Singleton caches
let _embeddings: EmbeddedChunk[] | null = null;
let _officialTexts: Map<string, { law_name: string; domain: string; article_number: string; chapter: string; content: string }> | null = null;
let _chunkToArticle: Map<string, string> | null = null;
let _usingV4 = false;
let _embeddingDim = 768; // detected from first cached chunk

function loadEmbeddings(): EmbeddedChunk[] {
  if (_embeddings) return _embeddings;

  if (fs.existsSync(CACHE_V4_PATH)) {
    _embeddings = JSON.parse(fs.readFileSync(CACHE_V4_PATH, "utf-8"));
    _usingV4 = true;
  } else if (fs.existsSync(CACHE_V1_PATH)) {
    _embeddings = JSON.parse(fs.readFileSync(CACHE_V1_PATH, "utf-8"));
    _usingV4 = false;
  } else {
    return [];
  }
  // Detect embedding model from dimension: OpenAI large=3072, small=1536, Ollama=768
  if (_embeddings!.length > 0) {
    _embeddingDim = _embeddings![0].embedding?.length ?? 768;
  }
  return _embeddings!;
}

function loadSourceLookup(): void {
  if (_officialTexts) return;
  _officialTexts = new Map();
  _chunkToArticle = new Map();

  const sourcePath = _usingV4 ? SOURCE_V4_PATH : SOURCE_V1_PATH;
  if (!fs.existsSync(sourcePath)) return;

  const chunks = JSON.parse(fs.readFileSync(sourcePath, "utf-8")) as any[];

  for (const c of chunks) {
    const articleId = c.article_id ?? c.id;
    const chunkId   = c.id;

    _chunkToArticle!.set(chunkId, articleId);

    const isOfficial = _usingV4
      ? c.chunk_type === "official_text"
      : c.chunk_type === "official_text";

    if (isOfficial && !_officialTexts!.has(articleId)) {
      // V4: article_number and chapter are embedded inside content
      // Extract article_number from id: "execution_0001_official" → "0001"
      let articleNumber = c.article_number ?? "";
      let chapter = c.chapter ?? "";

      if (_usingV4 && !articleNumber) {
        const parts = c.id.split("_");
        articleNumber = parts[1] ?? c.id;
      }

      _officialTexts!.set(articleId, {
        law_name: c.law_name,
        domain: c.domain,
        article_number: articleNumber,
        chapter,
        content: c.content,
      });
    }
  }
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export async function vectorSearch(
  query: string,
  topK = 8,
  domain?: string | null
): Promise<VectorSearchResult[]> {
  const chunks = loadEmbeddings();
  if (chunks.length === 0) return [];

  loadSourceLookup();

  let queryVec: number[];
  try {
    // Python fastembed server (paraphrase-multilingual-MiniLM-L12-v2, 384 dims)
    const res = await fetch("http://localhost:5555/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query }),
    });
    const json = await res.json() as { embedding: number[] };
    queryVec = json.embedding;
  } catch {
    return [];
  }

  const resolvedDomain = domain ? (CATEGORY_TO_DOMAIN[domain] ?? domain) : null;
  const pool = resolvedDomain ? chunks.filter((c) => c.domain === resolvedDomain) : chunks;

  const scored = pool.map((c) => ({ id: c.id, similarity: cosine(queryVec, c.embedding) }));
  scored.sort((a, b) => b.similarity - a.similarity);

  // Deduplicate by article_id — return official_text content
  const seen = new Set<string>();
  const results: VectorSearchResult[] = [];

  for (const { id, similarity } of scored) {
    if (results.length >= topK) break;

    const articleId = _chunkToArticle?.get(id) ?? id;
    if (seen.has(articleId)) continue;
    seen.add(articleId);

    const source = _officialTexts?.get(articleId);
    const fallback = chunks.find((c) => c.id === id)!;

    results.push({
      law_name:       source?.law_name       ?? fallback.law_name,
      domain:         source?.domain         ?? fallback.domain,
      article_number: source?.article_number ?? fallback.article_number ?? "",
      chapter:        source?.chapter        ?? fallback.chapter ?? "",
      content:        source?.content        ?? fallback.content,
      similarity,
    });
  }

  return results;
}

export function isVectorSearchReady(): boolean {
  return fs.existsSync(CACHE_V4_PATH) || fs.existsSync(CACHE_V1_PATH);
}

export function getVectorSearchInfo(): { version: string; chunks: number; ready: boolean } {
  if (fs.existsSync(CACHE_V4_PATH)) {
    const data = JSON.parse(fs.readFileSync(CACHE_V4_PATH, "utf-8")) as any[];
    return { version: "v4", chunks: data.length, ready: true };
  }
  if (fs.existsSync(CACHE_V1_PATH)) {
    const data = JSON.parse(fs.readFileSync(CACHE_V1_PATH, "utf-8")) as any[];
    return { version: "v1", chunks: data.length, ready: true };
  }
  return { version: "none", chunks: 0, ready: false };
}
