import type {
  Profile,
  Roadmap,
  RoadmapTask,
  CareerReport,
  CoachConversation,
  CoachMessage,
  ScheduleBlock,
  WeeklyGoal,
  Deadline,
  Note,
  MoodCheckin,
  ProgressEvent,
} from "../types";

// Define the schema for our local database
export interface LocalDB {
  profiles: Record<string, Profile>; // user_id -> profile object
  roadmaps: Roadmap[];
  roadmap_tasks: RoadmapTask[];
  career_reports: CareerReport[];
  coach_conversations: CoachConversation[];
  coach_messages: CoachMessage[];
  schedule_blocks: ScheduleBlock[];
  weekly_goals: WeeklyGoal[];
  deadlines: Deadline[];
  notes: Note[];
  mood_checkins: MoodCheckin[];
  progress_events: ProgressEvent[];
}

const DEFAULT_DB: LocalDB = {
  profiles: {},
  roadmaps: [],
  roadmap_tasks: [],
  career_reports: [],
  coach_conversations: [],
  coach_messages: [],
  schedule_blocks: [],
  weekly_goals: [],
  deadlines: [],
  notes: [],
  mood_checkins: [],
  progress_events: [],
};

async function getDBPath() {
  const path = await import("node:path");
  // Vercel serverless functions only allow writing to /tmp
  const isVercel = process.env.VERCEL === "1";
  return path.join(isVercel ? "/tmp" : process.cwd(), "local-db.json");
}

// Ensure db exists and read it
export async function readDB(): Promise<LocalDB> {
  const fs = await import("node:fs/promises");
  const DB_PATH = await getDBPath();
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data) as LocalDB;
  } catch (error: unknown) {
    if (
      error != null &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "ENOENT"
    ) {
      await writeDB(DEFAULT_DB);
      return DEFAULT_DB;
    }
    throw error;
  }
}

// Write entire db
export async function writeDB(db: LocalDB): Promise<void> {
  const fs = await import("node:fs/promises");
  const DB_PATH = await getDBPath();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// The single user ID since there is no auth
export const LOCAL_USER_ID = "local_user_1";

export function genId() {
  return crypto.randomUUID();
}
