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
    if (cached) cachedEmbeddings = JSON.parse(cached);
  } catch (e) {
    console.error("Failed to load cached embeddings", e);
  }
  
  worker.onmessage = (e) => {
    const data = e.data;
    if (data.status === 'ready') isReady = true;
    if (data.status === 'embeddings_computed') {
      try {
        localStorage.setItem('faqEmbeddings', JSON.stringify(data.embeddings));
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
