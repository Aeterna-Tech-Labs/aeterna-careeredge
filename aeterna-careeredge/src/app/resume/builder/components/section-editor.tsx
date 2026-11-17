// src/app/resume/builder/components/section-editor.tsx
// Full Section & Content Editor with Granular Bullet Actions & Reordering (Part 2.1 & Part 1.4)

import React, { useState } from "react";
import type {
  FullResumeData,
  ResumeSection,
  ResumeEntry,
  SectionType,
} from "@/lib/resume/types";
import { getFrameworkForDomain } from "@/lib/resume/frameworks";
import {
  Eye,
  EyeOff,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Wand2,
  Edit2,
} from "lucide-react";

let idCounter = 0;
function createItemId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

interface SectionEditorProps {
  data: FullResumeData;
  onChangeData: (newData: FullResumeData) => void;
  onImproveBulletAction: (
    bulletText: string,
    action: "make_specific" | "shorten" | "strengthen" | "fix_grammar"
  ) => Promise<string>;
  onScrollToSection?: (sectionId: string) => void;
}

export function SectionEditor({
  data,
  onChangeData,
  onImproveBulletAction,
}: SectionEditorProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(data.sections[0]?.id || "sec_summary");
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [bulletActionLoading, setBulletActionLoading] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState("");

  const framework = getFrameworkForDomain(data.domainKey);

  // Section Reordering
  function moveSection(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.sections.length) return;

    const updated = [...data.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChangeData({ ...data, sections: updated });
  }

  // Toggle Section Visibility
  function toggleVisibility(sectionId: string) {
    const updated = data.sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    onChangeData({ ...data, sections: updated });
  }

  // Add Custom Section
  function addCustomSection(type: SectionType, customTitle: string) {
    const newSec: ResumeSection = {
      id: createItemId(`sec_${type}`),
      type,
      customTitle,
      visible: true,
      layoutOptions: { displayMode: type === "summary" ? "paragraph" : "bullets" },
      entries: [
        {
          id: createItemId("ent"),
          title: "New Item",
          bullets: [
            {
              id: createItemId("b"),
              text: "Documented role responsibility or key practical output.",
              provenance: "STUDENT_INPUT",
              isApproved: true,
            },
          ],
        },
      ],
    };

    onChangeData({ ...data, sections: [...data.sections, newSec] });
    setActiveSectionId(newSec.id);
  }

  // Delete Section
  function deleteSection(sectionId: string) {
    const updated = data.sections.filter((s) => s.id !== sectionId);
    onChangeData({ ...data, sections: updated });
    if (activeSectionId === sectionId) {
      setActiveSectionId(updated[0]?.id || "");
    }
  }

  // Rename Section
  function renameSection(sectionId: string, newTitle: string) {
    const updated = data.sections.map((s) =>
      s.id === sectionId ? { ...s, customTitle: newTitle } : s
    );
    onChangeData({ ...data, sections: updated });
  }

  // Active section data
  const currentSection = data.sections.find((s) => s.id === activeSectionId) || data.sections[0];

  return (
    <div className="space-y-4 text-xs">
      {/* ── Section Navigation / Tabs Bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#EBDDD1] pb-2.5">
        {data.sections.map((sec) => {
          const isActive = sec.id === activeSectionId;
          return (
            <div
              key={sec.id}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition cursor-pointer ${
                isActive
                  ? "border-[#7A0F1F] bg-[#FFF9ED] font-bold text-[#7A0F1F] ring-1 ring-[#7A0F1F]/30"
                  : sec.visible
                    ? "border-[#EBDDD1] bg-white text-[#2B1810] hover:bg-stone-50"
                    : "border-dashed border-stone-300 bg-stone-100 text-stone-400"
              }`}
              onClick={() => setActiveSectionId(sec.id)}
            >
              <span>{sec.customTitle}</span>
              {!sec.visible && <EyeOff size={11} className="text-stone-400 ml-0.5" />}
            </div>
          );
        })}
      </div>

      {/* ── Section Management Header (Rename, Move, Hide, Delete) ─────── */}
      {currentSection && (
        <div className="rounded-2xl border border-[#EBDDD1] bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBDDD1] pb-3">
            <div className="flex items-center gap-2 flex-1">
              {editingTitleId === currentSection.id ? (
                <input
                  type="text"
                  value={currentSection.customTitle}
                  onChange={(e) => renameSection(currentSection.id, e.target.value)}
                  onBlur={() => setEditingTitleId(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingTitleId(null)}
                  autoFocus
                  className="rounded-lg border border-[#7A0F1F] px-2 py-1 text-xs font-bold text-[#2B1810] focus:outline-hidden"
                />
              ) : (
                <div
                  className="flex items-center gap-1.5 cursor-pointer group"
                  onClick={() => setEditingTitleId(currentSection.id)}
                >
                  <h3 className="font-heading text-sm font-bold text-[#2B1810]">
                    {currentSection.customTitle}
                  </h3>
                  <Edit2 size={12} className="text-stone-400 group-hover:text-[#7A0F1F]" />
                </div>
              )}

              <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600 font-mono">
                {currentSection.type}
              </span>
            </div>

            {/* Reorder and Visibility Controls */}
            <div className="flex items-center gap-1 text-stone-600">
              {(() => {
                const idx = data.sections.findIndex((s) => s.id === currentSection.id);
                return (
                  <>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, "up")}
                      className="rounded p-1 hover:bg-stone-100 disabled:opacity-30"
                      title="Move Section Up"
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.sections.length - 1}
                      onClick={() => moveSection(idx, "down")}
                      className="rounded p-1 hover:bg-stone-100 disabled:opacity-30"
                      title="Move Section Down"
                    >
                      <MoveDown size={13} />
                    </button>
                  </>
                );
              })()}

              <button
                type="button"
                onClick={() => toggleVisibility(currentSection.id)}
                className="rounded p-1 hover:bg-stone-100"
                title={currentSection.visible ? "Hide Section in Resume" : "Show Section in Resume"}
              >
                {currentSection.visible ? <Eye size={13} /> : <EyeOff size={13} className="text-stone-400" />}
              </button>

              <button
                type="button"
                onClick={() => deleteSection(currentSection.id)}
                className="rounded p-1 hover:bg-rose-50 text-stone-400 hover:text-rose-700"
                title="Remove Section"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* ── Section Specific Content Editor ───────────────────────── */}
          {currentSection.type === "summary" && (
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-[#765F5D]">
                Professional Summary Text
              </label>
              <textarea
                rows={5}
                value={currentSection.entries[0]?.text || ""}
                onChange={(e) => {
                  const updatedEntries = [...currentSection.entries];
                  if (!updatedEntries[0]) {
                    updatedEntries[0] = { id: "ent_summary_0", bullets: [], text: e.target.value };
                  } else {
                    updatedEntries[0].text = e.target.value;
                  }
                  const updatedSections = data.sections.map((s) =>
                    s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                  );
                  onChangeData({ ...data, sections: updatedSections });
                }}
                placeholder="Write a clear, evidence-backed professional summary..."
                className="w-full rounded-xl border border-[#EBDDD1] p-3 text-xs leading-relaxed text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
              />
            </div>
          )}

          {currentSection.type === "skills" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSkillInput.trim()) {
                      e.preventDefault();
                      const currentTags = currentSection.entries[0]?.tags || [];
                      const updatedTags = [...currentTags, newSkillInput.trim()];
                      const updatedEntries = [
                        {
                          id: currentSection.entries[0]?.id || "ent_skills_0",
                          title: "Competencies",
                          tags: updatedTags,
                          bullets: [],
                        },
                      ];
                      const updatedSections = data.sections.map((s) =>
                        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                      );
                      onChangeData({ ...data, sections: updatedSections });
                      setNewSkillInput("");
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. Next.js, ICU Triage, Ind-AS)"
                  className="flex-1 rounded-xl border border-[#EBDDD1] px-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newSkillInput.trim()) return;
                    const currentTags = currentSection.entries[0]?.tags || [];
                    const updatedTags = [...currentTags, newSkillInput.trim()];
                    const updatedEntries = [
                      {
                        id: currentSection.entries[0]?.id || "ent_skills_0",
                        title: "Competencies",
                        tags: updatedTags,
                        bullets: [],
                      },
                    ];
                    const updatedSections = data.sections.map((s) =>
                      s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                    );
                    onChangeData({ ...data, sections: updatedSections });
                    setNewSkillInput("");
                  }}
                  className="rounded-xl bg-[#7A0F1F] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#600C18]"
                >
                  Add
                </button>
              </div>

              {/* Tags Cloud */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(currentSection.entries[0]?.tags || []).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-stone-50 px-2 py-0.5 text-xs text-[#2B1810]"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const currentTags = currentSection.entries[0]?.tags || [];
                        const updatedTags = currentTags.filter((_, i) => i !== sIdx);
                        const updatedEntries = [
                          {
                            ...currentSection.entries[0],
                            tags: updatedTags,
                          },
                        ];
                        const updatedSections = data.sections.map((s) =>
                          s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                        );
                        onChangeData({ ...data, sections: updatedSections });
                      }}
                      className="text-stone-400 hover:text-rose-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Standard Entry List (Experience, Education, Projects, Custom, Certifications) */}
          {currentSection.type !== "summary" && currentSection.type !== "skills" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newEntry: ResumeEntry = {
                      id: `ent_${currentSection.id}_${Date.now()}`,
                      title: "New Item",
                      subtitle: "Organization / University",
                      bullets: [
                        {
                          id: `b_${Date.now()}_0`,
                          text: "Key responsibility, deliverable, or practical methodology executed.",
                          provenance: "STUDENT_INPUT",
                          isApproved: true,
                        },
                      ],
                    };
                    const updatedEntries = [...currentSection.entries, newEntry];
                    const updatedSections = data.sections.map((s) =>
                      s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                    );
                    onChangeData({ ...data, sections: updatedSections });
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#7A0F1F] bg-[#FFF9ED] px-2.5 py-1 text-[11px] font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition"
                >
                  <Plus size={12} />
                  <span>Add Entry</span>
                </button>
              </div>

              <div className="space-y-4">
                {currentSection.entries.map((entry, entIdx) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-[#EBDDD1] bg-stone-50/40 p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#EBDDD1] pb-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          value={entry.title || ""}
                          onChange={(e) => {
                            const updatedEntries = [...currentSection.entries];
                            updatedEntries[entIdx].title = e.target.value;
                            const updatedSections = data.sections.map((s) =>
                              s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                            );
                            onChangeData({ ...data, sections: updatedSections });
                          }}
                          placeholder="Title / Degree / Project Name"
                          className="font-bold text-xs text-[#2B1810] border-b border-[#EBDDD1] bg-transparent focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={entry.subtitle || ""}
                          onChange={(e) => {
                            const updatedEntries = [...currentSection.entries];
                            updatedEntries[entIdx].subtitle = e.target.value;
                            const updatedSections = data.sections.map((s) =>
                              s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                            );
                            onChangeData({ ...data, sections: updatedSections });
                          }}
                          placeholder="Organization / Company / Institution"
                          className="text-xs text-[#765F5D] border-b border-[#EBDDD1] bg-transparent focus:outline-hidden"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updatedEntries = currentSection.entries.filter((_, i) => i !== entIdx);
                          const updatedSections = data.sections.map((s) =>
                            s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                          );
                          onChangeData({ ...data, sections: updatedSections });
                        }}
                        className="text-stone-400 hover:text-rose-700"
                        title="Delete Entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Bullet Points List with Inline AI Actions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#765F5D]">
                          Bullet Deliverables ({entry.bullets.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedEntries = [...currentSection.entries];
                            updatedEntries[entIdx].bullets.push({
                              id: `b_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                              text: "Add actionable deliverable or procedure.",
                              provenance: "STUDENT_INPUT",
                              isApproved: true,
                            });
                            const updatedSections = data.sections.map((s) =>
                              s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                            );
                            onChangeData({ ...data, sections: updatedSections });
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#7A0F1F] hover:underline"
                        >
                          <Plus size={11} />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {entry.bullets.map((bullet, bIdx) => {
                          return (
                            <div
                              key={bullet.id}
                              className="rounded-lg border border-[#EBDDD1] bg-white p-2 space-y-1.5"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-[#7A0F1F] font-bold shrink-0 mt-1">•</span>
                                <textarea
                                  rows={2}
                                  value={bullet.text}
                                  onChange={(e) => {
                                    const updatedEntries = [...currentSection.entries];
                                    updatedEntries[entIdx].bullets[bIdx].text = e.target.value;
                                    const updatedSections = data.sections.map((s) =>
                                      s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                                    );
                                    onChangeData({ ...data, sections: updatedSections });
                                  }}
                                  className="w-full text-xs text-[#2B1810] focus:outline-hidden leading-relaxed resize-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedEntries = [...currentSection.entries];
                                    updatedEntries[entIdx].bullets = updatedEntries[entIdx].bullets.filter(
                                      (_, i) => i !== bIdx
                                    );
                                    const updatedSections = data.sections.map((s) =>
                                      s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                                    );
                                    onChangeData({ ...data, sections: updatedSections });
                                  }}
                                  className="text-stone-300 hover:text-rose-700 shrink-0"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              {/* Targeted Bullet Improvement Actions */}
                              <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-1.5 text-[10px]">
                                <span className="font-bold text-[#765F5D] flex items-center gap-1">
                                  <Wand2 size={10} className="text-[#F6B51C]" />
                                  <span>AI Rewrite:</span>
                                </span>

                                <button
                                  type="button"
                                  disabled={bulletActionLoading}
                                  onClick={async () => {
                                    setBulletActionLoading(true);
                                    try {
                                      const improved = await onImproveBulletAction(bullet.text, "make_specific");
                                      const updatedEntries = [...currentSection.entries];
                                      updatedEntries[entIdx].bullets[bIdx].text = improved;
                                      const updatedSections = data.sections.map((s) =>
                                        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                                      );
                                      onChangeData({ ...data, sections: updatedSections });
                                    } finally {
                                      setBulletActionLoading(false);
                                    }
                                  }}
                                  className="rounded bg-[#FDF7F5] px-1.5 py-0.5 text-[#7A0F1F] font-semibold border border-[#EBDDD1] hover:bg-[#FFF0D4] transition"
                                >
                                  Make Specific
                                </button>

                                <button
                                  type="button"
                                  disabled={bulletActionLoading}
                                  onClick={async () => {
                                    setBulletActionLoading(true);
                                    try {
                                      const improved = await onImproveBulletAction(bullet.text, "shorten");
                                      const updatedEntries = [...currentSection.entries];
                                      updatedEntries[entIdx].bullets[bIdx].text = improved;
                                      const updatedSections = data.sections.map((s) =>
                                        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                                      );
                                      onChangeData({ ...data, sections: updatedSections });
                                    } finally {
                                      setBulletActionLoading(false);
                                    }
                                  }}
                                  className="rounded bg-[#FDF7F5] px-1.5 py-0.5 text-[#7A0F1F] font-semibold border border-[#EBDDD1] hover:bg-[#FFF0D4] transition"
                                >
                                  Shorten
                                </button>

                                <button
                                  type="button"
                                  disabled={bulletActionLoading}
                                  onClick={async () => {
                                    setBulletActionLoading(true);
                                    try {
                                      const improved = await onImproveBulletAction(bullet.text, "strengthen");
                                      const updatedEntries = [...currentSection.entries];
                                      updatedEntries[entIdx].bullets[bIdx].text = improved;
                                      const updatedSections = data.sections.map((s) =>
                                        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                                      );
                                      onChangeData({ ...data, sections: updatedSections });
                                    } finally {
                                      setBulletActionLoading(false);
                                    }
                                  }}
                                  className="rounded bg-[#FDF7F5] px-1.5 py-0.5 text-[#7A0F1F] font-semibold border border-[#EBDDD1] hover:bg-[#FFF0D4] transition"
                                >
                                  Strengthen
                                </button>

                                <button
                                  type="button"
                                  disabled={bulletActionLoading}
                                  onClick={async () => {
                                    setBulletActionLoading(true);
                                    try {
                                      const improved = await onImproveBulletAction(bullet.text, "fix_grammar");
                                      const updatedEntries = [...currentSection.entries];
                                      updatedEntries[entIdx].bullets[bIdx].text = improved;
                                      const updatedSections = data.sections.map((s) =>
                                        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                                      );
                                      onChangeData({ ...data, sections: updatedSections });
                                    } finally {
                                      setBulletActionLoading(false);
                                    }
                                  }}
                                  className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-900 font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
                                >
                                  Fix Grammar Only
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Add Section Bar (With Domain Framework Recommendations) ────── */}
      <div className="rounded-2xl border border-dashed border-[#EBDDD1] bg-[#FDFBF9] p-4 space-y-2">
        <span className="font-bold text-[#2B1810] text-[11px] uppercase tracking-wider block">
          Add Specialized Sections:
        </span>
        <div className="flex flex-wrap gap-2">
          {framework.sections.map((sec) => {
            const alreadyHas = data.sections.some((s) => s.customTitle === sec.label);
            if (alreadyHas) return null;

            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => addCustomSection("custom", sec.label)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED] transition"
              >
                <Plus size={11} />
                <span>{sec.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => addCustomSection("custom", "Custom Section")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#7A0F1F] bg-[#7A0F1F] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#600C18] transition"
          >
            <Plus size={11} />
            <span>+ Create Freeform Section</span>
          </button>
        </div>
      </div>
    </div>
  );
}
