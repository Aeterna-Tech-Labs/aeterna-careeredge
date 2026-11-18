// src/lib/applications/service.ts
// Job Application Tracker Service with Strict Provenance & Status History

import { db } from "@/lib/db";
import { trackProgressEvent } from "@/lib/guidance/progress";

export type ApplicationStatus =
  | "SAVED"
  | "VISITED"
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: string;
  notes?: string;
}

export async function listUserApplications(userId: string, status?: ApplicationStatus) {
  return db.jobApplication.findMany({
    where: {
      userId,
      ...(status ? { applicationStatus: status } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createOrUpdateApplication(
  userId: string,
  data: {
    id?: string;
    jobTitle: string;
    companyName: string;
    jobListingRefId?: string;
    jobUrl?: string;
    location?: string;
    salary?: string;
    employmentType?: string;
    applicationStatus?: ApplicationStatus;
    appliedDate?: Date;
    notes?: string;
    followUpDate?: Date;
  }
) {
  const status = data.applicationStatus || "SAVED";

  // Check if existing record exists for this jobListingRefId or by ID
  let existing = null;
  if (data.id) {
    existing = await db.jobApplication.findFirst({
      where: { id: data.id, userId },
    });
  } else if (data.jobListingRefId) {
    existing = await db.jobApplication.findFirst({
      where: { userId, jobListingRefId: data.jobListingRefId },
    });
  }

  const now = new Date();
  let history: StatusHistoryEntry[] = [];

  if (existing?.statusHistoryJson) {
    try {
      history = JSON.parse(existing.statusHistoryJson);
    } catch {
      history = [];
    }
  }

  // Append new status transition if changed or new
  if (!existing || existing.applicationStatus !== status) {
    history.push({
      status,
      timestamp: now.toISOString(),
      notes: data.notes || undefined,
    });
  }

  let record;
  if (existing) {
    record = await db.jobApplication.update({
      where: { id: existing.id },
      data: {
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        jobUrl: data.jobUrl ?? existing.jobUrl,
        location: data.location ?? existing.location,
        salary: data.salary ?? existing.salary,
        employmentType: data.employmentType ?? existing.employmentType,
        applicationStatus: status,
        appliedDate: status === "APPLIED" && !existing.appliedDate ? now : (data.appliedDate ?? existing.appliedDate),
        notes: data.notes ?? existing.notes,
        followUpDate: data.followUpDate ?? existing.followUpDate,
        statusHistoryJson: JSON.stringify(history),
      },
    });
  } else {
    record = await db.jobApplication.create({
      data: {
        userId,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        jobListingRefId: data.jobListingRefId,
        jobUrl: data.jobUrl,
        location: data.location,
        salary: data.salary,
        employmentType: data.employmentType,
        applicationStatus: status,
        appliedDate: status === "APPLIED" ? now : data.appliedDate,
        notes: data.notes,
        followUpDate: data.followUpDate,
        statusHistoryJson: JSON.stringify(history),
      },
    });
  }

  // Log progress event
  if (status === "APPLIED") {
    await trackProgressEvent({
      userId,
      eventType: "JOB_APPLIED",
      title: `Applied to ${data.jobTitle}`,
      description: `Submitted application to ${data.companyName}`,
      refId: record.id,
      metadata: { jobTitle: data.jobTitle, companyName: data.companyName },
    });
  } else if (status === "SAVED" && !existing) {
    await trackProgressEvent({
      userId,
      eventType: "JOB_SAVED",
      title: `Saved job: ${data.jobTitle}`,
      description: `Added ${data.companyName} to application tracker`,
      refId: record.id,
      metadata: { jobTitle: data.jobTitle, companyName: data.companyName },
    });
  }

  return record;
}

export async function updateApplicationStatus(
  userId: string,
  id: string,
  status: ApplicationStatus,
  notes?: string,
  followUpDate?: Date
) {
  const existing = await db.jobApplication.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Job application not found");
  }

  let history: StatusHistoryEntry[] = [];
  try {
    if (existing.statusHistoryJson) history = JSON.parse(existing.statusHistoryJson);
  } catch {
    history = [];
  }

  history.push({
    status,
    timestamp: new Date().toISOString(),
    notes,
  });

  const updated = await db.jobApplication.update({
    where: { id },
    data: {
      applicationStatus: status,
      appliedDate: status === "APPLIED" ? existing.appliedDate || new Date() : existing.appliedDate,
      notes: notes !== undefined ? notes : existing.notes,
      followUpDate: followUpDate !== undefined ? followUpDate : existing.followUpDate,
      statusHistoryJson: JSON.stringify(history),
    },
  });

  if (status === "APPLIED") {
    await trackProgressEvent({
      userId,
      eventType: "JOB_APPLIED",
      title: `Applied to ${updated.jobTitle}`,
      description: `Confirmed application to ${updated.companyName}`,
      refId: updated.id,
      metadata: { jobTitle: updated.jobTitle, companyName: updated.companyName },
    });
  } else if (status === "INTERVIEWING") {
    await trackProgressEvent({
      userId,
      eventType: "INTERVIEW_SCHEDULED",
      title: `Interview stage for ${updated.jobTitle}`,
      description: `Progressed to interview with ${updated.companyName}`,
      refId: updated.id,
      metadata: { jobTitle: updated.jobTitle, companyName: updated.companyName },
    });
  }

  return updated;
}

export async function deleteApplication(userId: string, id: string) {
  const existing = await db.jobApplication.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Application not found");
  }

  return db.jobApplication.delete({ where: { id } });
}
