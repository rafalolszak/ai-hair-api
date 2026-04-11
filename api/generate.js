import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Dodaliśmy GET
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // USUŃ sekcję: if (req.method !== 'POST'), żeby przeglądarka mogła wejść na stronę
  
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const prompty = [
    "long straight hair style",
    "short curly pink hair"
  ];

  try {
    const wyniki = [];
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

      const url = typeof output.url === 'function' ? output.url() : (Array.isArray(output) ? output[0] : output);
      wyniki.push({ prompt: aktualnyPrompt, url: url });
    }

    // Wysyłamy JSON, który przeglądarka wyświetli na białym tle
    return res.status(200).json(wyniki);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
