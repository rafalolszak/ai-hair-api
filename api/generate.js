import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    // 🔥 usuń "data:image/...;base64,"
    const base64 = image.split(",")[1];

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: "Realistic hairstyle transformation, same person, new hairstyle",
      size: "1024x1024",
      image: base64
    });

    return res.status(200).json({
      image: response.data[0].url
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      error: e.message
    });
  }
}        model: "gpt-image-1",
        prompt: "Realistic hairstyle transformation, same person, new hairstyle",
        image: imageBuffer
      });

      return res.status(200).json({
        image: response.data[0].url
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message });
    }
  });
}
