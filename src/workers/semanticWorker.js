import { pipeline, env, cos_sim } from '@xenova/transformers';

// Skip local model check since we are running in the browser
env.allowLocalModels = false;

let extractor = null;
let faqCorpus = [];
let faqEmbeddings = [];

// Initialize the model
async function initExtractor() {
  if (extractor) return extractor;
  extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    progress_callback: (x) => {
      postMessage({ status: 'progress', progress: x });
    }
  });
  return extractor;
}

// Compute embedding for a single text
async function embedText(text) {
  const ext = await initExtractor();
  const output = await ext(text, { pooling: 'mean', normalize: true });
  return output.data;
}

self.addEventListener('message', async (e) => {
  const { type, data, id } = e.data;

  try {
    if (type === 'init') {
      postMessage({ status: 'initializing' });
      await initExtractor();
      
      faqCorpus = data.faq; // [{id, question, answer, category}]
      
      if (data.cachedEmbeddings && data.cachedEmbeddings.length === faqCorpus.length) {
        faqEmbeddings = data.cachedEmbeddings;
        postMessage({ status: 'ready' });
      } else {
        faqEmbeddings = [];
        postMessage({ status: 'embedding_corpus', total: faqCorpus.length });
        
        for (let i = 0; i < faqCorpus.length; i++) {
          const item = faqCorpus[i];
          const text = `${item.question} ${item.answer}`;
          const emb = await embedText(text);
          faqEmbeddings.push(emb);
          
          if (i % 10 === 0) {
            postMessage({ status: 'embedding_progress', current: i, total: faqCorpus.length });
          }
        }
        
        // Send back to main thread to save in localStorage
        postMessage({ status: 'embeddings_computed', embeddings: faqEmbeddings });
        postMessage({ status: 'ready' });
      }
    }
    
    if (type === 'search') {
      if (!extractor || faqCorpus.length === 0) {
        postMessage({ status: 'error', error: 'Model not initialized', id });
        return;
      }
      
      const queryEmbedding = await embedText(data.query);
      
      const results = faqCorpus.map((item, index) => {
        const score = cos_sim(queryEmbedding, faqEmbeddings[index]);
        return { item, score };
      });
      
      results.sort((a, b) => b.score - a.score);
      
      // Return top 15 results to the main thread
      postMessage({ status: 'search_result', results: results.slice(0, 15), id });
    }
  } catch (err) {
    console.error("Worker error:", err);
    postMessage({ status: 'error', error: err.message, id });
  }
});
