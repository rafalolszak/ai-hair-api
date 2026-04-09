export default async function handler(req, res) {
  try {
    const { image } = req.body;

    const styles = [
      "short bob haircut",
      "long wavy hair",
      "curly hairstyle"
    ];

    const results = [];

    for (let style of styles) {
      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: (() => {
          const formData = new FormData();

          const base64Data = image.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          formData.append("image", new Blob([buffer]), "photo.png");

          formData.append(
            "prompt",
            `Change hairstyle to ${style}, keep same face, same person, realistic`
          );

          formData.append("model", "gpt-image-1");

          return formData;
        })()
      });

      const data = await response.json();
      results.push(data.data[0].b64_json);
    }

    res.status(200).json({ images: results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
