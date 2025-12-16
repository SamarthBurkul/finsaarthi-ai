const express=require('express')
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("Prompt received:", prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ]
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini raw response:", data); // 👈 VERY IMPORTANT

    if (!response.ok) {
      return res.status(500).json({ error: data });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.json({ reply });

  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Gemini API error" });
  }
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
