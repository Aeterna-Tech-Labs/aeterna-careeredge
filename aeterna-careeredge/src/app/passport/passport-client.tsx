"use client";

// src/app/passport/passport-client.tsx
// Comprehensive Student Career Passport Hub (Wrapped in StudentLayout)

import React from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layouts/student-layout";
import {
  Fingerprint,
  GraduationCap,
  ShieldCheck,
  CheckCheck,
  Briefcase,
  Code,
  FolderGit2,
  FileText,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface PassportClientProps {
  user: {
    name: string;
    email: string;
    mobile?: string | null;
    profile: {
      academicDomain?: string | null;
      course?: string | null;
      institution?: string | null;
      preferredJobRole?: string | null;
      targetIndustry?: string | null;
      passportScore?: number | null;
      gradingType?: string | null;
      gradeValue?: string | null;
    } | null;
    educations: Array<{
      id: string;
      institution: string;
      degree: string;
      fieldOfStudy?: string | null;
      startDate: string;
      endDate?: string | null;
      score?: string | null;
    }>;
    skills: Array<{
      id: string;
      name: string;
      category?: string | null;
      level?: string | null;
    }>;
    projects: Array<{
      id: string;
      title: string;
      description?: string | null;
      technologies?: string | null;
      url?: string | null;
    }>;
    experiences: Array<{
      id: string;
      jobTitle: string;
      companyName: string;
      startDate: string;
      endDate?: string | null;
      description?: string | null;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuingOrg: string;
      issueDate?: string | null;
      credentialUrl?: string | null;
    }>;
    documentCount: number;
  };
}

export function PassportClient({ user }: PassportClientProps) {
  const score = user.profile?.passportScore ?? 75;

  return (
    <StudentLayout userName={user.name}>
      <div className="min-h-screen bg-[#FFF8F0]/40 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#4C0915] via-[#7A0F1F] to-[#5D0B18] p-6 md:p-8 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2B63D] text-[#4C0915]">
                  <Fingerprint className="w-3.5 h-3.5" />
                  Universal Career Passport • Verified Source of Truth
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {user.name}&apos;s Career Passport
                </h1>
                <p className="text-sm text-white/80 max-w-xl">
                  Centralized, tamper-resistant career record aggregating your academic history, competencies, and proof-backed achievements.
                </p>
                {user.profile?.institution && (
                  <div className="flex items-center gap-2 text-xs text-white/70 pt-1">
                    <MapPin size={13} />
                    <span>
                      {user.profile.institution} • {user.profile.course || user.profile.academicDomain}
                    </span>
                  </div>
                )}
              </div>

              {/* Score Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[180px]">
                <div className="text-4xl font-black text-[#F2B63D]">{score}%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/90 mt-1">
                  Passport Readiness
                </div>
                <div className="text-[11px] text-white/70 mt-0.5">
                  {score >= 75 ? "Strongly Proofed" : "Getting Started"}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap gap-3">
              <Link
                href="/resume"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#F2B63D] text-[#4C0915] hover:bg-[#e0a632] shadow-sm transition"
              >
                <FileText size={13} />
                <span>Create Tailored Resume</span>
              </Link>
              <Link
                href="/evidence-vault"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25 border border-white/20 transition"
              >
                <ShieldCheck size={13} />
                <span>Upload Evidence ({user.documentCount} Files)</span>
              </Link>
              <Link
                href="/truth-check"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25 border border-white/20 transition"
              >
                <CheckCheck size={13} />
                <span>Run Truth Check</span>
              </Link>
            </div>
          </div>

          {/* Grid of Passport Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Education History */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <GraduationCap className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Education History</h2>
                </div>
                <span className="text-xs text-stone-500 font-semibold">
                  {user.educations.length} Records
                </span>
              </div>

              {user.educations.length > 0 ? (
                <div className="space-y-3">
                  {user.educations.map((edu) => (
                    <div key={edu.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                        <span>{edu.degree}</span>
                        {edu.score && <span className="text-emerald-700 font-semibold">{edu.score}</span>}
                      </div>
                      <div className="text-xs text-stone-600">{edu.institution}</div>
                      <div className="text-[11px] text-stone-400">
                        {edu.startDate} — {edu.endDate || "Present"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                  {user.profile?.institution ? (
                    <div>
                      <strong className="block text-gray-800">{user.profile.course || "Current Degree"}</strong>
                      <span>{user.profile.institution}</span>
                    </div>
                  ) : (
                    "No education records added yet."
                  )}
                </div>
              )}
            </div>

            {/* 2. Skills & Competencies */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Code className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Skills & Competencies</h2>
                </div>
                <span className="text-xs text-stone-500 font-semibold">
                  {user.skills.length} Skills
                </span>
              </div>

              {user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFF9ED] text-[#7A0F1F] border border-[#EBDDD1]"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                  Skills added in onboarding and resume will sync here automatically.
                </div>
              )}
            </div>

            {/* 3. Work & Internship Experiences */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Briefcase className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Experiences & Internships</h2>
                </div>
                <span className="text-xs text-stone-500 font-semibold">
                  {user.experiences.length} Experiences
                </span>
              </div>

              {user.experiences.length > 0 ? (
                <div className="space-y-3">
                  {user.experiences.map((exp) => (
                    <div key={exp.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                      <div className="text-xs font-bold text-gray-900">{exp.jobTitle}</div>
                      <div className="text-xs text-stone-600 font-medium">{exp.companyName}</div>
                      <div className="text-[11px] text-stone-400">
                        {exp.startDate} — {exp.endDate || "Present"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                  No work experiences logged yet. Add your internships or live projects.
                </div>
              )}
            </div>

            {/* 4. Projects & Portfolios */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <FolderGit2 className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Projects & Evidence</h2>
                </div>
                <span className="text-xs text-stone-500 font-semibold">
                  {user.projects.length} Projects
                </span>
              </div>

              {user.projects.length > 0 ? (
                <div className="space-y-3">
                  {user.projects.map((proj) => (
                    <div key={proj.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                        <span>{proj.title}</span>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7A0F1F] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Link</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      {proj.description && <div className="text-xs text-stone-600">{proj.description}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-50 text-center text-xs text-stone-500">
                  No projects recorded yet. Link your GitHub or portfolio artifacts.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
