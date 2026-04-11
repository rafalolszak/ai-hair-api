import Replicate from "replicate";

export default async function handler(req, res) {
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const { prompt } = req.body;

    const output = await replicate.run(
      "google/nano-banana",
      {
        input: {
          image_input: [
            "[https://formmedes.pl/wp-content/uploads/2022/11/implanty-twarzy-formmedes.jpg]"
          ],
          prompt: "znajdż włosy na zdjęciu i zmień je na długie",
        },
      }
    );

    res.status(200).json({
      image: output.url(),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
