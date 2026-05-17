// Rebuild all embeddings using Ollama /api/embed (batch, 768 dims)
import fs from 'fs';
import http from 'http';

const OLLAMA_PORT = 11434;
const MODEL = 'nomic-embed-text';
const BATCH_SIZE = 10;

const V4_PATH = 'api/legal-systems/embeddings-cache-v4.json';
const TEMP_PATH = 'api/legal-systems/embeddings-cache-v4-rebuilding.json';

const NEW_DOMAIN_FILES = [
  { file: 'api/legal-systems/cybercrime-chunks.json',         domain: 'cybercrime',         prefix: 'cybercrime' },
  { file: 'api/legal-systems/civil-procedure-chunks.json',    domain: 'litigation',         prefix: 'civil' },
  { file: 'api/legal-systems/criminal-procedure-chunks.json', domain: 'criminal_procedure', prefix: 'criminal' },
  { file: 'api/legal-systems/companies-chunks.json',          domain: 'commercial_courts',  prefix: 'commercial' },
];

// Batch embed using /api/embed endpoint
async function embedBatch(texts) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: MODEL, input: texts });
    const req = http.request({
      hostname: 'localhost',
      port: OLLAMA_PORT,
      path: '/api/embed',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.embeddings) return reject(new Error(`No embeddings: ${data.substring(0, 300)}`));
          resolve(parsed.embeddings);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function embedAll(items, getContent, label) {
  const results = [];
  const start = Date.now();
  let done = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const texts = batch.map(getContent);

    let embeddings;
    let retries = 3;
    while (retries > 0) {
      try {
        embeddings = await embedBatch(texts);
        break;
      } catch (e) {
        retries--;
        if (retries === 0) throw new Error(`Batch ${i} failed: ${e.message}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    for (const emb of embeddings) results.push(emb);
    done += batch.length;

    const elapsed = ((Date.now() - start) / 1000).toFixed(0);
    const rate = (done / (Date.now() - start) * 1000).toFixed(1);
    const remaining = Math.ceil((items.length - done) / rate);
    console.log(`${label}: ${done}/${items.length} (${Math.round(done/items.length*100)}%) — ${rate}/s — ~${remaining}s left`);
  }

  return results;
}

async function main() {
  console.log('=== Ollama Batch Embedding Rebuild ===');
  console.log(`Model: ${MODEL} | Batch: ${BATCH_SIZE} | Endpoint: /api/embed\n`);

  // Test
  const test = await embedBatch(['مرحبا بالعالم']);
  console.log(`Ollama OK — dims: ${test[0].length}\n`);

  // 1. Load v4
  const existingV4 = JSON.parse(fs.readFileSync(V4_PATH, 'utf8'));
  console.log(`Existing v4 chunks: ${existingV4.length}`);

  // 2. Build new domain chunks
  const newChunks = [];
  for (const { file, domain, prefix } of NEW_DOMAIN_FILES) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const chunks = data.chunks || [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const num = String(i + 1).padStart(4, '0');
      const article_id = `${prefix}_${num}`;
      const tagsStr = (chunk.tags || []).join(', ');

      newChunks.push({
        id: `${article_id}_official`, article_id,
        law_name: chunk.law_name, domain, chunk_type: 'official_text',
        content: `${chunk.law_name} - ${chunk.article_number}\n${chunk.article_text}`,
        embedding: null,
      });
      newChunks.push({
        id: `${article_id}_enriched`, article_id,
        law_name: chunk.law_name, domain, chunk_type: 'enriched',
        content: `${chunk.law_name} - ${chunk.article_number}\nتصنيف: ${domain}\nكلمات مفتاحية: ${tagsStr}\nالباب: ${chunk.chapter || ''}\nملخص: ${chunk.article_text.substring(0, 200)}`,
        embedding: null,
      });
    }
    console.log(`  ${domain}: ${chunks.length * 2} chunks`);
  }

  // 3. Identify chunks to re-embed
  const toReEmbed = existingV4.filter(c => !c.embedding || c.embedding.length !== 768);
  console.log(`\nTo re-embed: ${toReEmbed.length} existing + ${newChunks.length} new = ${toReEmbed.length + newChunks.length} total`);

  // 4. Re-embed existing
  if (toReEmbed.length > 0) {
    console.log('\nRe-embedding existing...');
    const embeddings = await embedAll(toReEmbed, c => c.content, 'existing');
    const embMap = new Map(toReEmbed.map((c, i) => [c.id, embeddings[i]]));
    for (const chunk of existingV4) {
      if (embMap.has(chunk.id)) chunk.embedding = embMap.get(chunk.id);
    }
    console.log('Done existing.\n');
  }

  // 5. Embed new chunks
  if (newChunks.length > 0) {
    console.log('Embedding new domain chunks...');
    const embeddings = await embedAll(newChunks, c => c.content, 'new');
    newChunks.forEach((c, i) => { c.embedding = embeddings[i]; });
    console.log('Done new.\n');
  }

  // 6. Save
  const finalCache = [...existingV4, ...newChunks];
  console.log(`Saving ${finalCache.length} chunks...`);
  fs.writeFileSync(TEMP_PATH, JSON.stringify(finalCache));
  fs.renameSync(TEMP_PATH, V4_PATH);
  console.log('Saved!');

  // Summary
  const domains = {};
  for (const c of finalCache) domains[c.domain] = (domains[c.domain] || 0) + 1;
  console.log('\nDomains:');
  for (const [d, n] of Object.entries(domains).sort()) console.log(`  ${d}: ${n}`);
  console.log(`Dims: ${finalCache[0]?.embedding?.length}`);
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
