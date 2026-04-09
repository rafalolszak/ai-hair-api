export default async function handler(req, res) {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Brak zdjęcia" });
    }

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: "Different modern hairstyle, realistic, same person",
        image: image,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    res.status(200).json({
      image: data.data?.[0]?.url
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
      const data = await response.json();
      results.push(data.data[0].b64_json);
    }

    res.status(200).json({ images: results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
