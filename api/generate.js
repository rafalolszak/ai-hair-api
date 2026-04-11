import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const { image } = req.body;
    if (!image) throw new Error("Brak zdjęcia w żądaniu");

    // POPRAWKA: Replicate czasem nie lubi nagłówka "data:image/jpeg;base64,"
    // Jeśli image zaczyna się od "data:", wysyłamy go tak jak jest, 
    // ale upewniamy się, że to pojedynczy string (nie tablica).
    
    const prompty = ["long straight hair style", "short curly pink hair"];
    const wyniki = [];

    for (const p of prompty) {
      // Używamy pełnej nazwy modelu z konkretną wersją
      const output = await replicate.run(
        "google/nano-banana:aba390731f24d142d765f0ed179f82d00160b5e39be33834a36f4520e5c9a70f",
        {
          input: {
            "image_input": image, // Spróbuj bez nawiasów kwadratowych []
            "prompt": p
          }
        }
      );

      // Pobieranie URL
      let url = Array.isArray(output) ? output[0] : (output?.url ? (typeof output.url === 'function' ? output.url() : output.url) : output);
      wyniki.push({ prompt: p, url: url });
    }

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("Szczegółowy błąd:", error);
    // Zwracamy treść błędu do Shopify, żebyś widział ją na ekranie
    return res.status(500).json({ error: error.message });
  }
}
