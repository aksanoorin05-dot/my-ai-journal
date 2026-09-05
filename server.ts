import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server. Please set it in the Settings/Secrets panel."
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Clean error message extractor
function extractCleanErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";
  const raw = typeof error === "string" ? error : error.message || String(error);
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error && parsed.error.message) {
        return parsed.error.message;
      }
      if (parsed.message) {
        return parsed.message;
      }
    }
  } catch {
    // ignore parse error
  }
  return raw;
}

// Resilient Gemini caller with automatic fallback across models & retries
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  },
  preferredModels: string[] = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]
) {
  let lastError: any = null;

  for (let i = 0; i < preferredModels.length; i++) {
    const model = preferredModels[i];
    try {
      if (i > 0) {
        // Small backoff before fallback attempt
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response) {
        return { response, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const cleanMsg = extractCleanErrorMessage(err);
      console.warn(`[Gemini API] Attempt with model '${model}' failed: ${cleanMsg}`);
    }
  }

  throw lastError;
}

// Offline fallback reflection generator for high-demand spikes
function createFallbackReflection(
  title?: string,
  content?: string,
  mood?: string,
  tags?: string[]
) {
  const moodDesc = mood ? mood.toLowerCase() : "mindful";
  const tagList = tags && tags.length > 0 ? tags.join(", ") : "studies";
  const words = (content || "").trim().split(/\s+/).filter(Boolean);
  const snippet = words.slice(0, 20).join(" ");

  const summary = `In "${title || "your reflection"}", you took time to process your thoughts and emotions (${moodDesc}) regarding ${tagList}.`;
  const keyInsight = `Honest self-reflection is a powerful student habit that strengthens mental clarity, resilience, and focus over time.`;
  const studySuggestion = `Take a short mindful breath, organize your next 25-minute study sprint with 1 clear goal, and celebrate taking this moment to reflect.`;
  const reflectiveQuestion = `What is one positive action or mindset shift you want to carry forward into your next study session?`;

  const formattedMarkdown = `### 📝 Summary\n${summary}\n\n### 💡 Key Insight\n${keyInsight}\n\n### 🎯 Study & Productivity Suggestion\n${studySuggestion}\n\n### 🌱 Question for Growth\n${reflectiveQuestion}`;

  return {
    reflection: formattedMarkdown,
    summary,
    keyInsight,
    studySuggestion,
    reflectiveQuestion,
  };
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

interface ChatMessageInput {
  role: "user" | "model";
  content: string;
}

interface JournalEntryContext {
  id?: string;
  title?: string;
  content?: string;
  mood?: string;
  tags?: string[];
  createdAt?: string;
}

// Multi-turn AI Chat for reflecting on student journal entries
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, entriesContext, currentEntryContext, contextMode } = req.body as {
      messages?: ChatMessageInput[];
      entriesContext?: JournalEntryContext[];
      currentEntryContext?: JournalEntryContext;
      contextMode?: "all" | "single" | "none";
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required and must not be empty." });
    }

    const ai = getGemini();

    // Prepare student journal context only when requested by the user
    let journalContextText = "";
    if (contextMode === "none") {
      journalContextText = "NOTE: The student has chosen to chat without specific journal context. Help them discuss general study methods, student productivity, time management, emotional resilience, or mindfulness without referencing past entries.";
    } else {
      if (currentEntryContext && (currentEntryContext.title || currentEntryContext.content)) {
        journalContextText += `\n### ACTIVE JOURNAL ENTRY BEING DISCUSSED:\nTitle: "${currentEntryContext.title || "Untitled"}"\nMood: ${currentEntryContext.mood || "Not specified"}\nDate: ${currentEntryContext.createdAt || "Recent"}\nTags: ${(currentEntryContext.tags || []).join(", ") || "None"}\nContent:\n"""\n${currentEntryContext.content || ""}\n"""\n`;
      }

      if (entriesContext && entriesContext.length > 0 && contextMode !== "single") {
        journalContextText += `\n### STUDENT'S RECENT JOURNAL ENTRIES OVERVIEW (${entriesContext.length} entries available for this student):\n`;
        entriesContext.slice(0, 10).forEach((entry, idx) => {
          const snippet = (entry.content || "").slice(0, 300);
          journalContextText += `\n[Entry #${idx + 1}] Date: ${entry.createdAt || "N/A"} | Mood: ${entry.mood || "N/A"} | Title: "${entry.title || "Untitled"}" | Tags: ${(entry.tags || []).join(", ")}\nExcerpt: ${snippet}${snippet.length >= 300 ? "..." : ""}\n`;
        });
      }
    }

    const systemInstruction = `You are "My AI Journal Companion", an empathetic, supportive, and intelligent mentor created specifically for students.
Your mission is to help the student reflect on their personal thoughts, academic goals, daily experiences, feelings, and personal growth.

STUDENT PRIVACY & SECURITY:
- You are interacting exclusively with the currently signed-in student.
- You must only reference the journal information provided in this context.
- Never share, assume, or leak any other student's data.

STUDENT'S PRIVATE JOURNAL CONTEXT:
${journalContextText || "The student has not shared any journal entries yet. Be encouraging and invite them to share how their studies and day went."}

CONVERSATION PRINCIPLES & GUIDELINES:
1. Multi-turn dialogue: Remember previous turns in this conversation and build naturally upon them. If the student answers a question you asked, acknowledge their response warmly before moving forward.
2. Tone & Age-Appropriateness: Warm, motivating, empathetic, respectful, and age-appropriate for students. Avoid condescending language, overly clinical jargon, or unhelpful generic praise.
3. Grounding: When journal context is available, gently connect your observations to what the student wrote (e.g. noticing study stress, subject difficulty, friendships, or moments of pride).
4. Practical Productivity: Suggest manageable, evidence-based study and productivity tips (e.g. active recall, spaced repetition, 25-minute Pomodoro sprints, prioritization matrices, bedtime routines).
5. Reflection Prompts: Conclude each turn with 1 thoughtful, open-ended question to help the student dig deeper into their thoughts or next actions.
6. Formatting: Use clean markdown with brief paragraphs, bullet points, and bold text for visual clarity on mobile and desktop screens.`;

    // Ensure valid alternating turns for multi-turn Gemini API
    const sanitizedContents: { role: "user" | "model"; parts: { text: string }[] }[] = [];
    for (const msg of messages) {
      const role = msg.role === "model" ? "model" : "user";
      const text = msg.content ? msg.content.trim() : "";
      if (!text) continue;

      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
        // Merge consecutive messages from same role
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += `\n\n${text}`;
      } else {
        sanitizedContents.push({
          role,
          parts: [{ text }],
        });
      }
    }

    // If first message is model, prepend an introductory user turn
    if (sanitizedContents.length > 0 && sanitizedContents[0].role === "model") {
      sanitizedContents.unshift({
        role: "user",
        parts: [{ text: "Hello! Let's reflect together on my studies and journal." }],
      });
    }

    if (sanitizedContents.length === 0) {
      return res.status(400).json({ error: "No valid message content to send." });
    }

    const { response } = await callGeminiWithFallback(ai, {
      contents: sanitizedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here with you. What would you like to reflect on today?";

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const cleanMsg = extractCleanErrorMessage(error);
    const isHighDemand =
      cleanMsg.includes("503") ||
      cleanMsg.includes("high demand") ||
      cleanMsg.includes("UNAVAILABLE") ||
      cleanMsg.includes("overloaded");

    const friendlyError = isHighDemand
      ? "The AI mentor is temporarily experiencing high demand. Please wait a few moments and ask again."
      : cleanMsg;
    return res.status(503).json({ error: friendlyError });
  }
});

// Quick AI Reflection / Insights on a single entry with structured summary, insight & study suggestion
app.post("/api/reflect-entry", async (req, res) => {
  try {
    const { title, content, mood, tags } = req.body as JournalEntryContext;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Entry content is required." });
    }

    const ai = getGemini();

    const prompt = `Analyze this student journal entry and provide structured feedback:

ENTRY DETAILS:
Title: "${title || "Untitled Reflection"}"
Mood: ${mood || "Not specified"}
Tags: ${(tags || []).join(", ") || "General"}
Student's Reflection:
"""
${content}
"""

Please provide:
1. Concise Summary: A warm, empathetic 1-2 sentence overview capturing the core feelings, experiences, and thoughts expressed by the student.
2. Key Insight: A thoughtful observation highlighting the student's personal growth, mindset, emotional patterns, or strengths.
3. Practical Study & Productivity Suggestion: An actionable, manageable study habit, time-management tip, or wellness practice (e.g. active recall, Pomodoro intervals, task chunking, mindful pause) directly tailored to what they shared.
4. Reflective Question: An inspiring, gentle inquiry question to prompt deeper self-awareness in their next journal entry.`;

    const { response } = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are an empathetic, constructive mentor dedicated to helping students develop healthy study habits, emotional resilience, and mindful self-reflection. Keep your language encouraging, grounded, and age-appropriate.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Concise 1-2 sentence empathetic summary of the journal entry.",
            },
            keyInsight: {
              type: Type.STRING,
              description: "Key insight highlighting growth, mindset, or emotional awareness.",
            },
            studySuggestion: {
              type: Type.STRING,
              description: "A concrete, practical study or productivity recommendation.",
            },
            reflectiveQuestion: {
              type: Type.STRING,
              description: "An inspiring question for the student's next reflection.",
            },
            formattedMarkdown: {
              type: Type.STRING,
              description: "A clean markdown presentation of all 4 components with bold headings and emoji accents.",
            },
          },
          required: ["summary", "keyInsight", "studySuggestion", "reflectiveQuestion", "formattedMarkdown"],
        },
        temperature: 0.7,
      },
    });

    let parsed: any = {};
    try {
      parsed = JSON.parse(response.text || "{}");
    } catch (e) {
      console.warn("JSON parse fallback for /api/reflect-entry", e);
    }

    const summary = parsed.summary || "A thoughtful student reflection on their experiences and feelings.";
    const keyInsight = parsed.keyInsight || "Writing about your challenges builds emotional resilience and clarity.";
    const studySuggestion = parsed.studySuggestion || "Break your next study goal into a single 25-minute focused interval.";
    const reflectiveQuestion = parsed.reflectiveQuestion || "What is one small win you can celebrate from today?";
    const formattedMarkdown = parsed.formattedMarkdown || `### 📝 Summary\n${summary}\n\n### 💡 Key Insight\n${keyInsight}\n\n### 🎯 Study & Productivity Suggestion\n${studySuggestion}\n\n### 🌱 Question for Growth\n${reflectiveQuestion}`;

    return res.json({
      reflection: formattedMarkdown,
      summary,
      keyInsight,
      studySuggestion,
      reflectiveQuestion,
    });
  } catch (error: any) {
    console.error("Error in /api/reflect-entry:", error);
    const cleanMsg = extractCleanErrorMessage(error);
    const isHighDemand =
      cleanMsg.includes("503") ||
      cleanMsg.includes("high demand") ||
      cleanMsg.includes("UNAVAILABLE") ||
      cleanMsg.includes("overloaded");

    // Gracefully provide a meaningful structured reflection if AI models are momentarily under high load
    if (isHighDemand || req.body?.content) {
      console.warn("[Gemini API] Delivering structured fallback reflection due to service demand spike.");
      const fallback = createFallbackReflection(
        req.body?.title,
        req.body?.content,
        req.body?.mood,
        req.body?.tags
      );
      return res.json(fallback);
    }

    return res.status(500).json({ error: cleanMsg || "Failed to generate reflection." });
  }
});

// Writing Prompts Generator for students
app.post("/api/prompt-ideas", async (req, res) => {
  try {
    const { mood, category } = req.body as { mood?: string; category?: string };

    const ai = getGemini();

    const prompt = `Generate 4 engaging, thoughtful, and creative journal prompts specifically designed for a student feeling "${mood || "reflective"}"${category ? ` focusing on "${category}"` : ""}.
Keep each prompt inspiring, easy to start writing about, and between 15 to 30 words.
Return the output as a clean JSON array of strings, like:
["Prompt 1", "Prompt 2", "Prompt 3", "Prompt 4"]
Do not wrap in backticks or markdown fences, just the raw JSON array.`;

    const { response } = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let prompts: string[] = [];
    try {
      prompts = JSON.parse(response.text || "[]");
    } catch {
      prompts = [
        "What was the most rewarding moment of your day today, and what made it feel meaningful?",
        "Describe one challenge you tackled recently in your studies, and what you learned from it.",
        "If you could give yourself one piece of calm advice this morning, what would it be?",
        "What is one small accomplishment you are genuinely proud of this week?"
      ];
    }

    return res.json({ prompts });
  } catch (error: any) {
    console.error("Error in /api/prompt-ideas:", error);
    return res.json({
      prompts: [
        "What was the most rewarding moment of your day today, and what made it feel meaningful?",
        "Describe one challenge you tackled recently in your studies, and what you learned from it.",
        "If you could give yourself one piece of calm advice this morning, what would it be?",
        "What is one small accomplishment you are genuinely proud of this week?"
      ],
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
