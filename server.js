
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    klingConfigured: Boolean(
      process.env.KLING_API_URL &&
      process.env.KLING_AUTH_VALUE
    )
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt,
      first_frame,
      middle_frame,
      last_frame
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Vui lòng nhập prompt!"
      });
    }

    if (!process.env.KLING_API_URL ||
        !process.env.KLING_AUTH_VALUE) {
      return res.status(500).json({
        error: "Chưa cấu hình Kling API!"
      });
    }

    const contents = [
      {
        type: "prompt",
        text: prompt
      }
    ];

    if (first_frame) {
      contents.push({
        type: "first_frame",
        url: first_frame,
        id: "frame_1"
      });
    }

    if (middle_frame) {
      contents.push({
        type: "middle_frame",
        url: middle_frame,
        id: "frame_2"
      });
    }

    if (last_frame) {
      contents.push({
        type: "last_frame",
        url: last_frame,
        id: "frame_3"
      });
    }

    const response = await fetch(
      process.env.KLING_API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [process.env.KLING_AUTH_HEADER || "Authorization"]:
            process.env.KLING_AUTH_VALUE
        },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();

    res.status(response.status).json({
      success: response.ok,
      result: data
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Kling AI đang chạy tại cổng " + PORT);
});
      
