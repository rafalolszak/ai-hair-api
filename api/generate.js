import Replicate from "replicate";

export default async function handler(req, res) {
  // 1. Konfiguracja nagłówków CORS (ważne dla Shopify)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Obsługa wstępnego zapytania przeglądarki (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Akceptujemy tylko metodę POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona. Użyj POST.' });
  }

  // 2. Inicjalizacja Replicate (pobieramy klucz ze zmiennych środowiskowych Vercel)
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    // Pobieramy dane wysłane z Shopify (lub frontendu)
    // Jeśli nie wyślesz obrazka w body, użyje on domyślnego zdjęcia
    const { prompt, image_url } = req.body;
    
    const finalImageUrl = image_url || "https://formmedes.pl/wp-content/uploads/2022/11/implanty-twarzy-formmedes.jpg";

    console.log(`🎨 Generuję dla promptu: ${prompt}`);

    // 3. Uruchomienie modelu
    const output = await replicate.run(
      "google/nano-banana",
      {
        input: {
          image_input: [finalImageUrl],
          prompt: prompt,
        }
      }
    );

    // 4. Pobieranie URL wyniku
    // Uwaga: W zależności od wersji biblioteki output może być obiektem z .url() 
    // lub bezpośrednio stringiem/tablicą stringów.
    let resultUrl = "";
    if (typeof output.url === 'function') {
      resultUrl = output.url();
    } else if (Array.isArray(output)) {
      resultUrl = output[0];
    } else {
      resultUrl = output;
    }

    // Wysyłamy odpowiedź do Shopify
    return res.status(200).json({ 
      success: true, 
      url: resultUrl,
      prompt: prompt 
    });

  } catch (error) {
    console.error("❌ Błąd Replicate:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
