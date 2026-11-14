"use client";

import { useState } from "react";
import {
  FileText,
  BookOpen,
  Network,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const tabs = [
  { id: "resume", label: "Resume", icon: FileText },
  { id: "sop", label: "Personal Statement", icon: BookOpen },
  { id: "linkedin", label: "LinkedIn Profile", icon: Network },
] as const;

type TabId = (typeof tabs)[number]["id"];

function ResumePreview() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-white p-6 shadow-lg sm:p-8">
      <div className="border-b border-border pb-5">
        <p className="font-heading text-2xl font-bold text-primary">
          Priya Sharma
        </p>
        <p className="mt-1 text-xs text-secondary-text">
          Computer Science Student · Bengaluru, India
        </p>
        <p className="mt-3 text-xs text-secondary-text">
          priya@example.com · +91 XXXXX XXXXX · LinkedIn Profile
        </p>
      </div>

      <div className="mt-6 space-y-5 text-left">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Professional Summary
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            Motivated computer science student interested in software
            development, problem-solving and building practical digital
            solutions.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Education
          </h4>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Bachelor of Engineering
          </p>
          <p className="mt-1 text-xs text-secondary-text">
            Computer Science · University / College
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Skills
          </h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {["JavaScript", "React", "HTML", "CSS", "Problem Solving"].map(
              (skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-surface-muted px-2.5 py-1 text-[10px] text-foreground"
                >
                  {skill}
                </span>
              ),
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Projects
          </h4>
          <p className="mt-2 text-sm font-semibold text-foreground">
            Student Portfolio Website
          </p>
          <p className="mt-1 text-xs leading-5 text-secondary-text">
            Designed and developed a responsive portfolio to present projects
            and technical skills.
          </p>
        </div>
      </div>
    </div>
  );
}

function SopPreview() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-white p-6 shadow-lg sm:p-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <p className="font-heading text-lg font-bold text-primary">
            Statement of Purpose
          </p>
          <p className="mt-1 text-xs text-secondary-text">
            Sample personal statement
          </p>
        </div>
        <BookOpen className="text-primary" size={24} />
      </div>

      <div className="mt-6 space-y-5 text-left">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Introduction
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            My interest in technology developed through my academic journey and
            the practical projects that helped me understand how software can
            solve real-world problems.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Academic Background
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            Through coursework and independent learning, I have developed an
            interest in programming, application development and collaborative
            problem-solving.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Future Goals
          </h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            I hope to deepen my knowledge, gain practical experience and
            contribute to meaningful technology projects in the future.
          </p>
        </div>

        <div className="rounded-lg bg-gold-soft p-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={15} />
            <span className="text-xs font-semibold">Writing guidance</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-primary-dark">
            Use your own experiences and goals. Review and personalise every
            AI-assisted suggestion before using it.
          </p>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview() {
  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-border bg-white shadow-lg">
      <div className="h-24 bg-primary sm:h-32" />

      <div className="px-6 pb-7 text-left sm:px-8">
        <div className="-mt-9 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gold-soft font-heading text-xl font-bold text-primary sm:-mt-11 sm:h-20 sm:w-20 sm:text-2xl">
          PS
        </div>

        <div className="mt-4">
          <h3 className="font-heading text-xl font-bold text-foreground">
            Priya Sharma
          </h3>
          <p className="mt-1 text-sm text-secondary-text">
            Computer Science Student | Aspiring Software Developer
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Bengaluru, Karnataka, India
          </p>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <h4 className="text-sm font-bold text-foreground">About</h4>
          <p className="mt-2 text-xs leading-6 text-secondary-text">
            I am a computer science student passionate about software
            development and learning through hands-on projects. I enjoy
            exploring new technologies, improving my problem-solving skills and
            connecting with people who build useful digital products.
          </p>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <h4 className="text-sm font-bold text-foreground">Key Skills</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {["React", "JavaScript", "Web Development", "Teamwork"].map(
              (skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-secondary-text"
                >
                  {skill}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SampleOutputSection() {
  const [activeTab, setActiveTab] = useState<TabId>("resume");

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="page-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            See what you can create
          </p>

          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your story, presented with confidence.
          </h2>

          <p className="mt-5 text-base leading-7 text-secondary-text">
            Explore examples of the professional documents and profiles you can
            work towards with CareerEdge.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <div
            role="tablist"
            aria-label="Sample output types"
            className="flex flex-wrap justify-center gap-2 rounded-xl border border-border bg-white p-2"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`sample-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="sample-output-panel"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold transition sm:text-sm ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-secondary-text hover:bg-surface-muted hover:text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            id="sample-output-panel"
            role="tabpanel"
            aria-labelledby={`sample-tab-${activeTab}`}
            className="mt-7"
          >
            {activeTab === "resume" && <ResumePreview />}
            {activeTab === "sop" && <SopPreview />}
            {activeTab === "linkedin" && <LinkedInPreview />}
          </div>
        </div>

        <div className="mt-8 flex items-start justify-center gap-2 text-center">
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" />
          <p className="max-w-xl text-xs leading-5 text-secondary-text">
            These are illustrative examples, not real student profiles or
            generated results. You review and personalise your content.
          </p>
        </div>
      </div>
    </section>
  );
}
