import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AIEnvelope } from "./groq.server";
import type {
  Profile,
  RoadmapGenerationData,
  DailyPlanGenerationData,
  CareerReportGenerationData,
  CoachMessage,
  InterviewPrepGenerationData,
  ResumeReviewGenerationData,
} from "../types";

/* ---------- helpers ---------- */

async function loadProfile() {
  const { readDB, LOCAL_USER_ID } = await import("./local-db.server");
  const db = await readDB();
  return db.profiles[LOCAL_USER_ID] || null;
}

function profileContext(p: Profile | null): string {
  if (!p) return "User has not completed onboarding yet.";
  return [
    `Name: ${p.full_name ?? "unknown"}`,
    `Education: ${p.education ?? "n/a"} (${p.current_year ?? "n/a"})`,
    `CGPA: ${p.cgpa ?? "n/a"}`,
    `Current skills: ${(p.skills ?? []).join(", ") || "none listed"}`,
    `Experience: ${p.experience ?? "none"}`,
    `Projects: ${(p.projects ?? []).join("; ") || "none"}`,
    `Dream role: ${p.dream_role ?? "unspecified"}`,
    `Dream company: ${p.dream_company ?? "unspecified"}`,
    `Target timeline: ${p.target_timeline ?? "unspecified"}`,
  ].join("\n");
}

/* ---------- Roadmap generation ---------- */

const GoalInput = z.object({
  goal: z.string().min(3).max(200),
  savePrimary: z.boolean().optional(),
});

export const generateRoadmap = createServerFn({ method: "POST" })
  .validator((d: unknown) => GoalInput.parse(d))
  .handler(async ({ data }) => {
    const { readDB, writeDB, LOCAL_USER_ID, genId } = await import("./local-db.server");
    const { groqJSON, GROQ_REASONING, ENVELOPE_INSTRUCTION } = await import("./groq.server");
    const db = await readDB();
    const profile = db.profiles[LOCAL_USER_ID] || null;

    const system = `You are TaskPilot AI, an elite career strategist and learning architect.
You design highly personalized, executable roadmaps that take ambitious people from where they are to their goal.
You never produce vague advice. Every phase, milestone, project, and task is concrete and time-bound.
${ENVELOPE_INSTRUCTION}
The "data" field MUST match:
{
  "goal": string,
  "estimatedDuration": string,
  "phases": [{ "title": string, "durationWeeks": number, "objectives": string[], "resources": [{"title": string, "type": "course"|"book"|"video"|"article"|"practice", "url": string|null}], "projects": [{"title": string, "description": string}], "tasks": [{"title": string, "priority": "low"|"medium"|"high", "estimatedHours": number}], "milestone": string }],
  "milestones": [{ "title": string, "weekNumber": number, "description": string }],
  "weeklyPlan": [{ "week": number, "focus": string, "tasks": string[] }],
  "recommendedResources": [{"title": string, "type": string, "url": string|null}]
}
Produce 4-5 phases. Each phase has 3-6 objectives, 3-5 resources, 1-3 projects, 4-8 tasks, 1 milestone. Weekly plan covers first 8 weeks.`;

    const user = `User profile:\n${profileContext(profile)}\n\nGOAL: ${data.goal}\n\nDesign the full roadmap.`;

    const env = await groqJSON<AIEnvelope<RoadmapGenerationData>>({
      system,
      user,
      model: GROQ_REASONING,
      temperature: 0.55,
    });
    const rd = env.data;

    const inserted = {
      id: genId(),
      user_id: LOCAL_USER_ID,
      goal: rd.goal ?? data.goal,
      estimated_duration: rd.estimatedDuration ?? env.timeline ?? "12 weeks",
      phases: rd.phases ?? [],
      milestones: rd.milestones ?? [],
      weekly_plan: rd.weeklyPlan ?? [],
      resources: rd.recommendedResources ?? [],
      is_primary: !!data.savePrimary,
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.roadmaps.push(inserted);

    if (data.savePrimary) {
      db.roadmaps = db.roadmaps.map((r) => {
        if (r.user_id === LOCAL_USER_ID && r.id !== inserted.id) {
          return { ...r, is_primary: false };
        }
        return r;
      });
    }

    await writeDB(db);

    return { roadmap: inserted, envelope: env };
  });

/* ---------- Daily plan ---------- */

export const generateDailyPlan = createServerFn({ method: "POST" }).handler(async () => {
  const { readDB, LOCAL_USER_ID } = await import("./local-db.server");
  const { groqJSON, GROQ_FAST, ENVELOPE_INSTRUCTION } = await import("./groq.server");
  const db = await readDB();
  const profile = db.profiles[LOCAL_USER_ID] || null;
  const primaryRm = db.roadmaps.find((r) => r.user_id === LOCAL_USER_ID && r.is_primary);

  const system = `You are TaskPilot AI generating today's focus tasks.
${ENVELOPE_INSTRUCTION}
The "data" field MUST match:
{ "focus": [{ "title": string, "minutes": number, "why": string }], "nextMilestone": { "title": string, "etaDays": number }, "recommendations": string[], "weekProgressPct": number }
Return 3-4 focus items, 3 recommendations, integer ETA in days.`;

  const user = `Profile:\n${profileContext(profile)}\n\nActive roadmap goal: ${primaryRm?.goal ?? "no active roadmap"}\nNext milestone candidates: ${JSON.stringify((primaryRm?.milestones ?? []).slice(0, 3))}\n\nWhat should the user focus on TODAY?`;

  return groqJSON<AIEnvelope<DailyPlanGenerationData>>({
    system,
    user,
    model: GROQ_FAST,
    temperature: 0.6,
  });
});

/* ---------- Career analysis ---------- */

const CareerInput = z
  .object({ dreamCompany: z.string().optional(), dreamRole: z.string().optional() })
  .optional();

export const careerAnalysis = createServerFn({ method: "POST" })
  .validator((d: unknown) => CareerInput.parse(d ?? {}))
  .handler(async ({ data }) => {
    const { readDB, writeDB, LOCAL_USER_ID, genId } = await import("./local-db.server");
    const { groqJSON, GROQ_REASONING, ENVELOPE_INSTRUCTION } = await import("./groq.server");
    const db = await readDB();
    const profile = db.profiles[LOCAL_USER_ID] || null;
    const company = data?.dreamCompany ?? profile?.dream_company ?? "a top-tier tech company";
    const role = data?.dreamRole ?? profile?.dream_role ?? "Software Engineer";

    const system = `You are an elite career intelligence engine.
${ENVELOPE_INSTRUCTION}
The "data" field MUST match:
{
  "readinessScore": number 0-100,
  "placementProbability": number 0-100,
  "skillGaps": [{ "skill": string, "severity": "low"|"medium"|"high", "weeksToClose": number }],
  "suggestedProjects": [{ "title": string, "impact": string, "estWeeks": number }],
  "salaryProjection": { "low": number, "high": number, "currency": "INR"|"USD", "unit": "LPA"|"annual" },
  "companyMatch": { "company": string, "matchPct": number, "topRecruiters": string[], "interviewFocus": string[] },
  "interviewTopics": [{ "topic": string, "weight": number 0-1 }],
  "timelineEstimate": string
}`;

    const user = `Profile:\n${profileContext(profile)}\n\nDream role: ${role}\nDream company: ${company}\n\nAnalyze readiness, gaps, projects, salary, company match, and interview focus.`;
    const env = await groqJSON<AIEnvelope<CareerReportGenerationData>>({
      system,
      user,
      model: GROQ_REASONING,
      temperature: 0.5,
    });
    const d = env.data;

    const inserted = {
      id: genId(),
      user_id: LOCAL_USER_ID,
      readiness_score: d.readinessScore ?? null,
      placement_probability: d.placementProbability ?? null,
      dream_company: company,
      dream_role: role,
      skill_gaps: d.skillGaps ?? [],
      suggested_projects: d.suggestedProjects ?? [],
      salary_projection: d.salaryProjection ?? {},
      company_match: d.companyMatch ?? {},
      interview_topics: d.interviewTopics ?? [],
      timeline_estimate: d.timelineEstimate ?? env.timeline ?? null,
      raw: env as unknown,
      created_at: new Date().toISOString(),
    };
    db.career_reports.push(inserted);
    await writeDB(db);

    return { report: inserted, envelope: env };
  });

/* ---------- Coach chat (non-streaming) ---------- */

const ChatInput = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(4000),
});

export const coachChat = createServerFn({ method: "POST" })
  .validator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const { readDB, writeDB, LOCAL_USER_ID, genId } = await import("./local-db.server");
    const { groqText, GROQ_REASONING } = await import("./groq.server");
    const db = await readDB();
    const profile = db.profiles[LOCAL_USER_ID] || null;

    let conversationId = data.conversationId;
    if (!conversationId) {
      const conv = {
        id: genId(),
        user_id: LOCAL_USER_ID,
        title: data.message.slice(0, 60),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.coach_conversations.push(conv);
      conversationId = conv.id;
    } else {
      const conv = db.coach_conversations.find((c) => c.id === conversationId);
      if (conv) conv.updated_at = new Date().toISOString();
    }

    // pull last 40 messages for context
    const history = db.coach_messages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-40);

    const messages = [
      {
        role: "system" as const,
        content: `You are TaskPilot AI Coach, a brilliant career mentor, strategist, and learning architect.
You speak like Linear's product team writes: direct, premium, no fluff. Use markdown for structure (headers, lists, bold). Never use emojis. Always be concrete and actionable.

User profile:
${profileContext(profile)}`,
      },
      ...history.map((m: CoachMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: data.message },
    ];

    const reply = await groqText(messages, { model: GROQ_REASONING, temperature: 0.75 });

    db.coach_messages.push(
      {
        id: genId(),
        conversation_id: conversationId,
        user_id: LOCAL_USER_ID,
        role: "user",
        content: data.message,
        created_at: new Date().toISOString(),
      },
      {
        id: genId(),
        conversation_id: conversationId,
        user_id: LOCAL_USER_ID,
        role: "assistant",
        content: reply,
        created_at: new Date().toISOString(),
      },
    );
    await writeDB(db);

    return { conversationId, reply };
  });

/* ---------- Misc one-shot helpers ---------- */

const TopicInput = z.object({ topic: z.string().min(2).max(120) });

export const interviewPreparation = createServerFn({ method: "POST" })
  .validator((d: unknown) => TopicInput.parse(d))
  .handler(async ({ data }) => {
    const { groqJSON, GROQ_REASONING, ENVELOPE_INSTRUCTION } = await import("./groq.server");
    const system = `You design FAANG-tier interview prep packets.\n${ENVELOPE_INSTRUCTION}\nThe "data" field MUST match: { "questions": [{ "q": string, "difficulty": "easy"|"medium"|"hard", "approach": string }], "mustKnowConcepts": string[] }`;
    return groqJSON<AIEnvelope<InterviewPrepGenerationData>>({
      system,
      user: `Topic: ${data.topic}\nGenerate 6 questions and 6 must-know concepts.`,
      model: GROQ_REASONING,
    });
  });

const ResumeInput = z.object({ resumeText: z.string().min(20).max(20000) });

export const resumeReview = createServerFn({ method: "POST" })
  .validator((d: unknown) => ResumeInput.parse(d))
  .handler(async ({ data }) => {
    const { groqJSON, ENVELOPE_INSTRUCTION } = await import("./groq.server");
    const system = `You are an elite tech recruiter at FAANG.\n${ENVELOPE_INSTRUCTION}\nThe "data" field MUST match: { "overallScore": number 0-100, "strengths": string[], "weaknesses": string[], "rewrites": [{ "before": string, "after": string }] }`;
    return groqJSON<AIEnvelope<ResumeReviewGenerationData>>({
      system,
      user: `Review this resume:\n\n${data.resumeText}`,
    });
  });
