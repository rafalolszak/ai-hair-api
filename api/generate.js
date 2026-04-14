import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image } = req.body;

  // Sprawdzenie czy zdjęcie dotarło
  if (!image) {
    return res.status(400).json({ error: "Serwer nie otrzymał zdjęcia." });
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompty = [
"Edit this photo: change ONLY the hairstyle to classic bob. Do NOT change the face, eyes, eyebrows, nose, lips, skin, body, lighting, background, or camera angle. Preserve identity exactly. The person must look identical. High identity preservation. No face changes allowed."
   
  ];

  try {
    const wyniki = [];

    for (const p of prompty) {
      // Zmieniamy strukturę zapytania na taką, którą Replicate akceptuje najlepiej
      const output = await replicate.run(
        "google/nano-banana",
        {
          input: {
            "image_input": [image], // Wysyłamy bezpośrednio jako string (bez [])
            "prompt": p
          }
        }
      );

      // Wyciąganie URL w bezpieczny sposób
      let finalUrl = "";
      if (Array.isArray(output)) {
        finalUrl = output[0];
      } else if (output && typeof output === 'string') {
        finalUrl = output;
      } else if (output && output.url) {
        finalUrl = typeof output.url === 'function' ? output.url() : output.url;
      }

      wyniki.push({ prompt: p, url: finalUrl });
    }

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    // Zwracamy konkretny błąd do Shopify, żebyś widział go w konsoli
    return res.status(500).json({ 
      error: "Błąd Replicate: " + error.message,
      stack: error.stack 
    });
  }
}
