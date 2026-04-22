
 import Replicate from "replicate";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, prompt: rawPrompt } = req.body;

  if (!image) return res.status(400).json({ error: "Brak zdjęcia." });

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  // --- MAPA STAŁYCH PROMPTÓW ---
  const hairDictionary = {
   
  };

  let promptyDoWykonania = [];

  if (rawPrompt && rawPrompt.includes("Styles:")) {
    // 1. Wyciągamy nazwy fryzur (np. "Straight, Bob")
    const stylesPart = rawPrompt.split('Details:')[0].replace('Styles:', '').trim();
    const selectedKeys = stylesPart.split(',').map(s => s.trim());
    
    // 2. Wyciągamy dodatki (np. "blond")
    const details = rawPrompt.split('Details:')[1]?.trim() || "";

    // 3. Budujemy listę zadań na podstawie słownika
    promptyDoWykonania = selectedKeys
      .filter(key => hairDictionary[key]) // bierzemy tylko te, które mamy w słowniku
      .map(key => ({
        label: key,
       fullPrompt: `change hairstyle to ${hairDictionary[key]}, ${details}, Nie zmieniaj jej twarzy.`
      }));
  }

  // Fallback
  if (promptyDoWykonania.length === 0) {
    promptyDoWykonania = [{ label: "Custom", fullPrompt: rawPrompt }];
  }

  try {
    // Wysyłamy wszystkie zapytania naraz (równolegle), żeby nie wyrzuciło błędu czasu
    const generationPromises = promptyDoWykonania.slice(0, 3).map(async (item) => { // limit do 3 naraz dla bezpieczeństwa
      const output = await replicate.run(
        "google/nano-banana",
        {
          input: {
            "image_input": [image],
            "prompt": item.fullPrompt
          }
        }
      );

      let url = Array.isArray(output) ? output[0] : (output?.url || output);
      if (typeof url === 'function') url = url();

      return { prompt: item.label, url: url };
    });

    const wyniki = await Promise.all(generationPromises);
    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
