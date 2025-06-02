# 🔧 BIOSage 2.0: Smart BIOS Companion with Integrated Local LLM

Welcome to **BIOSage 2.0**, a next-generation, intelligent BIOS-style web interface designed to replace outdated, static BIOS UIs with an AI-powered system insight platform. Featuring real-time diagnostics, human-readable explanations, and multilingual support — all while running offline or over LAN.

## 🚀 Project Highlights

- ✅ Reimagined BIOS Interface with terminal-inspired UI
- 🧠 Integrated LLM (LLaMA 3.2B via Ollama) for smart responses and diagnostics
- 🌐 Language translation for LLM outputs: **Hindi**, **English**, **Russian**
- 📦 Full system diagnostics via `systeminformation` module
- 🔌 Seamless backend-to-AI integration using local EC2 instance
- 📊 Real-time monitoring of CPU, RAM, storage, network, temps, and more
- 🔒 Works offline (LAN mode) with private EC2-hosted LLM — No internet needed

---

## 🧑‍💻 Tech Stack

| Layer        | Tech Used                                 |
|--------------|--------------------------------------------|
| **Frontend** | Next.js, Tailwind CSS, React, TypeScript   |
| **Backend**  | Node.js, Express, systeminformation        |
| **LLM Engine** | [Ollama](https://ollama.com) running LLaMA 3.2B |
| **Hosting**  | Vercel (frontend), EC2 (backend LLM instance) |
| **Translation** | Google Translate API / Custom Dictionary Map |

---

## 📸 Screenshots

### BIOSage Landing Page
![system-stats](https://github.com/avyuktsoni0731/BIOSage/blob/f6e62f2865992dd27cd9115eb9ee4d314bf10b3d/public/landing.png)

### Error Response
![error-response](https://github.com/avyuktsoni0731/BIOSage/blob/f6e62f2865992dd27cd9115eb9ee4d314bf10b3d/public/response.png)

### EC2 Ollama Response
![ollama-response](https://github.com/avyuktsoni0731/BIOSage/blob/f6e62f2865992dd27cd9115eb9ee4d314bf10b3d/public/ollama-response.png)

### Hardware Monitor
![hardware-monitor](https://github.com/avyuktsoni0731/BIOSage/blob/f6e62f2865992dd27cd9115eb9ee4d314bf10b3d/public/hardware-monitor.png)

### Advanced Features
![advanced-features](https://github.com/avyuktsoni0731/BIOSage/blob/f6e62f2865992dd27cd9115eb9ee4d314bf10b3d/public/advanced-features.png)

---

## 🛠 Features Breakdown

### ⚙️ Smart System Insights
- Uses [`systeminformation`](https://www.npmjs.com/package/systeminformation) to fetch:
  - CPU, RAM, Drives
  - Battery status, network stats
  - BIOS info, motherboard, and thermal sensors

### 🧠 Local LLM Support
- Prompts are sent to a locally running Ollama server (on Amazon EC2).
- Model used: `llama3:3b-instruct` — optimized for fast, high-quality local inference.
- No internet dependency required in BIOS — runs entirely on LAN.

### 🌍 Language Translation
- LLM responses are dynamically translated into:
  - **🇮🇳 Hindi**
  - **🇺🇸 English**
  - **🇷🇺 Russian**
- Choose your preferred language for BIOS suggestions and error explanations.

### 📉 Real-time Telemetry
- Frontend displays live data for:
  - Fan RPM
  - CPU temperature
  - System uptime
  - Memory usage and load averages

---

## 📁 Project Structure

```

bios-2.0/
├── frontend/                # Next.js frontend
│   ├── pages/
│   ├── components/
│   └── utils/
│   └── api/llm-generate     # LLM interaction (hosted on EC2)
└── README.md

```

---

## ⚠️ Deployment Considerations

### ✅ Works Locally
- On local systems (e.g. inside a BIOS-like Linux shell), `systeminformation` works flawlessly.
- Ollama requests are sent to a LAN-accessible IP (your EC2 instance), with low latency.

### 🚫 Vercel Limitations
- If deployed on **Vercel**, direct hardware access is **not** possible due to:
  - Container isolation
  - No access to system `/dev/` or hardware APIs
- But that’s fine — BIOS runs on the local machine, and this is just the **UI demo**.

> 🔐 This doesn’t affect production use — because BIOS is inherently local.  
> On local installs (or embedded firmware), everything works as intended.

---

## 💬 Sample Usage (Terminal-Style Prompts)

```

> diagnose-cpu
> LLM: Your CPU is currently operating under high thermal load. Consider increasing airflow or underclocking.

> why-is-my-pc-shutting-down
> LLM: Sudden shutdowns are often caused by power supply instability or overheating...

> हिंदी में बताओ
> LLM (Hindi): आपके CPU का तापमान बहुत अधिक है। कृपया फैन की स्थिति जांचें या हीटसिंक लगाएं।

> по-русски
> LLM (Russian): Ваш процессор перегревается. Проверьте систему охлаждения.

````

---

## 🌐 API Endpoints

| Route                  | Purpose                             |
|------------------------|-------------------------------------|
| `GET /api/system-info`     | Fetches real-time system data       |
| `POST /api/generate`     | Sends a prompt to the LLM server    |
| `POST /api/generate`  | Translates response to chosen lang  |

---

## 🧪 How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/avyuktsoni0731/biosage.git

2. Install frontend:

   ```bash
   npm install && npm run dev

3. Run Ollama (on EC2):
   - Create a `.env` file with `NEXT_PUBLIC_EC2_IP` environment variable with `<public_ec2_ip>` variable value (all thanks to `@souvlakee` for providing us w/ the EC2 instance).
   - PS: he knows the IP (if you guys wanna test it out :D)

---

## 📹 Demo Video

> https://youtu.be/poh1ABrmZHw
