const axios = require("axios");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function normalizeDisease(disease) {
  if (!disease || disease === "null" || disease === "undefined") {
    return "not provided";
  }

  return String(disease).trim();
}

function buildPrompt(userMessage, disease) {
  return `Disease context: ${disease}\nUser question: ${userMessage}`;
}

function buildSystemInstruction() {
  return "You are Skinscope's AI skin assistant. Give short, simple, practical guidance for common skin concerns. Mention basic precautions and home care. Remind the user to see a dermatologist for severe, worsening, painful, infected, or persistent symptoms. Do not claim to diagnose with certainty and do not prescribe medicines in a definitive way.";
}

function buildFallbackResponse(userMessage, disease) {
  const normalizedDisease = normalizeDisease(disease);
  const lowerMessage = String(userMessage || "").toLowerCase();
  const conditionGuides = {
    acne: {
      care:
        "Wash gently twice daily, use a non-comedogenic moisturizer and sunscreen, avoid picking, and consider salicylic acid or benzoyl peroxide if your skin tolerates it.",
      precautions:
        "Do not scrub hard, avoid squeezing pimples, keep oily hair and heavy cosmetics away from the face, and change pillow covers regularly."
    },
    eczema: {
      care:
        "Use a fragrance-free moisturizer often, avoid harsh soaps, keep showers short, and watch for triggers like heat, scented products, or rough fabrics.",
      precautions:
        "Avoid scratching, fragranced skin products, very hot water, and fabrics that irritate the skin such as wool."
    },
    psoriasis: {
      care:
        "Keep skin moisturized, avoid scratching, manage stress, and see a dermatologist if plaques are thick, painful, or widespread.",
      precautions:
        "Avoid skin injury, harsh rubbing, smoking, and alcohol excess because these can worsen flares."
    },
    rosacea: {
      care:
        "Use gentle skin care, daily sunscreen, and avoid common triggers such as heat, spicy food, alcohol, and harsh products.",
      precautions:
        "Avoid hot drinks, direct sun, harsh exfoliants, and skincare products that sting or burn."
    },
    fungal: {
      care:
        "Keep the area clean and dry, change sweaty clothes quickly, avoid sharing towels, and seek medical advice if it spreads or keeps returning.",
      precautions:
        "Do not keep damp clothing on, avoid scratching, and avoid sharing personal items like towels or combs."
    },
    rash: {
      care:
        "Avoid new cosmetic products, use gentle skin care, and monitor for pain, swelling, fever, or rapid spreading.",
      precautions:
        "Stop any recently introduced cream or cosmetic, avoid scratching, and get medical help if it spreads quickly."
    }
  };

  const conditionAliases = {
    acne: ["acne", "pimple", "pimples", "zit", "zits"],
    eczema: ["eczema", "dermatitis"],
    psoriasis: ["psoriasis", "psorais", "psorasis", "psoriais", "psoriatic"],
    rosacea: ["rosacea", "redness flare"],
    fungal: ["fungal", "fungus", "ringworm", "tinea", "yeast infection"],
    rash: ["rash", "rashes", "skin allergy", "allergic rash"]
  };

  const detectCondition = () => {
    const conditions = Object.keys(conditionGuides);
    const inMessage = conditions.find((key) =>
      (conditionAliases[key] || [key]).some((alias) => lowerMessage.includes(alias))
    );
    if (inMessage) {
      return inMessage;
    }

    if (normalizedDisease !== "not provided") {
      const predictionText = normalizedDisease.toLowerCase();
      const inPrediction = conditions.find((key) =>
        (conditionAliases[key] || [key]).some((alias) => predictionText.includes(alias))
      );
      if (inPrediction) {
        return inPrediction;
      }
    }

    return null;
  };

  const detectedCondition =
    detectCondition() ||
    (normalizedDisease !== "not provided" ? normalizedDisease : "your skin concern");
  const topic = detectedCondition;
  const guide = conditionGuides[detectedCondition] || null;

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return `Hello! I can help with general skin care guidance for ${topic}. Tell me your symptoms, what is bothering you, or ask about precautions and basic care.`;
  }

  if (lowerMessage.includes("serious") || lowerMessage.includes("doctor")) {
    return `You should see a dermatologist if ${topic} is spreading quickly, very painful, bleeding, infected, or not improving. A doctor is especially important if you also have fever, swelling, pus, severe irritation, or symptoms near the eyes.`;
  }

  if (
    guide &&
    (lowerMessage.includes("precaution") ||
      lowerMessage.includes("avoid") ||
      lowerMessage.includes("careful"))
  ) {
    return `Precautions for ${topic}: ${guide.precautions} Please see a dermatologist if it is severe, infected, or not improving.`;
  }

  if (
    guide &&
    (lowerMessage.includes("treatment") ||
      lowerMessage.includes("care") ||
      lowerMessage.includes("help") ||
      lowerMessage.includes("what should i do"))
  ) {
    return `General care for ${topic}: ${guide.care} Please see a dermatologist if symptoms are severe, getting worse, or not improving.`;
  }

  if (guide) {
    return `General guidance for ${topic}: ${guide.care} Precautions: ${guide.precautions} Please see a dermatologist if symptoms are severe, getting worse, or not improving.`;
  }

  return `Here is some general guidance for ${topic}: Keep the area clean, avoid scratching or harsh products, use gentle fragrance-free skin care, and protect the skin barrier with moisturizer if needed. Please see a dermatologist if symptoms are severe, getting worse, or not improving.`;
}

function extractOpenAIText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const message = data?.output?.find((item) => item.type === "message");
  const textPart = message?.content?.find((item) => item.type === "output_text");

  if (typeof textPart?.text === "string" && textPart.text.trim()) {
    return textPart.text.trim();
  }

  return "";
}

function extractOpenRouterText(data) {
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text.trim() : "";
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

function logProviderError(provider, error) {
  const status = error.response?.status;
  const code = error.response?.data?.error?.code;
  const message =
    error.response?.data?.error?.message ||
    error.response?.data?.error?.status ||
    error.message;

  console.error(
    `${provider} provider error (${status || "request_failed"}${code ? `/${code}` : ""}): ${message}`
  );
}

async function tryOpenRouter(prompt, instructions) {
  if (!process.env.OPENROUTER_API_KEY) {
    return "";
  }

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content: instructions
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 220
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Skinscope"
        },
        proxy: false,
        timeout: 20000
      }
    );

    return extractOpenRouterText(response.data);
  } catch (error) {
    logProviderError("OpenRouter", error);
    return "";
  }
}

async function tryOpenAI(prompt, instructions) {
  if (!process.env.OPENAI_API_KEY) {
    return "";
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: OPENAI_MODEL,
        input: prompt,
        instructions,
        max_output_tokens: 220
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        proxy: false,
        timeout: 20000
      }
    );

    return extractOpenAIText(response.data);
  } catch (error) {
    logProviderError("OpenAI", error);
    return "";
  }
}

async function tryGemini(prompt, instructions) {
  if (!process.env.GEMINI_API_KEY) {
    return "";
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: instructions }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 220
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        proxy: false,
        timeout: 20000
      }
    );

    return extractGeminiText(response.data);
  } catch (error) {
    logProviderError("Gemini", error);
    return "";
  }
}

async function getChatResponse(userMessage, disease) {
  const normalizedDisease = normalizeDisease(disease);
  const prompt = buildPrompt(userMessage, normalizedDisease);
  const instructions = buildSystemInstruction();

  const openRouterReply = await tryOpenRouter(prompt, instructions);
  if (openRouterReply) {
    return openRouterReply;
  }

  const openAIReply = await tryOpenAI(prompt, instructions);
  if (openAIReply) {
    return openAIReply;
  }

  const geminiReply = await tryGemini(prompt, instructions);
  if (geminiReply) {
    return geminiReply;
  }

  return buildFallbackResponse(userMessage, normalizedDisease);
}

module.exports = { getChatResponse };
