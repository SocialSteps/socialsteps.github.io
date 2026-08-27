import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

let currentAudio = null;

export async function playTTS(text) {
  // Stop currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  if (Capacitor.isNativePlatform()) {
    try { await TextToSpeech.stop(); } catch(e) {}
  } else if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  try {
    const response = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`TTS server responded with ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    currentAudio = new Audio(audioUrl);
    
    // Clean up URL object when audio finishes to prevent memory leaks
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };

    await currentAudio.play();
  } catch (error) {
    console.log("Backend TTS failed, falling back to local TTS engine:", error.message);
    
    if (Capacitor.isNativePlatform()) {
      try {
        await TextToSpeech.speak({
          text: text,
          lang: 'en-US',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        });
      } catch (nativeError) {
        console.error("Native TTS error:", nativeError);
      }
    } else if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("No TTS fallback available.");
    }
  }
}
