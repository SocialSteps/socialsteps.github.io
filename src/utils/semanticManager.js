import SemanticWorker from '../workers/semanticWorker?worker';
import { faq } from './data';

let worker = null;
let listeners = new Set();
let isReady = false;
let lastStatus = null;

export function initSemanticManager() {
  if (worker) return; // Already initialized
  
  worker = new SemanticWorker();
  
  let cachedEmbeddings = null;
  try {
    const cached = localStorage.getItem('faqEmbeddings');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Ensure the cached embeddings are actually arrays and not serialized Float32Array objects
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        cachedEmbeddings = parsed;
      } else {
        console.warn("Cached embeddings are invalid. Discarding cache.");
        localStorage.removeItem('faqEmbeddings');
      }
    }
  } catch (e) {
    console.error("Failed to load cached embeddings", e);
  }
  
  worker.onmessage = (e) => {
    const data = e.data;
    if (data.status === 'ready') isReady = true;
    if (data.status === 'embeddings_computed') {
      try {
        const serializableEmbeddings = data.embeddings.map(emb => Array.from(emb));
        localStorage.setItem('faqEmbeddings', JSON.stringify(serializableEmbeddings));
      } catch (e) {
        console.error("Failed to save embeddings to cache", e);
      }
      return; // don't send this to listeners
    }
    if (data.status !== 'search_result') lastStatus = data;
    listeners.forEach(fn => fn(data));
  };
  
  worker.postMessage({ type: 'init', data: { faq, cachedEmbeddings } });
}

export function getSemanticStatus() {
  return { isReady, lastStatus };
}

export function subscribeToSemanticManager(callback) {
  listeners.add(callback);
  
  // Instantly send the last known state so new components can sync up
  if (lastStatus) {
    callback(lastStatus);
  }
  
  return () => {
    listeners.delete(callback);
  };
}

export function searchSemantic(query) {
  if (!worker || !isReady) return;
  worker.postMessage({ type: 'search', data: { query }, id: Date.now() });
}
