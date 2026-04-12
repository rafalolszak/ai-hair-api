import Replicate from "replicate";

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).json({ error: "Brak zdjęcia lub promptu." });
  }

  try {
    const replicate = new Replicate({ 
      auth: process.env.REPLICATE_API_TOKEN 
    });

    console.log("Wysyłam do Replicate:", prompt);

    const output = await replicate.run(
      "google/nano-banana",
      {
        input: {
          "image_input": [image],
          "prompt": prompt
        }
      }
    );

    // Wyciąganie URL - model nano-banana zwraca URL bezpośrednio lub w tablicy
    let url = Array.isArray(output) ? output[0] : (output?.url || output);
    
    // Ważne: Replicate czasem zwraca obiekt ReadableStream, zamieńmy to na string jeśli trzeba
    if (typeof url !== 'string') {
        url = url.toString();
    }

    console.log("Sukces! URL:", url);
    return res.status(200).json({ url: url });

  } catch (error) {
    console.error("BŁĄD REPLICATE:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
