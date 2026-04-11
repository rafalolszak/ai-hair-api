import Replicate from "replicate";

export default async function handler(req, res) {
  // 1. Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Inicjalizacja Replicate
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompty = [
    "long straight hair style",
    "short curly pink hair",
    "blonde wavy hair style",
    "braided hair style"
  ];

  // TO JEST TWÓJ ADRES NA SZTYWNO
  const MOJE_ZDJECIE = "https://formmedes.pl/wp-content/uploads/2022/11/implanty-twarzy-formmedes.jpg";

  try {
    const wyniki = [];

    // Pętla przez prompty
    for (const p of prompty) {
      console.log("Generuję styl:", p);
      
      const output = await replicate.run(
        "google/nano-banana:aba390731f24d142d765f0ed179f82d00160b5e39be33834a36f4520e5c9a70f",
        {
          input: {
            "image_input": [MOJE_ZDJECIE], // Link wewnątrz tablicy
            "prompt": p
          }
        }
      );

      // Wyciąganie URL w zależności od tego, jak model zwraca wynik
      let finalUrl = "";
      if (Array.isArray(output)) {
        finalUrl = output[0];
      } else if (output && typeof output.url === 'function') {
        finalUrl = output.url();
      } else {
        finalUrl = output;
      }

      wyniki.push({ prompt: p, url: finalUrl });
    }

    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("Błąd serwera:", error.message);
    // Zwracamy błąd 500 zamiast 400, żeby wiedzieć, że to błąd logiki, a nie Twojego zapytania
    return res.status(500).json({ error: error.message });
  }
}
