import { PiperWebWorkerEngine, OnnxWebGPUWorkerRuntime, HuggingFaceVoiceProvider } from 'piper-tts-web';

class CacheStorageProvider {
  #cacheName = 'piper-tts-cache-v1';
  #memoryCache = {};

  destroy() {
    for (const data in this.#memoryCache) {
      if (typeof data === 'string' && data.startsWith('blob:')) {
        URL.revokeObjectURL(data);
      }
    }
    this.#memoryCache = {};
  }

  async fetch(url) {
    if (this.#memoryCache[url]) {
      return this.#memoryCache[url];
    }

    try {
      const cache = await caches.open(this.#cacheName);
      let response = await cache.match(url);
      
      if (!response) {
        console.log('Downloading and caching:', url);
        response = await fetch(url);
        if (!response.ok) {
          throw new Error('Could not fetch: ' + url);
        }
        await cache.put(url, response.clone());
      } else {
        console.log('Serving from cache:', url);
      }
      
      const data = url.endsWith('.json') ? await response.json() : URL.createObjectURL(await response.blob());
      this.#memoryCache[url] = data;
      return data;
    } catch (e) {
      // Fallback in case Cache API is not supported or fails
      console.warn('CacheStorage failed, falling back to network fetch', e);
      const res = await fetch(url);
      const data = url.endsWith('.json') ? await res.json() : URL.createObjectURL(await res.blob());
      this.#memoryCache[url] = data;
      return data;
    }
  }
}

let engine = null;
let initPromise = null;
let currentAudio = null;

async function initEngine() {
  if (engine) return engine;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const voiceProvider = new HuggingFaceVoiceProvider({
        provider: new CacheStorageProvider()
      });
      // We don't necessarily have WebGPU, let's fall back gracefully if it fails?
      // Actually, OnnxWebGPUWorkerRuntime is provided by piper-tts-web
      engine = new PiperWebWorkerEngine({
        voiceProvider,
      });
      return engine;
    } catch (e) {
      console.error("Failed to initialize Piper TTS:", e);
      throw e;
    }
  })();

  return initPromise;
}

export async function playTTS(text) {
  // Stop currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  try {
    const e = await initEngine();
    const voice = 'en_US-libritts_r-medium';
    const speaker = 0;
    
    // The web worker takes some time on the first run to download models.
    const response = await e.generate(text, voice, speaker);
    console.log("Piper TTS Response:", response);
    
    // Piper usually returns an object with `file` as a Blob or `audio` as an AudioBuffer/Blob
    const audioBlob = response.file || response.audio;
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudio = new Audio(audioUrl);
      currentAudio.play();
    } else {
      console.error("No audio blob returned from piper-tts-web:", response);
    }
  } catch (error) {
    console.error("Error generating or playing TTS:", error);
    alert("Error playing TTS: " + error.message);
  }
}
