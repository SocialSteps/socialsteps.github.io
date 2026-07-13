const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

let currentAudio = null;

export async function playTTS(text) {
  // Stop currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
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
    console.error("Error generating or playing TTS:", error);
    alert("Error playing TTS: " + error.message);
  }
}
