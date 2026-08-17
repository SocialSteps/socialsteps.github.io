export const NVIDIA_API_KEY = "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";
export const NVIDIA_API_URL = `${import.meta.env.VITE_API_BASE_URL || '/api'}/nvidia/v1/chat/completions`;

export async function generateCompletion(systemPrompt, userPrompt, model = "nvidia/llama-3.3-nemotron-super-49b-v1.5") {
  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    console.error("Failed to generate completion", await response.text());
    return "Sorry, I had trouble processing that request.";
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function chatCompletion(messages, model = "nvidia/llama-3.3-nemotron-super-49b-v1.5") {
  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  });

  if (!response.ok) {
    console.error("Failed to generate chat completion", await response.text());
    return "Sorry, I had trouble processing that request.";
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function streamChatCompletion(messages, onChunk, onDone, model = "nvidia/llama-3.3-nemotron-super-49b-v1.5") {
  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true
      })
    });

    if (!response.ok) {
      console.error("Failed to generate stream completion", await response.text());
      onChunk("Sorry, I had trouble processing that request.");
      onDone();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last partial line in the buffer
      buffer = lines.pop() || "";
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.substring(6).trim();
          if (dataStr === "[DONE]") {
            break;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
              onChunk(data.choices[0].delta.content);
            }
          } catch (e) {
            console.error("Error parsing stream JSON", e, dataStr);
          }
        }
      }
    }
    
    // Final check for remaining buffer
    if (buffer.startsWith("data: ")) {
      const dataStr = buffer.substring(6).trim();
      if (dataStr !== "[DONE]") {
        try {
          const data = JSON.parse(dataStr);
          if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
            onChunk(data.choices[0].delta.content);
          }
        } catch (e) {}
      }
    }
    
    onDone();
  } catch (error) {
    console.error("Streaming error:", error);
    onChunk("Sorry, I am having trouble connecting right now.");
    onDone();
  }
}

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function transcribeAudio(base64Audio, mimeType) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }
  
  // Clean base64 string if it contains the data URI prefix
  const base64Data = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
  
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Transcribe the following audio accurately exactly as spoken. Only output the transcription, do not add any conversational filler, markdown formatting, or introductory text." },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      }]
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Transcription API Error:", errorText);
    throw new Error(`Failed to transcribe audio. Status: ${response.status}`);
  }
  
  const data = await response.json();
  if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  return "";
}
