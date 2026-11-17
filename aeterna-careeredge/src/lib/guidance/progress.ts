// src/lib/guidance/progress.ts
// Student Progress Event Tracking & Ledger Service

import { db } from "@/lib/db";

export type ProgressEventType =
  | "RESUME_CREATED"
  | "EVIDENCE_ADDED"
  | "LINKEDIN_IMPROVED"
  | "JOB_SAVED"
  | "JOB_APPLIED"
  | "INTERVIEW_SCHEDULED"
  | "READINESS_REPORT_GENERATED"
  | "SPRINT_TASK_COMPLETED";

export interface TrackProgressEventParams {
  userId: string;
  eventType: ProgressEventType;
  title: string;
  description?: string;
  refId?: string;
  metadata?: Record<string, unknown>;
}

export async function trackProgressEvent(params: TrackProgressEventParams) {
  try {
    return await db.progressEvent.create({
      data: {
        userId: params.userId,
        eventType: params.eventType,
        title: params.title,
        description: params.description,
        refId: params.refId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.warn("Failed to record progress event:", error);
    return null;
  }
}

export async function getStudentProgressLedger(userId: string, limit = 50) {
  return db.progressEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
