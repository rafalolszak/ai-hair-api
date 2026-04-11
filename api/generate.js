import Replicate from "replicate";

export default async function handler(req, res) {
  // 1. Nagłówki CORS - pozwalają Shopify na komunikację z Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // 2. Pobieranie zdjęcia z zapytania (jeśli przesłano przez POST) 
  // lub użycie domyślnego, jeśli to zwykłe wejście GET
  let imageSource = "https://formmedes.pl/wp-content/uploads/2022/11/implanty-twarzy-formmedes.jpg";
  
  if (req.method === 'POST' && req.body && req.body.image) {
    imageSource = req.body.image;
  }

  const prompty = [
    "long straight hair style",
    "short curly pink hair"
  ];

  try {
    const wyniki = [];

    for (const aktualnyPrompt of prompty) {
      console.log(`Generuję: ${aktualnyPrompt}`);
      
      const output = await replicate.run(
        "google/nano-banana:aba390731f24d142d765f0ed179f82d00160b5e39be33834a36f4520e5c9a70f",
        {
          input: {
            // Replicate oczekuje zdjęcia jako elementu tablicy lub stringa
            "image_input": [imageSource], 
            "prompt": aktualnyPrompt,
          }
        }
      );

      // Logika wyciągania poprawnego adresu URL z wyniku modelu
      let url = "";
      if (Array.isArray(output)) {
        url = output[0];
      } else if (output && typeof output.url === 'function') {
        url = output.url();
      } else {
        url = output;
      }

      wyniki.push({ prompt: aktualnyPrompt, url: url });
    }

    // 3. Zwrócenie wyników do Shopify
    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("Błąd Replicate:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
