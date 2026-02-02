A modern, feature-rich chat interface built with **React 19** and **Tailwind CSS**, powered by Google's latest **Gemini 3.0** and **Gemini 2.5** models. This application features real-time streaming, multimodal inputs (images/files), image generation, Firebase authentication, and a unique visualization for the model's *thinking* process.

---

## ✨ Features

- **🔐 Firebase Authentication**  \
  Secure user authentication with **Google Sign-In** and **Email/Password** options. User sessions are persisted and protected.

- **🧠 Thinking Process Visualization**  \
  Automatically detects and formats `<think>` tags from Gemini models to show or hide the reasoning process behind answers.

- **💬 Streaming Responses**  \
  Real-time, character-by-character output for a smooth and responsive chat experience.

- **🎨 Image Generation**  \
  Dedicated **Imagine** mode supporting `gemini-2.5-flash-image` and `gemini-3-pro-image-preview`.

- **📁 Multimodal Support**  \
  Attach images and files to prompts for analysis and reasoning.

- **💾 Local Persistence**  \
  Chat history is automatically saved to the browser’s **Local Storage**.

- **🔀 Model Switching**  \
  Instantly toggle between **Flash** (speed-optimized) and **Pro** (reasoning-focused) models.

- **📝 Markdown Rendering**  \
  Rich rendering for code blocks, tables, lists, and formatted text.

---

## 🔮 Future Features

- **📊 HubSpot Integration**  \
  Automatic contact creation and chat engagement tracking in HubSpot CRM.

- **📈 Google Ads Integration**  \
  Conversion tracking and audience insights from chat interactions.

- **🌐 Multi-language Support**  \
  Internationalization for global users.

- **💼 Team Collaboration**  \
  Shared workspaces and team chat history.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite  \
- **Authentication:** Firebase Auth (Google & Email/Password)  \
- **Styling:** Tailwind CSS, Lucide React (icons)  \
- **AI SDK:** `@google/genai` (Google GenAI SDK)  \
- **Markdown:** `react-markdown`

---

## 🚀 Getting Started

### Prerequisites

- Node.js **v18+**
- A Google Cloud project with the **Gemini API** enabled
- An **API key** from Google AI Studio

---

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/nunyagit123/topco
cd agent-ui
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables** ⚠️ **IMPORTANT**

Copy the example environment file and configure it with your API keys:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini API Configuration
GEMINI_API_KEY=your_google_ai_api_key_here
API_KEY=your_google_ai_api_key_here
```

> **🔒 SECURITY WARNING**  
> - **NEVER** commit the `.env` file to version control  
> - The `.env` file is already in `.gitignore`  
> - See [SECURITY.md](SECURITY.md) for complete security guidelines  
> - **You must configure Firebase Security Rules** before deploying to production

4. **Configure Firebase Security Rules**

Before deploying, you **must** set up Firebase Security Rules in the Firebase Console. See [SECURITY.md](SECURITY.md) for detailed instructions.

5. **Start the development server**

```bash
npm start
# or
npm run dev
```

---

## � Security

This application implements multiple security measures:

- **Environment Variables:** All API keys stored in `.env` (never committed)
- **File Upload Validation:** Size limits (10MB), type restrictions, and validation
- **Input Sanitization:** XSS prevention and input validation (max 10,000 chars)
- **Rate Limiting:** Client-side rate limiting (1 second between messages)
- **Markdown Security:** Dangerous HTML elements blocked
- **Secure Storage:** SessionStorage instead of localStorage
- **CSP Headers:** Content Security Policy configured in index.html

### ⚠️ Required Security Steps

Before deploying to production:

1. ✅ Configure Firebase Security Rules (see [SECURITY.md](SECURITY.md))
2. ✅ Rotate exposed API keys
3. ✅ Set API key restrictions in Google Cloud Console
4. ⚠️ **RECOMMENDED:** Implement backend API proxy for Gemini calls

**See [SECURITY.md](SECURITY.md) for complete security documentation and checklist.**

---

## �📂 Project Structure

```
src/
├── components/
│   ├── Chat UI components
│   ├── Sidebar, Message bubbles, Inputs
│   ├── ThinkingExpander.tsx   # Collapsible “Thinking Process” UI
│   └── ImageGenView.tsx       # Dedicated image generation view
│
├── services/
│   └── geminiService.ts       # Google GenAI SDK integration
│
├── types.ts                   # TypeScript types (Messages, Sessions, Config)
├── utils/                     # Helper utilities (Local Storage, etc.)
└── main.tsx / App.tsx
```

---

## 🤖 Supported Models

### Text Generation

- `gemini-3-flash-preview` — **Default**, fast and cost-efficient
- `gemini-3-pro-preview` — Higher reasoning capability

### Image Generation

- `gemini-2.5-flash-image` — Fast image generation
- `gemini-3-pro-image-preview` — High-quality images *(requires paid project key)*

---
