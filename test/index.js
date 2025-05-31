import { pipeline } from "@xenova/transformers";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

let textGenerator;
let modelLoading = false;
let modelError = null;

// Preprompt template for BIOS-level support
const systemPrompt = `
### BIOS ERROR:
User is facing a BIOS problem.
Explain clearly what it's exact name is, why it happens, and how to fix it.
Give simple steps a beginner can follow.

### RESPONSE:
`;

async function initializeModel() {
  if (modelLoading) return;
  modelLoading = true;

  try {
    console.log("Starting model loading...");

    // Switch to better small model
    textGenerator = await pipeline(
      "text-generation",
      "Xenova/Qwen1.5-1.8B-Chat",
      {
        quantized: true,
        progress_callback: (progress) => {
          if (progress.total > 0) {
            console.log(
              `Download progress: ${Math.round(
                (progress.loaded / progress.total) * 100
              )}%`
            );
          }
        },
      }
    );

    console.log("Model successfully loaded and ready");
  } catch (error) {
    console.error("Model loading failed:", error);
    modelError = error;
  } finally {
    modelLoading = false;
  }
}

app.get("/api/health", (req, res) => {
  if (modelError) {
    return res
      .status(500)
      .json({ status: "error", message: modelError.message });
  }
  if (!textGenerator) {
    return res
      .status(503)
      .json({ status: "loading", message: "Model is still loading" });
  }
  res.json({ status: "ready", message: "Model is ready for requests" });
});

app.post("/api/generate", async (req, res) => {
  if (modelError) {
    return res
      .status(500)
      .json({ error: "Model loading failed", message: modelError.message });
  }

  if (!textGenerator) {
    return res
      .status(503)
      .json({ error: "Model not ready yet", message: "Try again later" });
  }

  try {
    const { prompt, maxTokens = 150, temperature = 0.5 } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const fullPrompt = `${systemPrompt}${prompt.trim()}\n\n### RESPONSE:\n`;

    console.log(`Generating response for prompt: "${prompt.slice(0, 100)}..."`);

    const output = await textGenerator(fullPrompt, {
      max_new_tokens: Math.min(Number(maxTokens), 200),
      temperature: Math.min(Math.max(Number(temperature), 0.1), 1.0),
      do_sample: true,
    });

    console.log("Raw output from textGenerator:", output);

    res.json({
      generated_text: output[0].generated_text,
      usage: {
        prompt_tokens: output[0].usage?.prompt_tokens || "unknown",
        generated_tokens: output[0].usage?.generated_tokens || "unknown",
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    res
      .status(500)
      .json({ error: "Generation failed", message: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

initializeModel()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log("🩺 Health check: GET /api/health");
      console.log("✍ Generate endpoint: POST /api/generate");
    });
  })
  .catch((err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });
