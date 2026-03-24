import express from "express";
import axios from "axios";
import cors from "cors";
import JSZip from "jszip";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/download-zip", async (req, res) => {
  const { images } = req.body;

  if (!images || !images.length) {
    return res.status(400).send("No images");
  }

  const zip = new JSZip();

  for (let i = 0; i < images.length; i++) {
    const { url, name } = images[i];

    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer"
      });

      const safeName = (name || `image_${i + 1}`).replace(/[\\/:*?"<>|]/g, "_");
      zip.file(`${safeName}.jpg`, response.data);
    } catch (err) {
      console.log("Download error:", url);
    }
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });

  res.set({
    "Content-Type": "application/zip",
    "Content-Disposition": "attachment; filename=images.zip"
  });

  res.send(content);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
