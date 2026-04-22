import Replicate from "replicate";

export default async function handler(req, res) {
  // Nagłówki CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, prompt: rawPrompt } = req.body;

  if (!image) return res.status(400).json({ error: "Brak zdjęcia." });

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  // UZUPEŁNIJ SŁOWNIK: np. "Bob": "short bob hairstyle"
  const hairDictionary = {
    
    // Dodaj resztę swoich fryzur tutaj
  };

  let promptyDoWykonania = [];

  if (rawPrompt && rawPrompt.includes("Styles:")) {
    const stylesPart = rawPrompt.split('Details:')[0].replace('Styles:', '').trim();
    const selectedKeys = stylesPart.split(',').map(s => s.trim());
    const details = rawPrompt.split('Details:')[1]?.trim() || "";

    promptyDoWykonania = selectedKeys
      .filter(key => hairDictionary[key]) 
      .map(key => ({
        label: key,
        fullPrompt: `Change hairstyle to ${hairDictionary[key]}, ${details}. Nie zmieniaj jej twarzy.`
      }));
  }

  if (promptyDoWykonania.length === 0) {
    promptyDoWykonania = [{ label: "Custom", fullPrompt: rawPrompt }];
  }

  try {
    const generationPromises = promptyDoWykonania.slice(0, 1).map(async (item) => {
      console.log("Wysyłam prompt do Replicate:", item.fullPrompt);
      
      const output = await replicate.run(
        "bytedance/seedream-4.5",
        {
          input: {
            "image_input": [image],
            "prompt": item.fullPrompt,
            "aspect_ratio": "match_input_image",
             "size": "2K",
          }
        }
      );

      console.log("Surowy output z Replicate:", JSON.stringify(output));

      // Obsługa formatu zwracanego przez model (instrukcja .url())
      let url = "";
      if (Array.isArray(output) && output.length > 0) {
        url = typeof output[0].url === 'function' ? output[0].url() : output[0].url;
      } else if (output && typeof output.url === 'function') {
        url = output.url();
      } else {
        url = output; // Fallback
      }

      return { prompt: item.label, url: url };
    });

    const wyniki = await Promise.all(generationPromises);
    console.log("Wynik wysyłany do frontendu:", wyniki);
    return res.status(200).json(wyniki);

  } catch (error) {
    console.error("BŁĄD BACKEND:", error);
    return res.status(500).json({ error: error.message });
  }
}
