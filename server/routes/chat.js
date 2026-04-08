
const express = require("express");
const router = express.Router();
const { getChatResponse } = require("../utils/chatbot");

// POST: Chat with AI
router.post("/", async (req, res) => {
  try {
    const { message, disease } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = await getChatResponse(message, disease);

    res.json({ reply });
  } catch (error) {
    console.error("❌ Chat Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;