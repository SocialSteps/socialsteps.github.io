import SemanticWorker from '../workers/semanticWorker?worker';
import { faq } from './data';

let worker = null;
let listeners = new Set();
let isReady = false;
let lastStatus = null;

export function initSemanticManager() {
  if (worker) return; // Already initialized
  
  worker = new SemanticWorker();
  
  worker.onmessage = (e) => {
    const data = e.data;
    if (data.status === 'ready') isReady = true;
    if (data.status !== 'search_result') lastStatus = data;
    listeners.forEach(fn => fn(data));
  };
  
  worker.postMessage({ type: 'init', data: { faq } });
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
