import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki pozwalające Shopify na połączenie się z Vercelem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Konfiguracja API (Klucz pobierany z Environment Variables na Vercel)
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // LISTA TWOICH PROMPTÓW
  const prompty = [
    "long straight hair style",
    "short curly pink hair",
    "blonde wavy hair style",
    "braided hair style"
  ];

  const wyniki = [];

  try {
    // Pętla przechodząca przez każdy prompt z listy
    for (const aktualnyPrompt of prompty) {
      const output = await replicate.run(
        "google/nano-banana",
        {
          input: {
            image_input: ["https://formmedes.pl/wp-content/uploads/2022/11/implanty-twarzy-formmedes.jpg"],
            prompt: aktualnyPrompt,
          }
        }
      );

      // Dodajemy wynik do listy, którą odeślemy do Shopify
      wyniki.push({
        prompt: aktualnyPrompt,
        url: typeof output.url === 'function' ? output.url() : output
      });
    }

    // Wysyłamy wszystkie linki naraz do Shopify
    return res.status(200).json(wyniki);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
