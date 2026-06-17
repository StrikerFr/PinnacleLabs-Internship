export interface Profile {
  id: string;
  name?: string;
  full_name?: string;
  education?: string;
  current_year?: string;
  cgpa?: number;
  skills?: string[];
  experience?: string;
  projects?: string[];
  dream_role?: string;
  dream_company?: string;
  target_timeline?: string;
  onboarded?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoadmapResource {
  title: string;
  type: string;
  url: string | null;
}

export interface RoadmapProject {
  title: string;
  description: string;
}

export interface RoadmapTaskItem {
  title: string;
  priority: "low" | "medium" | "high";
  estimatedHours: number;
}

export interface RoadmapPhase {
  title: string;
  durationWeeks: number;
  objectives: string[];
  resources: RoadmapResource[];
  projects: RoadmapProject[];
  tasks: RoadmapTaskItem[];
  milestone: string;
}

export interface RoadmapMilestone {
  title: string;
  weekNumber: number;
  description: string;
}

export interface WeeklyPlanItem {
  week: number;
  focus: string;
  tasks: string[];
}

export interface RecommendedResource {
  title: string;
  type: string;
  url: string | null;
}

export interface Roadmap {
  id: string;
  user_id: string;
  goal: string;
  estimated_duration: string;
  phases: RoadmapPhase[];
  milestones: RoadmapMilestone[];
  weekly_plan: WeeklyPlanItem[];
  resources: RecommendedResource[];
  is_primary: boolean;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface RoadmapTask {
  id: string;
  user_id: string;
  roadmap_id: string | null;
  title: string;
  priority: "low" | "medium" | "high";
  phase_index: number | null;
  status: "pending" | "completed";
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface ScheduleBlock {
  id: string;
  user_id: string;
  day_date: string;
  start_time: string;
  end_time: string | null;
  title: string;
  tag: string;
  color: string;
  status: "pending" | "done" | "skipped";
  created_at: string;
  updated_at: string;
}

export interface WeeklyGoal {
  id: string;
  user_id: string;
  week_start_date: string;
  title: string;
  target: number;
  done: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  user_id: string;
  title: string;
  due_date: string;
  urgent: boolean;
  color: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  body: string;
  color: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface MoodCheckin {
  id: string;
  user_id: string;
  day_date: string;
  mood: string;
  energy: number;
  focus_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface SkillGap {
  skill: string;
  severity: "low" | "medium" | "high";
  weeksToClose: number;
}

export interface SuggestedProject {
  title: string;
  impact: string;
  estWeeks: number;
}

export interface SalaryProjection {
  low: number;
  high: number;
  currency: "INR" | "USD";
  unit: "LPA" | "annual";
}

export interface CompanyMatch {
  company: string;
  matchPct: number;
  topRecruiters: string[];
  interviewFocus: string[];
}

export interface InterviewTopic {
  topic: string;
  weight: number;
}

export interface CareerReport {
  id: string;
  user_id: string;
  readiness_score: number | null;
  placement_probability: number | null;
  dream_company: string;
  dream_role: string;
  skill_gaps: SkillGap[];
  suggested_projects: SuggestedProject[];
  salary_projection: SalaryProjection;
  company_match: CompanyMatch;
  interview_topics: InterviewTopic[];
  timeline_estimate: string | null;
  raw?: unknown;
  created_at: string;
}

export interface CoachConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CoachMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ProgressEvent {
  id: string;
  user_id: string;
  event_type: string;
  hours: number;
  created_at: string;
}

export interface RoadmapGenerationData {
  goal: string;
  estimatedDuration: string;
  phases: {
    title: string;
    durationWeeks: number;
    objectives: string[];
    resources: { title: string; type: string; url: string | null }[];
    projects: { title: string; description: string }[];
    tasks: { title: string; priority: "low" | "medium" | "high"; estimatedHours: number }[];
    milestone: string;
  }[];
  milestones: { title: string; weekNumber: number; description: string }[];
  weeklyPlan: { week: number; focus: string; tasks: string[] }[];
  recommendedResources: { title: string; type: string; url: string | null }[];
}

export interface FocusItem {
  title: string;
  minutes: number;
  why: string;
}

export interface DailyPlanGenerationData {
  focus: FocusItem[];
  nextMilestone: {
    title: string;
    etaDays: number;
  };
  recommendations: string[];
  weekProgressPct: number;
}

export interface CareerReportGenerationData {
  readinessScore: number;
  placementProbability: number;
  skillGaps: SkillGap[];
  suggestedProjects: SuggestedProject[];
  salaryProjection: SalaryProjection;
  companyMatch: CompanyMatch;
  interviewTopics: InterviewTopic[];
  timelineEstimate: string;
}

export interface InterviewPrepGenerationData {
  questions: { q: string; difficulty: "easy" | "medium" | "hard"; approach: string }[];
  mustKnowConcepts: string[];
}

export interface ResumeReviewGenerationData {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  rewrites: { before: string; after: string }[];
}
