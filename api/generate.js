import Replicate from "replicate";

export default async function handler(req, res) {
  // CORS - Pozwalamy na komunikację z Twoim sklepem
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image, prompt } = req.body;

  if (!image || !prompt) {
    return res.status(400).json({ error: "Brak zdjęcia lub opisu fryzury." });
  }

  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Model nano-banana przyjmuje tablicę obrazów. 
    // Upewniamy się, że obraz jest w poprawnym formacie.
    const output = await replicate.run(
      "google/nano-banana",
      {
        input: {
          image_input: [image], // Przekazujemy zdjęcie (URL lub Base64)
          prompt: prompt,       // Np. "sleek straight long hair, blonde color"
        },
      }
    );

    // Wyciąganie URL zdjęcia z odpowiedzi Replicate
    let imageUrl = "";
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === "string") {
      imageUrl = output;
    } else {
      imageUrl = output?.url || (typeof output?.output === 'string' ? output.output : output?.output?.[0]);
    }

    // Obsługa nietypowych formatów (funkcja/stream)
    if (typeof imageUrl === "function") imageUrl = imageUrl();
    if (imageUrl && typeof imageUrl !== 'string' && imageUrl.toString) imageUrl = imageUrl.toString();

    if (!imageUrl) {
      console.error("Błąd formatu wyjściowego:", JSON.stringify(output));
      throw new Error("Model nie wygenerował poprawnego adresu URL zdjęcia.");
    }

    // Zwracamy czysty wynik do frontendu
    return res.status(200).json({ url: imageUrl });

  } catch (error) {
    console.error("Błąd serwera (Replicate):", error.message);
    return res.status(500).json({
      error: "AI ma teraz dużo pracy, spróbuj ponownie za chwilę.",
      details: error.message
    });
  }
}
