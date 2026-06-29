-- Run this once in your Neon SQL console

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  job_role    TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_type  TEXT NOT NULL CHECK (interview_type IN ('behavioral','technical','system_design','hr')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed')),
  retell_call_id  TEXT,
  state_json      JSONB DEFAULT '{}',
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ended_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  overall_score   INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  communication   TEXT,
  structure       TEXT,
  strengths       JSONB DEFAULT '[]',
  improvements    JSONB DEFAULT '[]',
  topics_covered  JSONB DEFAULT '[]',
  summary         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_retell_call_id ON sessions(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
