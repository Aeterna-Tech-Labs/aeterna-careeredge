// src/lib/sprints/service.ts
// Gap-to-Action 30-Day Sprint Generator & Task Tracker

import { db } from "@/lib/db";
import { trackProgressEvent } from "@/lib/guidance/progress";

export interface SprintSummary {
  id: string;
  targetProfession: string;
  targetRole: string;
  startDate: string;
  endDate: string;
  status: string;
  completedTasksCount: number;
  totalTasksCount: number;
  progressPercent: number;
  tasks: Array<{
    id: string;
    weekNumber: number;
    dayNumber: number | null;
    title: string;
    description: string | null;
    linkedGapType: string;
    status: string;
    completedAt: string | null;
  }>;
}

export async function getActiveSprint(userId: string): Promise<SprintSummary | null> {
  const plan = await db.sprintPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      tasks: {
        orderBy: [{ weekNumber: "asc" }, { dayNumber: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!plan) return null;

  const total = plan.tasks.length;
  const completed = plan.tasks.filter((t) => t.status === "COMPLETED").length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    id: plan.id,
    targetProfession: plan.targetProfession,
    targetRole: plan.targetRole,
    startDate: plan.startDate.toISOString(),
    endDate: plan.endDate.toISOString(),
    status: plan.status,
    completedTasksCount: completed,
    totalTasksCount: total,
    progressPercent,
    tasks: plan.tasks.map((t) => ({
      id: t.id,
      weekNumber: t.weekNumber,
      dayNumber: t.dayNumber,
      title: t.title,
      description: t.description,
      linkedGapType: t.linkedGapType,
      status: t.status,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    })),
  };
}

export async function generate30DaySprint(
  userId: string,
  targetProfession: string,
  targetRole: string
): Promise<SprintSummary> {
  // Archive any existing active plans for this user
  await db.sprintPlan.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "PAUSED" },
  });

  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  const plan = await db.sprintPlan.create({
    data: {
      userId,
      targetProfession,
      targetRole,
      startDate: now,
      endDate,
      status: "ACTIVE",
    },
  });

  // 12 structured tasks across 4 weeks
  const defaultTasks = [
    // Week 1: Proof Bank & Audit
    {
      planId: plan.id,
      weekNumber: 1,
      dayNumber: 2,
      title: "Audit Evidence Vault & Upload 2 Key Artifacts",
      description: "Ensure your primary degree and at least one project/certificate are linked to the Evidence Vault.",
      linkedGapType: "MISSING_EVIDENCE",
    },
    {
      planId: plan.id,
      weekNumber: 1,
      dayNumber: 4,
      title: "Run Truth Check Audit on Current Resume Draft",
      description: "Verify that all claimed metrics and skills are backed by your Career Passport.",
      linkedGapType: "RESUME_SECTION",
    },
    {
      planId: plan.id,
      weekNumber: 1,
      dayNumber: 7,
      title: "Verify Academic Coursework & Prerequisites",
      description: `Confirm all semester records and prerequisite criteria for ${targetRole} are recorded.`,
      linkedGapType: "MISSING_SKILL",
    },

    // Week 2: Practical Competency Deepening
    {
      planId: plan.id,
      weekNumber: 2,
      dayNumber: 10,
      title: `Build Hands-On Artifact for ${targetRole}`,
      description: "Complete a capstone feature, sample legal brief, teaching lesson plan, or clinical reflection.",
      linkedGapType: "MISSING_EVIDENCE",
    },
    {
      planId: plan.id,
      weekNumber: 2,
      dayNumber: 12,
      title: "Link GitHub Repo / Portfolio Document to Evidence Vault",
      description: "Attach the completed artifact with proven student authorship in the Evidence Vault.",
      linkedGapType: "MISSING_EVIDENCE",
    },
    {
      planId: plan.id,
      weekNumber: 2,
      dayNumber: 14,
      title: "Resolve Flagged Unverified Claims",
      description: "Convert unbacked resume claims into verified evidence or remove speculative claims.",
      linkedGapType: "RESUME_SECTION",
    },

    // Week 3: Professional Identity Alignment
    {
      planId: plan.id,
      weekNumber: 3,
      dayNumber: 17,
      title: "Format Resume to Official Profession Framework",
      description: `Align your resume with standard occupational requirements for ${targetProfession}.`,
      linkedGapType: "RESUME_SECTION",
    },
    {
      planId: plan.id,
      weekNumber: 3,
      dayNumber: 19,
      title: "Optimize LinkedIn Headline & About Section",
      description: "Deploy ATS and recruiter-friendly keywords verified from your Career Passport.",
      linkedGapType: "LINKEDIN_SECTION",
    },
    {
      planId: plan.id,
      weekNumber: 3,
      dayNumber: 21,
      title: "Review 3 Proof Bank Interview Talking Points",
      description: "Practice articulating your top 3 verified evidence artifacts using the STAR technique.",
      linkedGapType: "APPLICATION",
    },

    // Week 4: Applications & Launch
    {
      planId: plan.id,
      weekNumber: 4,
      dayNumber: 24,
      title: `Generate Tailored Application Pack for ${targetRole}`,
      description: "Generate targeted cover note and pre-application checklist for an active job opening.",
      linkedGapType: "APPLICATION",
    },
    {
      planId: plan.id,
      weekNumber: 4,
      dayNumber: 27,
      title: "Submit 2 Verified Applications & Record in Tracker",
      description: "Apply on official employer websites and update your Application Tracker audit history.",
      linkedGapType: "APPLICATION",
    },
    {
      planId: plan.id,
      weekNumber: 4,
      dayNumber: 30,
      title: "Complete 1 Domain Interview Prep Practice",
      description: "Review question bank scenarios for technical and behavioral interview readiness.",
      linkedGapType: "APPLICATION",
    },
  ];

  await db.sprintTask.createMany({
    data: defaultTasks,
  });

  // Track progress event
  await trackProgressEvent({
    userId,
    eventType: "SPRINT_TASK_COMPLETED",
    title: `Started 30-Day Employability Sprint: ${targetRole}`,
    description: `Created 12 structured milestone tasks targeting ${targetProfession}`,
    refId: plan.id,
    metadata: { targetProfession, targetRole },
  });

  const createdPlan = await getActiveSprint(userId);
  return createdPlan!;
}

export async function toggleSprintTask(
  userId: string,
  taskId: string
): Promise<{ success: boolean; task: { id: string; status: string; completedAt: Date | null } }> {
  const task = await db.sprintTask.findFirst({
    where: {
      id: taskId,
      sprintPlan: { userId },
    },
  });

  if (!task) {
    throw new Error("Task not found or unauthorized");
  }

  const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
  const completedAt = newStatus === "COMPLETED" ? new Date() : null;

  const updated = await db.sprintTask.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      completedAt,
    },
  });

  if (newStatus === "COMPLETED") {
    await trackProgressEvent({
      userId,
      eventType: "SPRINT_TASK_COMPLETED",
      title: `Completed sprint task: ${task.title}`,
      description: `Progress logged on Day ${task.dayNumber || 1} milestone`,
      refId: taskId,
      metadata: { taskId, weekNumber: task.weekNumber },
    });
  }

  return {
    success: true,
    task: {
      id: updated.id,
      status: updated.status,
      completedAt: updated.completedAt,
    },
  };
}
