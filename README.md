# Ollama Studio

A premium, Apple-inspired local AI model management dashboard and playground for [Ollama](https://ollama.ai). Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, and Framer Motion.

---

## 🚀 Quick Start (Running via Docker)

The fastest way to run Ollama Studio is using Docker. It requires zero installation of Node.js or dependencies on your machine.

### Option 1: Docker Compose (Recommended)
Make sure you have Docker installed, then run:

```bash
# Start Ollama Studio in the background
docker compose up -d
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Docker CLI Run
If you have a local Ollama daemon running on your host machine, start Ollama Studio using the pre-compiled container:

```bash
docker run -d -p 3000:3000 \
  --name ollama-studio \
  --add-host=host.docker.internal:host-gateway \
  -e NEXT_PUBLIC_OLLAMA_API_URL=http://host.docker.internal:11434 \
  --restart unless-stopped \
  ghcr.io/shanthistream/ollama-studio:main
```

---

## 🛠️ Local Installation & Development

If you prefer to run the application natively on your local machine:

### Prerequisites
* [Node.js](https://nodejs.org/) 18+ (Node 20+ recommended)
* [Ollama](https://ollama.ai) installed and running (default: `http://localhost:11434`)

### Setup Instructions
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Build for Production**:
   ```bash
   npm run build
   ```
3. **Start the server**:
   ```bash
   npm run start
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **For development (hot reloading)**:
   ```bash
   npm run dev
   ```

---

## ✨ Features

* **Consolidated Playground** — Side-by-side comparative model playground with streaming responses, prompt templates, and real-time generation metrics (tokens/sec).
* **Model Library** — Dynamic filtering (Local vs. Cloud models) and advanced sorting options (Name, Size, Modified Date) to manage your local storage.
* **Unified System Monitor** — Live hardware monitoring dashboard detailing CPU/GPU load, RAM, and temperature, fully consolidated into Next.js serverless route handlers (no separate daemon process needed).
* **Downloads Manager** — Pull and monitor model download streams with live download progress bars.
* **⌘K Command Palette** — Quick global search for pages, templates, settings, and commands.
* **Customization** — Light/Dark mode, customized theme variables, and custom configurations.

---

## 🐳 Docker Deployment Details

### Building locally
If you want to build the Docker image yourself:
```bash
docker build -t ollama-studio:local .
```

### Automatic CI/CD Build (GitHub Actions)
The project includes a pre-configured GitHub Actions workflow in `.github/workflows/docker-publish.yml`. 
* When you push code to `main` or publish a Release on GitHub, it automatically compiles and builds images for both **Intel/AMD (`linux/amd64`)** and **Apple Silicon M-Series (`linux/arm64`)** processors.
* It publishes the built packages securely to your GitHub Container Registry (`ghcr.io/shanthistream/ollama-studio`).

---

## 📂 Project Structure

```
.
├── Dockerfile                  # Multi-stage optimized Docker builder
├── docker-compose.yml          # Container configuration for host-gateway connections
├── .github/workflows/          # CI/CD automated Docker build/publish pipeline
├── src/
│   ├── app/                    # Next.js 16 Pages & API Route Handlers
│   │   ├── api/system/         # Consolidated system stats API routes
│   │   └── playground/         # Unified comparative arena
│   ├── components/             # Reusable UI modules & chart builders
│   ├── hooks/                  # useOllama, useHardwareMonitor, useTheme hooks
│   ├── lib/                    # systemMetrics gathering library
│   ├── services/               # REST API clients (Ollama, System metrics)
│   ├── stores/                 # Zustand global persistence store
│   └── utils/                  # Formatting & search helper modules
```

---

## ☕ Support the Project

Created by [Dinesh Puthiyedath](https://dinesh-ai.vercel.app/).

If you find Ollama Studio helpful, consider supporting its development:
* **Buy me a coffee**: [buymeacoffee.com/shanthistream](https://buymeacoffee.com/shanthistream)

---

## License

MIT
