# InterviewAI — AI Mock Interview Platform

A full-stack voice AI interview platform. Adaptive conversations powered by LangGraph + Groq + VAPI.

Live: [ai-interviewer-mu-teal.vercel.app](https://ai-interviewer-mu-teal.vercel.app)

---

## Features

- **Voice interviews** — real-time speech via VAPI (WebRTC, no browser autoplay issues)
- **Two modes** — Fast Paced (2-3 min, 3 questions) or Full Interview (7-8 min, 6 questions)
- **Four types** — Behavioral, Technical, System Design, HR / Culture
- **Adaptive LangGraph engine** — evaluates each answer (strong / weak / incomplete / interesting), decides follow-up vs next topic vs close
- **No hardcoded questions** — every question generated from full conversation context
- **Feedback report** — score, strengths, improvements, topics covered
- **Auth** — JWT-based register / login
- **Liquid glass UI** — frosted glass, animated orbs, split-screen interview room

---

## Local Setup

```bash
git clone <repo-url> && cd AI-Interviewer
npm install
cp .env.example .env.local   # fill in your keys
# Run schema.sql once in your Neon SQL console
npm run dev
```

---

## Environment Variables

| Variable | Where |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → your project → connection string |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | [vapi.ai](https://vapi.ai) → dashboard → API Keys |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | VAPI dashboard → your assistant → ID |
| `JWT_SECRET` | Any random 32+ char string |

---

## VAPI Assistant Setup

1. Create account at [vapi.ai](https://vapi.ai)
2. Create a new assistant → **Model** tab → select **Custom LLM**
3. Set Custom LLM URL to:
   ```
   https://your-app.vercel.app/api/chat/completions
   ```
4. Set **Voice** → Elliot (Vapi) or any voice you prefer
5. Set **First Message**:
   ```
   Hello! I'm Alex, your AI interviewer. Let's get started — could you introduce yourself?
   ```
6. Under **Advanced** → **Webhook Server URL**:
   ```
   https://your-app.vercel.app/api/vapi/webhook
   ```
7. Under **Call Timeout** → set **Silence Timeout** to 30+ seconds
8. Copy **Assistant ID** → `NEXT_PUBLIC_VAPI_ASSISTANT_ID`
9. Copy **Public Key** → `NEXT_PUBLIC_VAPI_PUBLIC_KEY`

---

## Deploy to Vercel

```bash
vercel --prod
```

Add all env vars in Vercel → Settings → Environment Variables → redeploy.

---

## Architecture

```
Browser (@vapi-ai/web SDK)
    ↕  WebRTC audio
VAPI Platform (STT → LLM call → TTS)
    ↕  POST /api/chat/completions  (OpenAI-compatible, SSE streaming)
Next.js API Route
    ↕
LangGraph: evaluate → router → generate
    ↕
Groq Llama 3.3 70B (inference)
    ↕
Neon PostgreSQL (session state + messages persisted per turn)

On call end:
VAPI webhook → POST /api/vapi/webhook → generateFeedback → DB
```

---

## LangGraph Flow

```
User speaks
  → VAPI transcribes
  → POST /api/chat/completions
  → evaluateAnswerNode   (strong / weak / incomplete / interesting)
  → routerNode           (followup / next_question / close)
  → generateResponseNode (Groq Llama 3.3 70B, conversation-aware)
  → SSE response → VAPI speaks via TTS
```

| Answer Quality | Router Decision |
|---|---|
| weak / incomplete | follow-up probe |
| interesting | deeper exploration |
| strong (< min questions) | next topic |
| strong (≥ min questions) | 30% chance to close |
| question count ≥ max | force close |

**Fast mode:** max 3 questions, follows up only on incomplete answers, no filler acknowledgment.  
**Full mode:** max 6 questions, full adaptive routing with strong/weak/interesting branching.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS, Framer Motion |
| Voice | VAPI (@vapi-ai/web) — WebRTC STT + TTS |
| LLM | Groq Llama 3.3 70B via LangChain |
| Conversation Engine | LangGraph.js |
| Database | Neon PostgreSQL (@neondatabase/serverless) |
| Auth | JWT (jose) |
| Deployment | Vercel |
