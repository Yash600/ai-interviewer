import "server-only";
import { sql } from "./client";

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  jobRole: string;
  experienceLevel: string;
}) {
  const rows = await sql`
    INSERT INTO users (name, email, password_hash, job_role, experience_level)
    VALUES (${data.name}, ${data.email}, ${data.passwordHash}, ${data.jobRole}, ${data.experienceLevel})
    RETURNING id, name, email, job_role, experience_level, created_at
  `;
  return rows[0];
}

export async function getUserByEmail(email: string) {
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getUserById(id: string) {
  const rows = await sql`
    SELECT id, name, email, job_role, experience_level, created_at
    FROM users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ?? null;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function createSession(data: {
  userId: string;
  interviewType: string;
  mode?: "full" | "fast";
}) {
  const initialState = JSON.stringify({ mode: data.mode ?? "full" });
  const rows = await sql`
    INSERT INTO sessions (user_id, interview_type, state_json)
    VALUES (${data.userId}, ${data.interviewType}, ${initialState})
    RETURNING *
  `;
  return rows[0];
}

export async function updateSessionCallId(sessionId: string, retellCallId: string) {
  await sql`
    UPDATE sessions
    SET retell_call_id = ${retellCallId}, status = 'active'
    WHERE id = ${sessionId}
  `;
}

export async function getSessionByCallId(retellCallId: string) {
  const rows = await sql`
    SELECT s.*, u.name, u.job_role, u.experience_level
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.retell_call_id = ${retellCallId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getSessionById(sessionId: string) {
  const rows = await sql`
    SELECT s.*, u.name, u.job_role, u.experience_level
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateSessionState(sessionId: string, stateJson: object) {
  await sql`
    UPDATE sessions SET state_json = ${JSON.stringify(stateJson)}
    WHERE id = ${sessionId}
  `;
}

export async function endSession(sessionId: string) {
  await sql`
    UPDATE sessions SET status = 'completed', ended_at = NOW()
    WHERE id = ${sessionId}
  `;
}

export async function getUserSessions(userId: string) {
  const rows = await sql`
    SELECT s.id, s.interview_type, s.status, s.started_at, s.ended_at,
           f.overall_score
    FROM sessions s
    LEFT JOIN feedback f ON f.session_id = s.id
    WHERE s.user_id = ${userId}
    ORDER BY s.started_at DESC
    LIMIT 20
  `;
  return rows;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function insertMessage(data: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
}) {
  await sql`
    INSERT INTO messages (session_id, role, content)
    VALUES (${data.sessionId}, ${data.role}, ${data.content})
  `;
}

export async function getSessionMessages(sessionId: string) {
  const rows = await sql`
    SELECT role, content, created_at
    FROM messages
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
  `;
  return rows;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function createFeedback(data: {
  sessionId: string;
  overallScore: number;
  communication: string;
  structure: string;
  strengths: string[];
  improvements: string[];
  topicsCovered: string[];
  summary: string;
}) {
  const rows = await sql`
    INSERT INTO feedback (
      session_id, overall_score, communication, structure,
      strengths, improvements, topics_covered, summary
    ) VALUES (
      ${data.sessionId}, ${data.overallScore}, ${data.communication}, ${data.structure},
      ${JSON.stringify(data.strengths)}, ${JSON.stringify(data.improvements)},
      ${JSON.stringify(data.topicsCovered)}, ${data.summary}
    )
    ON CONFLICT (session_id) DO UPDATE SET
      overall_score = EXCLUDED.overall_score,
      communication = EXCLUDED.communication,
      structure = EXCLUDED.structure,
      strengths = EXCLUDED.strengths,
      improvements = EXCLUDED.improvements,
      topics_covered = EXCLUDED.topics_covered,
      summary = EXCLUDED.summary
    RETURNING *
  `;
  return rows[0];
}

export async function getFeedbackBySessionId(sessionId: string) {
  const rows = await sql`
    SELECT * FROM feedback WHERE session_id = ${sessionId} LIMIT 1
  `;
  return rows[0] ?? null;
}
