import { pipeline } from "@xenova/transformers";
import express from "express";
import cors from "cors";
import si from "systeminformation";

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001;

let textGenerator;
let modelLoading = false;
let modelError = null;

// Preprompt system context for BIOS technician tone
const systemPrompt = `
You are an expert BIOS technician providing clear and offline BIOS error help.

Return exactly THREE short lines:
1. Plain English name of the error (max 10 words).
2. One-sentence cause (max 20 words).
3. Three numbered fix steps, all on the same line, separated by semicolons.

No "Sure! Here's a brief explanation of each part",
Do NOT say anything else, just directly straight to the point!
Do NOT include links, prompt text, or extra commentary.
Keep output terminal-friendly and short.
Do NOT give reference to any tool.
Begin the answer directly:
`;

function snapToStandardRAMSize(sizeGB) {
  const commonSizes = [4, 8, 16, 32, 64, 128];
  const closest = commonSizes.reduce((prev, curr) =>
    Math.abs(curr - sizeGB) < Math.abs(prev - sizeGB) ? curr : prev
  );
  return `${closest}`;
}


async function initializeModel() {
  if (modelLoading) return;
  modelLoading = true;

  try {
    console.log("Starting model loading...");

    textGenerator = await pipeline("text-generation", "Xenova/Qwen1.5-1.8B-Chat", {
      quantized: true,
      progress_callback: (progress) => {
        if (progress.total > 0) {
          console.log(`Download progress: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        }
      },
    });

    console.log("Model successfully loaded and ready");
  } catch (error) {
    console.error("Model loading failed:", error);
    modelError = error;
  } finally {
    modelLoading = false;
  }
}

app.get('/system-info', async (req, res) => {
  try {
    const [bios, cpu, mem, disk, graphics] = await Promise.all([
      si.bios(),
      si.cpu(),
      si.mem(),
      si.diskLayout(),
      si.graphics(),
    ]);

    res.json({
      biosVersion: `${bios.version} (${bios.releaseDate})`,
      cpu: `${cpu.manufacturer} ${cpu.brand}`,
      memory: `${snapToStandardRAMSize(mem.total / (1024 ** 3))}GB`,
      storage: `${(disk[0].size / 1e12).toFixed(1)}TB ${disk[0].type}`,
      bootMode: 'UEFI',
      graphics: `${graphics.controllers[0].model}`,

    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch system info' });
  }
});

app.get("/api/health", (req, res) => {
  if (modelError) {
    return res.status(500).json({ status: "error", message: modelError.message });
  }
  if (!textGenerator) {
    return res.status(503).json({ status: "loading", message: "Model is still loading" });
  }
  res.json({ status: "ready", message: "Model is ready for requests" });
});

app.post("/api/generate", async (req, res) => {
  if (modelError) {
    return res.status(500).json({ error: "Model loading failed", message: modelError.message });
  }

  if (!textGenerator) {
    return res.status(503).json({ error: "Model not ready yet", message: "Try again later" });
  }

  try {
    const { prompt, maxTokens = 300, temperature = 0.4 } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const errorCode = prompt.trim();
    const fullPrompt = `${systemPrompt}\n${errorCode}`;

    console.log(`Generating response for prompt: "${errorCode}"`);

    const output = await textGenerator(fullPrompt, {
      max_new_tokens: Math.min(Number(maxTokens), 300),
      temperature: Math.min(Math.max(Number(temperature), 0.1), 1.0),
      do_sample: true,
      stop: ["\n\n"],
    });

    let responseText = output[0].generated_text || "";

    // Remove echoed prompt if any
    if (responseText.startsWith(fullPrompt)) {
      responseText = responseText.replace(fullPrompt, "").trim();
    }

    // Keep only first 3 non-empty lines
    responseText = responseText
      .split("\n")
      .filter((line) => line.trim() !== "")
      .slice(0, 3)
      .join("\n");

    res.json({
      generated_text: responseText,
      usage: {
        prompt_tokens: output[0].usage?.prompt_tokens || "unknown",
        generated_tokens: output[0].usage?.generated_tokens || "unknown",
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({ error: "Generation failed", message: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

initializeModel()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log("💻 System information endpoint: GET /system-info");
      console.log("🩺 Health check: GET /api/health");
      console.log("✍ Generate endpoint: POST /api/generate");
    });
  })
  .catch((err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
  });
