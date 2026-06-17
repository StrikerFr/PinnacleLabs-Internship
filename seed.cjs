const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const isoToday = () => new Date().toISOString().slice(0, 10);
const weekStart = (d = new Date()) => {
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  return m.toISOString().slice(0, 10);
};
const genId = () => crypto.randomUUID();

const LOCAL_USER_ID = "local_user_1";
const today = isoToday();
const week = weekStart();

const db = {
  profiles: {
    [LOCAL_USER_ID]: {
      id: LOCAL_USER_ID,
      name: "Alex",
      current_role: "Software Engineer",
      target_role: "Senior Full Stack Engineer",
      industry: "Tech",
      experience: "2 years building React apps",
      skills: ["React", "TypeScript", "Node.js"],
      focus_areas: ["System Design", "Advanced State Management"],
      timezone: "America/Los_Angeles",
      updated_at: new Date().toISOString(),
    },
  },
  roadmaps: [],
  roadmap_tasks: [],
  career_reports: [],
  coach_conversations: [],
  coach_messages: [],
  schedule_blocks: [
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      day_date: today,
      start_time: "09:00",
      end_time: "11:30",
      title: "Deep Work: React Mastery & Perf",
      tag: "Focus",
      color: "#6c5ce7",
      status: "done",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      day_date: today,
      start_time: "11:30",
      end_time: "12:30",
      title: "Lunch & Walk / Break",
      tag: "Rest",
      color: "#22c55e",
      status: "done",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      day_date: today,
      start_time: "12:30",
      end_time: "14:30",
      title: "Algorithm Practice (Graphs & DP)",
      tag: "Learning",
      color: "#ff6b35",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      day_date: today,
      start_time: "15:00",
      end_time: "17:30",
      title: "Project Build: Full Stack AI App",
      tag: "Focus",
      color: "#e84393",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  weekly_goals: [
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      week_start_date: week,
      title: "Complete System Design Course",
      target: 5,
      done: 3,
      color: "#6c5ce7",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      week_start_date: week,
      title: "Solve LeetCode Medium/Hard",
      target: 15,
      done: 12,
      color: "#ff9466",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      week_start_date: week,
      title: "Ship 1 Portfolio Project",
      target: 1,
      done: 0,
      color: "#e84393",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  deadlines: [
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      title: "Stripe Onsite Interview",
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      urgent: true,
      color: "#e84393",
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      title: "Submit Open Source PR",
      due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      urgent: false,
      color: "#06b6d4",
      done: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  notes: [
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      title: "System Design Cheat Sheet",
      body: "CAP Theorem, Consistency Patterns (Strong vs Eventual). Remember to discuss tradeoffs in every interview question. Read Dynamo paper.",
      color: "#fdeee1",
      pinned: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      title: "Behavioral Prep",
      body: "- Tell me about a time you failed: Use the migration project from last year.\n- Biggest technical challenge: Building the realtime websocket server with scaling issues.",
      color: "#f7dcc6",
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  mood_checkins: [
    {
      id: genId(),
      user_id: LOCAL_USER_ID,
      day_date: today,
      mood: "Motivated",
      energy: 85,
      focus_score: 8.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  progress_events: [],
};

const dbPath = path.join(__dirname, "local-db.json");
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Database seeded successfully at", dbPath);
