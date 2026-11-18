"use client";

// src/app/passport/passport-client.tsx
// Comprehensive Student Career Passport Hub (Wrapped in StudentLayout)
// Interactive FlowCV & LinkedIn benchmarked editing system with full section-by-section CRUD.

import React, { useState } from "react";
import Link from "next/link";
import { StudentLayout } from "@/components/layouts/student-layout";
import { HowItWorksPanel } from "@/components/guidance/how-it-works-panel";
import {
  ProfileModal,
} from "@/components/passport/profile-modal";
import {
  EducationModal,
  type EducationItem,
} from "@/components/passport/education-modal";
import {
  SkillModal,
  type SkillItem,
} from "@/components/passport/skill-modal";
import {
  ProjectModal,
  type ProjectItem,
} from "@/components/passport/project-modal";
import {
  ExperienceModal,
  type ExperienceItem,
} from "@/components/passport/experience-modal";
import {
  CertificationModal,
  type CertificationItem,
} from "@/components/passport/certification-modal";
import { UploadResumeButton } from "@/components/resume/upload-resume-button";
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
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Award,
} from "lucide-react";

interface PassportClientProps {
  user: {
    name: string;
    email: string;
    mobile?: string | null;
    profile: {
      headline?: string | null;
      academicDomain?: string | null;
      course?: string | null;
      institution?: string | null;
      preferredJobRole?: string | null;
      targetIndustry?: string | null;
      passportScore?: number | null;
      gradingType?: string | null;
      gradeValue?: string | null;
      graduationYear?: number | null;
    } | null;
    educations: EducationItem[];
    skills: SkillItem[];
    projects: ProjectItem[];
    experiences: ExperienceItem[];
    certifications: CertificationItem[];
    documentCount: number;
  };
}

export function PassportClient({ user: initialUser }: PassportClientProps) {
  // Local state for interactive real-time updates
  const [userName, setUserName] = useState(initialUser.name);
  const [userMobile, setUserMobile] = useState(initialUser.mobile);
  const [profile, setProfile] = useState(initialUser.profile);
  const [educations, setEducations] = useState<EducationItem[]>(initialUser.educations);
  const [skills, setSkills] = useState<SkillItem[]>(initialUser.skills);
  const [projects, setProjects] = useState<ProjectItem[]>(initialUser.projects);
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialUser.experiences);
  const [certifications, setCertifications] = useState<CertificationItem[]>(initialUser.certifications);
  const [score, setScore] = useState(initialUser.profile?.passportScore ?? 75);

  // Modal visibility states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [activeEducation, setActiveEducation] = useState<EducationItem | null>(null);

  const [skillModalOpen, setSkillModalOpen] = useState(false);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [activeExperience, setActiveExperience] = useState<ExperienceItem | null>(null);

  const [certificationModalOpen, setCertificationModalOpen] = useState(false);
  const [activeCertification, setActiveCertification] = useState<CertificationItem | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deduplicating, setDeduplicating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  async function handleDeduplicate() {
    setDeduplicating(true);
    try {
      const res = await fetch("/api/passport/deduplicate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deduplication failed");
      notify(data.message);
      if (data.summary?.totalRemoved > 0) {
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err: unknown) {
      notify((err as Error).message || "Could not consolidate entries.");
    } finally {
      setDeduplicating(false);
    }
  }

  // Delete handlers
  async function handleDeleteEducation(id: string) {
    if (!confirm("Are you sure you want to delete this education record?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/passport/educations?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setEducations((prev) => prev.filter((e) => e.id !== id));
      if (data.score) setScore(data.score);
      notify("Education record removed.");
    } catch {
      alert("Could not delete education record.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteSkill(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/passport/skills?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setSkills((prev) => prev.filter((s) => s.id !== id));
      if (data.score) setScore(data.score);
      notify("Skill removed.");
    } catch {
      alert("Could not delete skill.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/passport/projects?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (data.score) setScore(data.score);
      notify("Project removed.");
    } catch {
      alert("Could not delete project.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteExperience(id: string) {
    if (!confirm("Are you sure you want to delete this experience record?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/passport/experiences?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
      if (data.score) setScore(data.score);
      notify("Experience record removed.");
    } catch {
      alert("Could not delete experience.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteCertification(id: string) {
    if (!confirm("Are you sure you want to delete this certification?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/passport/certifications?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setCertifications((prev) => prev.filter((c) => c.id !== id));
      if (data.score) setScore(data.score);
      notify("Certification removed.");
    } catch {
      alert("Could not delete certification.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <StudentLayout userName={userName}>
      <div className="min-h-screen bg-[#FFF8F0]/40 p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Status notification toast */}
          {statusMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#4C0915] px-4 py-3 text-xs font-semibold text-white shadow-xl border border-[#F2B63D]/30 transition-all animate-in fade-in slide-in-from-bottom-2">
              <Sparkles size={15} className="text-[#F2B63D]" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-[#4C0915] via-[#7A0F1F] to-[#5D0B18] p-6 md:p-8 text-white shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2B63D] text-[#4C0915]">
                  <Fingerprint className="w-3.5 h-3.5" />
                  Universal Career Passport • Verified Source of Truth
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {userName}&apos;s Career Passport
                </h1>
                <p className="text-sm text-white/80 max-w-xl">
                  Centralized, tamper-resistant career record aggregating your academic history, competencies, and proof-backed achievements.
                </p>

                {profile?.institution && (
                  <div className="flex items-center gap-2 text-xs text-white/70 pt-1">
                    <MapPin size={13} />
                    <span>
                      {profile.institution} • {profile.course || profile.academicDomain}
                    </span>
                    {profile.gradeValue && (
                      <span className="bg-white/15 px-2 py-0.5 rounded-md font-semibold text-white">
                        {profile.gradingType || "Grade"}: {profile.gradeValue}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Score Card & Edit Master Profile Button */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[190px]">
                  <div className="text-4xl font-black text-[#F2B63D]">{score}%</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white/90 mt-1">
                    Passport Readiness
                  </div>
                  <div className="text-[11px] text-white/70 mt-0.5">
                    {score >= 75 ? "Strongly Proofed" : "Getting Started"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/25 shadow-xs transition"
                >
                  <Pencil size={13} />
                  <span>Edit Master Profile</span>
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2.5">
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
                  <span>Upload Evidence ({initialUser.documentCount} Files)</span>
                </Link>
                <Link
                  href="/truth-check"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25 border border-white/20 transition"
                >
                  <CheckCheck size={13} />
                  <span>Run Truth Check</span>
                </Link>
                <button
                  type="button"
                  onClick={handleDeduplicate}
                  disabled={deduplicating}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25 border border-white/20 transition disabled:opacity-50"
                  title="Deduplicate and consolidate redundant passport entries"
                >
                  <Sparkles size={13} className="text-[#F2B63D]" />
                  <span>{deduplicating ? "Consolidating..." : "Clean Duplicates"}</span>
                </button>
              </div>

              {/* Direct Link to Onboarding Form Editor */}
              <Link
                href="/onboarding?from=dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F2B63D] hover:underline"
              >
                <span>Full Onboarding Wizard Edit &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Guidance Helper */}
          <HowItWorksPanel toolKey="career-passport" />

          {/* Quick Resume Upload Option */}
          <UploadResumeButton
            variant="banner"
            label="Already have a resume? Upload it to fill your Career Passport faster."
            sublabel="We extract your degrees, experience, and skills into your passport with full conflict review."
            onSuccess={() => window.location.reload()}
          />

          {/* Grid of Passport Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ============================================================
                1. EDUCATION HISTORY
            ============================================================ */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <GraduationCap className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Education History</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                    {educations.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveEducation(null);
                    setEducationModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7A0F1F] text-white hover:bg-[#4C0915] shadow-xs transition"
                >
                  <Plus size={13} />
                  <span>Add Degree</span>
                </button>
              </div>

              {educations.length > 0 ? (
                <div className="space-y-3">
                  {educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="group relative p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 hover:border-[#7A0F1F]/40 transition"
                    >
                      <div className="flex items-start justify-between text-xs font-bold text-gray-900 pr-16">
                        <div>
                          <span>{edu.degree}</span>
                          {edu.fieldOfStudy && (
                            <span className="text-stone-500 font-normal">
                              {" "}• {edu.fieldOfStudy}
                            </span>
                          )}
                        </div>
                        {edu.score && (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {edu.score}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-stone-600 font-medium">
                        {edu.institution}
                      </div>

                      <div className="text-[11px] text-stone-400">
                        {edu.startDate} — {edu.endDate || "Present"}
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEducation(edu);
                            setEducationModalOpen(true);
                          }}
                          aria-label={`Edit ${edu.degree}`}
                          className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === edu.id}
                          onClick={() => edu.id && handleDeleteEducation(edu.id)}
                          aria-label={`Delete ${edu.degree}`}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                  <p>No education records logged yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEducation(null);
                      setEducationModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0F1F] hover:underline"
                  >
                    <Plus size={13} />
                    <span>Add your degree or diploma</span>
                  </button>
                </div>
              )}
            </div>

            {/* ============================================================
                2. SKILLS & COMPETENCIES
            ============================================================ */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Code className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Skills &amp; Competencies</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                    {skills.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSkillModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7A0F1F] text-white hover:bg-[#4C0915] shadow-xs transition"
                >
                  <Plus size={13} />
                  <span>Add Skill</span>
                </button>
              </div>

              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <div
                      key={skill.id || skill.name}
                      className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#FFF9ED] text-[#7A0F1F] border border-[#EBDDD1] hover:border-[#7A0F1F] transition"
                    >
                      <span>{skill.name}</span>
                      {skill.level && (
                        <span className="text-[10px] text-[#7A0F1F]/60 uppercase font-bold">
                          • {skill.level.slice(0, 3)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => skill.id && handleDeleteSkill(skill.id)}
                        aria-label={`Remove skill ${skill.name}`}
                        className="ml-1 text-stone-400 hover:text-red-600 transition"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                  <p>No skills recorded yet.</p>
                  <button
                    type="button"
                    onClick={() => setSkillModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0F1F] hover:underline"
                  >
                    <Plus size={13} />
                    <span>Add your first technical or domain skill</span>
                  </button>
                </div>
              )}
            </div>

            {/* ============================================================
                3. PRACTICAL PROJECTS & PORTFOLIO
            ============================================================ */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <FolderGit2 className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Practical Projects</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                    {projects.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveProject(null);
                    setProjectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7A0F1F] text-white hover:bg-[#4C0915] shadow-xs transition"
                >
                  <Plus size={13} />
                  <span>Add Project</span>
                </button>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="group relative p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 hover:border-[#7A0F1F]/40 transition"
                    >
                      <div className="flex items-start justify-between text-xs font-bold text-gray-900 pr-16">
                        <div>
                          <span>{proj.title}</span>
                          {proj.role && (
                            <span className="text-stone-500 font-normal">
                              {" "}• {proj.role}
                            </span>
                          )}
                        </div>

                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#7A0F1F] hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <span>Live</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>

                      {proj.technologies && (
                        <div className="text-[11px] font-semibold text-[#7A0F1F]/80">
                          {proj.technologies}
                        </div>
                      )}

                      {proj.description && (
                        <div className="text-xs text-stone-600 line-clamp-2">
                          {proj.description}
                        </div>
                      )}

                      {/* Action buttons (Edit & Delete) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProject(proj);
                            setProjectModalOpen(true);
                          }}
                          aria-label={`Edit ${proj.title}`}
                          className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === proj.id}
                          onClick={() => proj.id && handleDeleteProject(proj.id)}
                          aria-label={`Delete ${proj.title}`}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                  <p>No practical projects logged yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProject(null);
                      setProjectModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0F1F] hover:underline"
                  >
                    <Plus size={13} />
                    <span>Add your capstone, software, or case study project</span>
                  </button>
                </div>
              )}
            </div>

            {/* ============================================================
                4. WORK EXPERIENCE & INTERNSHIPS
            ============================================================ */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Briefcase className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Experiences &amp; Internships</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                    {experiences.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveExperience(null);
                    setExperienceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7A0F1F] text-white hover:bg-[#4C0915] shadow-xs transition"
                >
                  <Plus size={13} />
                  <span>Add Experience</span>
                </button>
              </div>

              {experiences.length > 0 ? (
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="group relative p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 hover:border-[#7A0F1F]/40 transition"
                    >
                      <div className="text-xs font-bold text-gray-900 pr-16">
                        {exp.jobTitle}
                      </div>
                      <div className="text-xs text-stone-600 font-medium">
                        {exp.companyName}
                        {exp.employmentType && (
                          <span className="text-stone-400 font-normal">
                            {" "}• {exp.employmentType.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {exp.startDate} — {exp.endDate || "Present"}
                      </div>
                      {exp.description && (
                        <div className="text-xs text-stone-600 pt-1 line-clamp-2">
                          {exp.description}
                        </div>
                      )}

                      {/* Action buttons (Edit & Delete) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveExperience(exp);
                            setExperienceModalOpen(true);
                          }}
                          aria-label={`Edit ${exp.jobTitle}`}
                          className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === exp.id}
                          onClick={() => exp.id && handleDeleteExperience(exp.id)}
                          aria-label={`Delete ${exp.jobTitle}`}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                  <p>No work experiences logged yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveExperience(null);
                      setExperienceModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0F1F] hover:underline"
                  >
                    <Plus size={13} />
                    <span>Add internship, articleship, or job experience</span>
                  </button>
                </div>
              )}
            </div>

            {/* ============================================================
                5. CERTIFICATIONS & CREDENTIALS
            ============================================================ */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs md:col-span-2">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900">
                  <Award className="text-[#7A0F1F] w-5 h-5" />
                  <h2>Certifications &amp; Professional Credentials</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
                    {certifications.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveCertification(null);
                    setCertificationModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#7A0F1F] text-white hover:bg-[#4C0915] shadow-xs transition"
                >
                  <Plus size={13} />
                  <span>Add Certification</span>
                </button>
              </div>

              {certifications.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="group relative p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1 hover:border-[#7A0F1F]/40 transition"
                    >
                      <div className="text-xs font-bold text-gray-900 pr-14">
                        {cert.name}
                      </div>
                      <div className="text-xs text-stone-600 font-medium">
                        {cert.issuingOrg}
                      </div>
                      {cert.issueDate && (
                        <div className="text-[11px] text-stone-400">
                          Issued: {cert.issueDate}
                        </div>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7A0F1F] hover:underline inline-flex items-center gap-1 text-[11px] font-semibold pt-1"
                        >
                          <span>Verify Credential</span>
                          <ExternalLink size={10} />
                        </a>
                      )}

                      {/* Action buttons (Edit & Delete) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCertification(cert);
                            setCertificationModalOpen(true);
                          }}
                          aria-label={`Edit ${cert.name}`}
                          className="p-1 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === cert.id}
                          onClick={() => cert.id && handleDeleteCertification(cert.id)}
                          aria-label={`Delete ${cert.name}`}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-stone-50 text-center text-xs text-stone-500 space-y-2">
                  <p>No verified certifications added yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCertification(null);
                      setCertificationModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7A0F1F] hover:underline"
                  >
                    <Plus size={13} />
                    <span>Add your NPTEL, AWS, Coursera, or professional license</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <ProfileModal
          key="profile-modal"
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          initialData={{
            name: userName,
            mobile: userMobile,
            headline: profile?.headline,
            academicDomain: profile?.academicDomain,
            course: profile?.course,
            institution: profile?.institution,
            preferredJobRole: profile?.preferredJobRole,
            targetIndustry: profile?.targetIndustry,
            gradingType: profile?.gradingType,
            gradeValue: profile?.gradeValue,
            graduationYear: profile?.graduationYear,
          }}
          onSuccess={(updated) => {
            if (updated.user.name) setUserName(updated.user.name);
            if (updated.user.mobile !== undefined) setUserMobile(updated.user.mobile);
            setProfile((prev) => ({ ...prev, ...updated.profile }));
            setScore(updated.score);
            notify("Master Profile updated successfully!");
          }}
        />
      )}

      {/* Education Modal */}
      {educationModalOpen && (
        <EducationModal
          key={activeEducation?.id || "new-edu"}
          isOpen={educationModalOpen}
          onClose={() => setEducationModalOpen(false)}
          initialData={activeEducation}
          onSuccess={(saved, newScore) => {
            setEducations((prev) => {
              const exists = prev.some((e) => e.id === saved.id);
              if (exists) {
                return prev.map((e) => (e.id === saved.id ? saved : e));
              }
              return [saved, ...prev];
            });
            setScore(newScore);
            notify(activeEducation ? "Education record updated." : "Education record added.");
          }}
        />
      )}

      {/* Skill Modal */}
      {skillModalOpen && (
        <SkillModal
          key="new-skill"
          isOpen={skillModalOpen}
          onClose={() => setSkillModalOpen(false)}
          onSuccess={(saved, newScore) => {
            setSkills((prev) => {
              const exists = prev.some((s) => s.id === saved.id || s.name === saved.name);
              if (exists) return prev;
              return [...prev, saved];
            });
            setScore(newScore);
            notify("Skill added to passport.");
          }}
        />
      )}

      {/* Project Modal */}
      {projectModalOpen && (
        <ProjectModal
          key={activeProject?.id || "new-proj"}
          isOpen={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          initialData={activeProject}
          onSuccess={(saved, newScore) => {
            setProjects((prev) => {
              const exists = prev.some((p) => p.id === saved.id);
              if (exists) {
                return prev.map((p) => (p.id === saved.id ? saved : p));
              }
              return [saved, ...prev];
            });
            setScore(newScore);
            notify(activeProject ? "Project updated." : "Project added to portfolio.");
          }}
        />
      )}

      {/* Experience Modal */}
      {experienceModalOpen && (
        <ExperienceModal
          key={activeExperience?.id || "new-exp"}
          isOpen={experienceModalOpen}
          onClose={() => setExperienceModalOpen(false)}
          initialData={activeExperience}
          onSuccess={(saved, newScore) => {
            setExperiences((prev) => {
              const exists = prev.some((exp) => exp.id === saved.id);
              if (exists) {
                return prev.map((exp) => (exp.id === saved.id ? saved : exp));
              }
              return [saved, ...prev];
            });
            setScore(newScore);
            notify(activeExperience ? "Experience updated." : "Experience added.");
          }}
        />
      )}

      {/* Certification Modal */}
      {certificationModalOpen && (
        <CertificationModal
          key={activeCertification?.id || "new-cert"}
          isOpen={certificationModalOpen}
          onClose={() => setCertificationModalOpen(false)}
          initialData={activeCertification}
          onSuccess={(saved, newScore) => {
            setCertifications((prev) => {
              const exists = prev.some((c) => c.id === saved.id);
              if (exists) {
                return prev.map((c) => (c.id === saved.id ? saved : c));
              }
              return [saved, ...prev];
            });
            setScore(newScore);
            notify(activeCertification ? "Certification updated." : "Certification added.");
          }}
        />
      )}
    </StudentLayout>
  );
}
