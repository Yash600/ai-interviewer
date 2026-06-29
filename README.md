# InterviewAI — AI Mock Interview Platform

A full-stack voice AI interview platform. Dynamic, adaptive conversations powered by LangGraph + Groq + Retell AI.

## Setup (5 commands)

```bash
git clone <repo-url> && cd interview-ai
npm install
cp .env.example .env.local   # fill in your keys
# Run schema.sql in your Neon SQL console (one time)
npm run dev
```

## Environment Variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → your project → connection string |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `RETELL_API_KEY` | [retellai.com](https://retellai.com) → API keys |
| `NEXT_PUBLIC_RETELL_AGENT_ID` | Retell dashboard → your agent ID |
| `JWT_SECRET` | Any random 32+ char string |

## Retell Agent Setup

1. Create account at retellai.com (free $10 credit)
2. Create a new agent → set **Custom LLM URL** to:
   - Local: `https://your-ngrok-url/api/interview/chat`
   - Production: `https://your-app.vercel.app/api/interview/chat`
3. Copy the Agent ID → `NEXT_PUBLIC_RETELL_AGENT_ID`

## Deploy to Vercel

```bash
vercel --prod
```

Add all env vars in Vercel dashboard → Settings → Environment Variables.

## Stack

- **Next.js 15.3.3** — frontend + API routes
- **Neon PostgreSQL** — database (`@neondatabase/serverless`)
- **LangGraph.js 0.2.42** — conversation engine (evaluate → route → generate)
- **Groq Llama 3.3 70B** — LLM (free tier)
- **Retell AI** — voice STT + TTS (free $10 credit)
- **Vercel** — deployment (free tier)

## Architecture

```
Browser (Retell Web SDK) ↔ Retell AI (STT + TTS)
                                  ↕ webhook per turn
                    /api/interview/chat (Next.js)
                                  ↕
                    LangGraph: evaluate → router → generate
                                  ↕
                         Groq Llama 3.3 70B
                                  ↕
                    Neon PostgreSQL (state persisted per session)
```
