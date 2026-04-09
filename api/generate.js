export default async function handler(req, res) {
  try {
    // 🔥 ręczne pobranie body (Vercel często psuje req.body)
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();

    if (!data) {
      return res.status(400).json({
        error: "Brak body"
      });
    }

    const body = JSON.parse(data);

    const image = body.image;

    if (!image) {
      return res.status(400).json({
        error: "Brak image"
      });
    }

    // 🔥 TEST — zawsze zwraca obraz
    return res.status(200).json({
      image: "https://picsum.photos/400/500?random=" + Math.random()
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message
    });
  }
}
