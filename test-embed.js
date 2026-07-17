import fs from 'fs';

const NVIDIA_API_KEY = "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";

async function testEmbeddings() {
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: ["inclusive", "inclusion"],
        model: "nvidia/nv-embedqa-e5-v5",
        input_type: "query"
      })
    });
    
    if (!res.ok) {
      console.log("Error:", res.status, await res.text());
      return;
    }
    const data = await res.json();
    console.log("Success! Generated embeddings length:", data.data[0].embedding.length);
  } catch (e) {
    console.error(e);
  }
}

testEmbeddings();
