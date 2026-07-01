export const NVIDIA_API_KEY = "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";
export const NVIDIA_API_URL = "/api/nvidia/v1/chat/completions";

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

