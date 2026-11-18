// src/app/resume/builder/components/section-editor.tsx
// FlowCV-Inspired Section & Entry Customization Editor
// Granular Entry Fields, HTML5 Drag-and-Drop Reordering, Inline AI Diff, and Custom Sections

import React, { useState, useEffect } from "react";
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
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  ExternalLink,
  Tag,
  AlignLeft,
  List,
  GripVertical,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Award,
  Globe,
  Briefcase,
  Lightbulb,
} from "lucide-react";

let idCounter = 0;
function createItemId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

interface SectionEditorProps {
  data: FullResumeData;
  onChangeData: (newData: FullResumeData) => void;
  onImproveBulletAction: (
    bulletText: string,
    action: "make_specific" | "shorten" | "strengthen" | "fix_grammar"
  ) => Promise<string>;
  onScrollToSection?: (sectionId: string) => void;
  activeSectionId?: string;
  onSelectSection?: (sectionId: string) => void;
}

interface BulletDiffState {
  entIdx: number;
  bIdx: number;
  originalText: string;
  improvedText: string;
  action: "make_specific" | "shorten" | "strengthen" | "fix_grammar";
  loading: boolean;
}

export function SectionEditor({
  data,
  onChangeData,
  onImproveBulletAction,
  onScrollToSection,
  activeSectionId: externalActiveSectionId,
  onSelectSection,
}: SectionEditorProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    externalActiveSectionId || data.sections[0]?.id || "sec_summary"
  );
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [newTagInputs, setNewTagInputs] = useState<Record<string, string>>({});

  // Drag and drop states
  const [draggedSectionIdx, setDraggedSectionIdx] = useState<number | null>(null);
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState<number | null>(null);

  const [draggedEntryIdx, setDraggedEntryIdx] = useState<number | null>(null);
  const [dragOverEntryIdx, setDragOverEntryIdx] = useState<number | null>(null);

  const [draggedBulletKey, setDraggedBulletKey] = useState<string | null>(null);
  const [dragOverBulletKey, setDragOverBulletKey] = useState<string | null>(null);

  // Active Bullet Side-by-Side Diff Modal/Box
  const [activeBulletDiff, setActiveBulletDiff] = useState<BulletDiffState | null>(null);

  // Sync external active section ID if updated from preview click
  useEffect(() => {
    if (externalActiveSectionId && externalActiveSectionId !== activeSectionId) {
      setActiveSectionId(externalActiveSectionId);
    }
  }, [externalActiveSectionId, activeSectionId]);

  const framework = getFrameworkForDomain(data.domainKey);

  // Section Reordering via Up/Down or Drag & Drop
  function moveSection(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.sections.length) return;

    const updated = [...data.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChangeData({ ...data, sections: updated });
  }

  function handleSectionDragStart(e: React.DragEvent, idx: number) {
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
    setDraggedSectionIdx(idx);
  }

  function handleSectionDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSectionIdx(idx);
  }

  function handleSectionDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault();
    const fromIdx = Number(e.dataTransfer.getData("text/plain"));
    if (!isNaN(fromIdx) && fromIdx !== toIdx) {
      const updated = [...data.sections];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      onChangeData({ ...data, sections: updated });
    }
    setDraggedSectionIdx(null);
    setDragOverSectionIdx(null);
  }

  // Toggle Section Visibility
  function toggleVisibility(sectionId: string) {
    const updated = data.sections.map((s) =>
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    );
    onChangeData({ ...data, sections: updated });
  }

  // Add Custom Section
  function addCustomSection(
    type: SectionType,
    customTitle: string,
    displayMode: "bullets" | "paragraph" | "tags" = "bullets"
  ) {
    const newSec: ResumeSection = {
      id: createItemId(`sec_${type}`),
      type,
      customTitle,
      visible: true,
      layoutOptions: { displayMode },
      entries: [
        {
          id: createItemId("ent"),
          title: "New Item",
          subtitle: "Organization / Institution",
          bullets: [
            {
              id: createItemId("b"),
              text: "Documented role responsibility, procedure, or key verified output.",
              provenance: "STUDENT_INPUT",
              isApproved: true,
            },
          ],
        },
      ],
    };

    onChangeData({ ...data, sections: [...data.sections, newSec] });
    setActiveSectionId(newSec.id);
    if (onSelectSection) onSelectSection(newSec.id);
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
  const currentSection =
    data.sections.find((s) => s.id === activeSectionId) || data.sections[0];

  // Update Section Display Mode
  function setSectionDisplayMode(mode: "bullets" | "paragraph" | "tags") {
    if (!currentSection) return;
    const updatedSections = data.sections.map((s) =>
      s.id === currentSection.id
        ? {
            ...s,
            layoutOptions: {
              ...(s.layoutOptions || {}),
              displayMode: mode,
            },
          }
        : s
    );
    onChangeData({ ...data, sections: updatedSections });
  }

  // Entry Reordering (Move & Drag/Drop)
  function moveEntry(entryIdx: number, direction: "up" | "down") {
    if (!currentSection) return;
    const targetIdx = direction === "up" ? entryIdx - 1 : entryIdx + 1;
    if (targetIdx < 0 || targetIdx >= currentSection.entries.length) return;

    const updatedEntries = [...currentSection.entries];
    const [moved] = updatedEntries.splice(entryIdx, 1);
    updatedEntries.splice(targetIdx, 0, moved);

    const updatedSections = data.sections.map((s) =>
      s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
    );
    onChangeData({ ...data, sections: updatedSections });
  }

  function handleEntryDragStart(e: React.DragEvent, idx: number) {
    e.dataTransfer.setData("text/plain", String(idx));
    e.dataTransfer.effectAllowed = "move";
    setDraggedEntryIdx(idx);
  }

  function handleEntryDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverEntryIdx(idx);
  }

  function handleEntryDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault();
    const fromIdx = Number(e.dataTransfer.getData("text/plain"));
    if (!isNaN(fromIdx) && fromIdx !== toIdx && currentSection) {
      const updatedEntries = [...currentSection.entries];
      const [moved] = updatedEntries.splice(fromIdx, 1);
      updatedEntries.splice(toIdx, 0, moved);
      const updatedSections = data.sections.map((s) =>
        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
      );
      onChangeData({ ...data, sections: updatedSections });
    }
    setDraggedEntryIdx(null);
    setDragOverEntryIdx(null);
  }

  // Bullet Reordering (Move & Drag/Drop)
  function moveBullet(entIdx: number, bIdx: number, direction: "up" | "down") {
    if (!currentSection) return;
    const targetIdx = direction === "up" ? bIdx - 1 : bIdx + 1;
    const updatedEntries = [...currentSection.entries];
    const targetBullets = [...updatedEntries[entIdx].bullets];
    if (targetIdx < 0 || targetIdx >= targetBullets.length) return;

    const [moved] = targetBullets.splice(bIdx, 1);
    targetBullets.splice(targetIdx, 0, moved);
    updatedEntries[entIdx] = { ...updatedEntries[entIdx], bullets: targetBullets };

    const updatedSections = data.sections.map((s) =>
      s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
    );
    onChangeData({ ...data, sections: updatedSections });
  }

  function handleBulletDragStart(e: React.DragEvent, entIdx: number, bIdx: number) {
    e.dataTransfer.setData("text/plain", `${entIdx}:${bIdx}`);
    e.dataTransfer.effectAllowed = "move";
    setDraggedBulletKey(`${entIdx}:${bIdx}`);
  }

  function handleBulletDragOver(e: React.DragEvent, entIdx: number, bIdx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverBulletKey(`${entIdx}:${bIdx}`);
  }

  function handleBulletDrop(e: React.DragEvent, entIdx: number, toBIdx: number) {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("text/plain");
    const [fromEntStr, fromBStr] = dataStr.split(":");
    const fromEntIdx = Number(fromEntStr);
    const fromBIdx = Number(fromBStr);

    if (fromEntIdx === entIdx && fromBIdx !== toBIdx && currentSection) {
      const updatedEntries = [...currentSection.entries];
      const updatedBullets = [...updatedEntries[entIdx].bullets];
      const [moved] = updatedBullets.splice(fromBIdx, 1);
      updatedBullets.splice(toBIdx, 0, moved);
      updatedEntries[entIdx] = { ...updatedEntries[entIdx], bullets: updatedBullets };

      const updatedSections = data.sections.map((s) =>
        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
      );
      onChangeData({ ...data, sections: updatedSections });
    }
    setDraggedBulletKey(null);
    setDragOverBulletKey(null);
  }

  // Tag Management
  function addEntryTag(entryIdx: number, tagText: string) {
    if (!currentSection || !tagText.trim()) return;
    const updatedEntries = [...currentSection.entries];
    const currentTags = updatedEntries[entryIdx].tags || [];
    if (!currentTags.includes(tagText.trim())) {
      updatedEntries[entryIdx].tags = [...currentTags, tagText.trim()];
      const updatedSections = data.sections.map((s) =>
        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
      );
      onChangeData({ ...data, sections: updatedSections });
    }
  }

  function removeEntryTag(entryIdx: number, tagIdx: number) {
    if (!currentSection) return;
    const updatedEntries = [...currentSection.entries];
    const currentTags = updatedEntries[entryIdx].tags || [];
    updatedEntries[entryIdx].tags = currentTags.filter((_, i) => i !== tagIdx);
    const updatedSections = data.sections.map((s) =>
      s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
    );
    onChangeData({ ...data, sections: updatedSections });
  }

  // AI Bullet Improvement Handler (Side-by-side Diff Preview)
  async function triggerBulletImprovement(
    entIdx: number,
    bIdx: number,
    bulletText: string,
    action: "make_specific" | "shorten" | "strengthen" | "fix_grammar"
  ) {
    setActiveBulletDiff({
      entIdx,
      bIdx,
      originalText: bulletText,
      improvedText: "Analyzing phrasing and generating ATS-optimized improvement...",
      action,
      loading: true,
    });

    try {
      const improved = await onImproveBulletAction(bulletText, action);
      setActiveBulletDiff({
        entIdx,
        bIdx,
        originalText: bulletText,
        improvedText: improved,
        action,
        loading: false,
      });
    } catch {
      setActiveBulletDiff((prev) =>
        prev
          ? {
              ...prev,
              improvedText: "Failed to generate AI rewrite. Please check connectivity or retry.",
              loading: false,
            }
          : null
      );
    }
  }

  function acceptBulletDiff() {
    if (!activeBulletDiff || !currentSection) return;
    const { entIdx, bIdx, improvedText } = activeBulletDiff;
    const updatedEntries = [...currentSection.entries];
    if (updatedEntries[entIdx]?.bullets[bIdx]) {
      updatedEntries[entIdx].bullets[bIdx] = {
        ...updatedEntries[entIdx].bullets[bIdx],
        text: improvedText,
        provenance: "AI_SUGGESTION",
        isApproved: true,
      };
      const updatedSections = data.sections.map((s) =>
        s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
      );
      onChangeData({ ...data, sections: updatedSections });
    }
    setActiveBulletDiff(null);
  }

  return (
    <div className="space-y-4 text-xs">
      {/* ── Section Navigation & Drag-and-Drop Reorder Bar ───────────── */}
      <div className="space-y-1.5 border-b border-[#EBDDD1] pb-3">
        <div className="flex items-center justify-between text-[11px] text-[#765F5D] px-1">
          <span className="font-bold uppercase tracking-wider">Drag tabs or click to edit:</span>
          <span>{data.sections.length} Sections</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {data.sections.map((sec, idx) => {
            const isActive = sec.id === activeSectionId;
            const isDragging = draggedSectionIdx === idx;
            const isOver = dragOverSectionIdx === idx;

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={(e) => handleSectionDragStart(e, idx)}
                onDragOver={(e) => handleSectionDragOver(e, idx)}
                onDrop={(e) => handleSectionDrop(e, idx)}
                className={`group flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs transition select-none cursor-grab active:cursor-grabbing ${
                  isDragging
                    ? "opacity-40 border-[#7A0F1F] bg-[#FFF9ED]"
                    : isOver
                      ? "border-2 border-[#7A0F1F] bg-[#FFF9ED]/60"
                      : isActive
                        ? "border-[#7A0F1F] bg-[#FFF9ED] font-bold text-[#7A0F1F] shadow-xs ring-1 ring-[#7A0F1F]/20"
                        : sec.visible
                          ? "border-[#EBDDD1] bg-white text-[#2B1810] hover:bg-[#FDF7F5]"
                          : "border-dashed border-stone-300 bg-stone-100 text-stone-400"
                }`}
                onClick={() => {
                  setActiveSectionId(sec.id);
                  setExpandedEntryId(null);
                  if (onSelectSection) onSelectSection(sec.id);
                  if (onScrollToSection) onScrollToSection(sec.id);
                }}
              >
                <GripVertical
                  size={12}
                  className="text-stone-300 group-hover:text-stone-600 shrink-0"
                />
                <span className="truncate max-w-[140px]">{sec.customTitle}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(sec.id);
                  }}
                  className="text-stone-400 hover:text-stone-700 ml-0.5"
                  title={sec.visible ? "Hide section" : "Show section"}
                >
                  {sec.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section Management Header ─────────────────────────────────── */}
      {currentSection && (
        <div className="rounded-2xl border border-[#EBDDD1] bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EBDDD1] pb-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
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
                  title="Click to rename section title"
                >
                  <h3 className="font-heading text-sm font-bold text-[#2B1810]">
                    {currentSection.customTitle}
                  </h3>
                  <Edit2 size={12} className="text-stone-400 group-hover:text-[#7A0F1F]" />
                </div>
              )}

              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600 font-mono">
                {currentSection.type}
              </span>
            </div>

            {/* Display Mode Toggle (Bullets vs Narrative Paragraph) */}
            {currentSection.type !== "skills" && currentSection.type !== "summary" && (
              <div className="flex items-center gap-1 rounded-xl border border-[#EBDDD1] bg-[#FCF9F6] p-0.5">
                <button
                  type="button"
                  onClick={() => setSectionDisplayMode("bullets")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                    (currentSection.layoutOptions?.displayMode || "bullets") === "bullets"
                      ? "bg-[#7A0F1F] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  title="Display as Bullet Points"
                >
                  <List size={11} />
                  <span>Bullets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSectionDisplayMode("paragraph")}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                    currentSection.layoutOptions?.displayMode === "paragraph"
                      ? "bg-[#7A0F1F] text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                  title="Display as Narrative Paragraph"
                >
                  <AlignLeft size={11} />
                  <span>Paragraph</span>
                </button>
              </div>
            )}

            {/* Reorder and Delete Controls */}
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
                      title="Move Section Up (Alt+Up)"
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === data.sections.length - 1}
                      onClick={() => moveSection(idx, "down")}
                      className="rounded p-1 hover:bg-stone-100 disabled:opacity-30"
                      title="Move Section Down (Alt+Down)"
                    >
                      <MoveDown size={13} />
                    </button>
                  </>
                );
              })()}

              <button
                type="button"
                onClick={() => toggleVisibility(currentSection.id)}
                className="rounded p-1 hover:bg-stone-100 ml-1"
                title={currentSection.visible ? "Hide from resume" : "Show in resume"}
              >
                {currentSection.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete the "${currentSection.customTitle}" section?`)) {
                    deleteSection(currentSection.id);
                  }
                }}
                className="rounded p-1 text-stone-400 hover:text-rose-700 ml-1"
                title="Delete Section"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* ── Summary Section Editor ──────────────────────────────────── */}
          {currentSection.type === "summary" && (
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold text-[#765F5D]">
                Professional Summary / Executive Pitch:
              </label>
              <textarea
                rows={5}
                value={currentSection.entries[0]?.text || ""}
                onChange={(e) => {
                  const updatedEntries = [
                    {
                      id: currentSection.entries[0]?.id || createItemId("ent_sum"),
                      title: "Summary",
                      text: e.target.value,
                      bullets: [],
                    },
                  ];
                  const updatedSections = data.sections.map((s) =>
                    s.id === currentSection.id ? { ...s, entries: updatedEntries } : s
                  );
                  onChangeData({ ...data, sections: updatedSections });
                }}
                placeholder="Highlight 2-3 key competencies, verified career focus, and demonstrable impact..."
                className="w-full rounded-xl border border-[#EBDDD1] bg-white p-3 text-xs leading-relaxed text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
              />
            </div>
          )}

          {/* ── Skills Section Editor ───────────────────────────────────── */}
          {currentSection.type === "skills" && (
            <div className="space-y-3">
              <label className="block text-[11px] font-semibold text-[#765F5D]">
                Skills &amp; Competencies:
              </label>

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
                          id: currentSection.entries[0]?.id || createItemId("ent_skills"),
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
                  placeholder="Type skill name and press Enter (e.g. Next.js, Financial Modeling, ICD-10)..."
                  className="flex-1 rounded-xl border border-[#EBDDD1] bg-white px-3 py-2 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newSkillInput.trim()) return;
                    const currentTags = currentSection.entries[0]?.tags || [];
                    const updatedTags = [...currentTags, newSkillInput.trim()];
                    const updatedEntries = [
                      {
                        id: currentSection.entries[0]?.id || createItemId("ent_skills"),
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
                  className="rounded-xl bg-[#7A0F1F] px-4 py-2 text-xs font-bold text-white hover:bg-[#600C18]"
                >
                  Add Skill
                </button>
              </div>

              {/* Tags Cloud */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(currentSection.entries[0]?.tags || []).map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-stone-50 px-2.5 py-1 text-xs text-[#2B1810]"
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
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Standard Entry List (Drag-and-Drop Accordion) ───────────── */}
          {currentSection.type !== "summary" && currentSection.type !== "skills" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#765F5D] uppercase tracking-wider">
                  Entries ({currentSection.entries.length}) &bull; Drag to reorder
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const newEntry: ResumeEntry = {
                      id: createItemId(`ent_${currentSection.type}`),
                      title: "New Item",
                      subtitle: "Organization / Institution",
                      startDate: "",
                      endDate: "",
                      isCurrent: false,
                      location: "",
                      url: "",
                      score: "",
                      tags: [],
                      bullets: [
                        {
                          id: createItemId("b"),
                          text: "Documented key deliverable, procedure, or measurable impact.",
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
                    setExpandedEntryId(newEntry.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#7A0F1F] bg-[#FFF9ED] px-3 py-1.5 text-xs font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition"
                >
                  <Plus size={12} />
                  <span>Add {currentSection.customTitle.replace(/s$/, "") || "Entry"}</span>
                </button>
              </div>

              {/* Entries Accordion Cards */}
              <div className="space-y-3">
                {currentSection.entries.map((entry, entIdx) => {
                  const isExpanded =
                    expandedEntryId === entry.id ||
                    (expandedEntryId === null && entIdx === 0);
                  const tagInput = newTagInputs[entry.id] || "";
                  const isDragging = draggedEntryIdx === entIdx;
                  const isOver = dragOverEntryIdx === entIdx;

                  return (
                    <div
                      key={entry.id}
                      draggable
                      onDragStart={(e) => handleEntryDragStart(e, entIdx)}
                      onDragOver={(e) => handleEntryDragOver(e, entIdx)}
                      onDrop={(e) => handleEntryDrop(e, entIdx)}
                      className={`rounded-2xl border transition shadow-xs space-y-3 ${
                        isDragging
                          ? "opacity-40 border-[#7A0F1F] bg-[#FFF9ED]"
                          : isOver
                            ? "border-2 border-[#7A0F1F] bg-[#FFF9ED]/60"
                            : "border-[#EBDDD1] bg-[#FFFBF9] p-3.5"
                      }`}
                    >
                      {/* Compact Collapsed Card Header */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedEntryId(isExpanded ? "" : entry.id)}
                          className="flex items-center gap-2 text-left flex-1 min-w-0 group"
                        >
                          <GripVertical
                            size={14}
                            className="text-stone-300 group-hover:text-stone-600 shrink-0 cursor-grab"
                          />
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#7A0F1F]/10 text-xs font-bold text-[#7A0F1F] shrink-0">
                            {entIdx + 1}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#2B1810] group-hover:text-[#7A0F1F] transition truncate">
                                {entry.title || "Untitled Entry"}
                              </span>
                              {entry.subtitle && (
                                <span className="text-[11px] text-stone-500 font-normal truncate">
                                  &bull; {entry.subtitle}
                                </span>
                              )}
                            </div>

                            {/* Metadata Subline (Dates, Location, Tags) */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-stone-500">
                              {(entry.startDate || entry.endDate || entry.isCurrent) && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={10} />
                                  <span>
                                    {entry.startDate || ""}
                                    {entry.endDate
                                      ? ` &ndash; ${entry.endDate}`
                                      : entry.isCurrent
                                        ? " &ndash; Present"
                                        : ""}
                                  </span>
                                </span>
                              )}
                              {entry.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={10} />
                                  <span>{entry.location}</span>
                                </span>
                              )}
                              {entry.tags && entry.tags.length > 0 && (
                                <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] text-stone-600">
                                  {entry.tags.slice(0, 3).join(", ")}
                                  {entry.tags.length > 3 ? "..." : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-stone-400 group-hover:text-stone-700 shrink-0 pr-1">
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </div>
                        </button>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={entIdx === 0}
                            onClick={() => moveEntry(entIdx, "up")}
                            className="rounded p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                            title="Move Entry Up"
                          >
                            <MoveUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={entIdx === currentSection.entries.length - 1}
                            onClick={() => moveEntry(entIdx, "down")}
                            className="rounded p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20"
                            title="Move Entry Down"
                          >
                            <MoveDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedEntries = currentSection.entries.filter(
                                (_, i) => i !== entIdx
                              );
                              const updatedSections = data.sections.map((s) =>
                                s.id === currentSection.id
                                  ? { ...s, entries: updatedEntries }
                                  : s
                              );
                              onChangeData({ ...data, sections: updatedSections });
                            }}
                            className="rounded p-1 text-stone-400 hover:text-rose-700"
                            title="Delete Entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Full Editor Fields */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-[#EBDDD1] space-y-3">
                          {/* Row 1: Title & Subtitle */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                                Title / Role / Degree / Project
                              </label>
                              <input
                                type="text"
                                value={entry.title || ""}
                                onChange={(e) => {
                                  const updatedEntries = [...currentSection.entries];
                                  updatedEntries[entIdx].title = e.target.value;
                                  const updatedSections = data.sections.map((s) =>
                                    s.id === currentSection.id
                                      ? { ...s, entries: updatedEntries }
                                      : s
                                  );
                                  onChangeData({ ...data, sections: updatedSections });
                                }}
                                placeholder="e.g. Senior Software Engineer or Healthcare Portal"
                                className="w-full rounded-xl border border-[#EBDDD1] bg-white px-3 py-1.5 text-xs font-bold text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                                Organization / Company / Institution
                              </label>
                              <input
                                type="text"
                                value={entry.subtitle || ""}
                                onChange={(e) => {
                                  const updatedEntries = [...currentSection.entries];
                                  updatedEntries[entIdx].subtitle = e.target.value;
                                  const updatedSections = data.sections.map((s) =>
                                    s.id === currentSection.id
                                      ? { ...s, entries: updatedEntries }
                                      : s
                                  );
                                  onChangeData({ ...data, sections: updatedSections });
                                }}
                                placeholder="e.g. Google, Apollo Hospitals, RV College"
                                className="w-full rounded-xl border border-[#EBDDD1] bg-white px-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {/* Row 2: Location & Dates */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                                Location
                              </label>
                              <div className="relative">
                                <MapPin
                                  size={12}
                                  className="absolute left-2.5 top-2.5 text-stone-400"
                                />
                                <input
                                  type="text"
                                  value={entry.location || ""}
                                  onChange={(e) => {
                                    const updatedEntries = [...currentSection.entries];
                                    updatedEntries[entIdx].location = e.target.value;
                                    const updatedSections = data.sections.map((s) =>
                                      s.id === currentSection.id
                                        ? { ...s, entries: updatedEntries }
                                        : s
                                    );
                                    onChangeData({ ...data, sections: updatedSections });
                                  }}
                                  placeholder="e.g. Bengaluru, India (or Remote)"
                                  className="w-full rounded-xl border border-[#EBDDD1] bg-white pl-7 pr-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                                Start Date
                              </label>
                              <div className="relative">
                                <Calendar
                                  size={12}
                                  className="absolute left-2.5 top-2.5 text-stone-400"
                                />
                                <input
                                  type="text"
                                  value={entry.startDate || ""}
                                  onChange={(e) => {
                                    const updatedEntries = [...currentSection.entries];
                                    updatedEntries[entIdx].startDate = e.target.value;
                                    const updatedSections = data.sections.map((s) =>
                                      s.id === currentSection.id
                                        ? { ...s, entries: updatedEntries }
                                        : s
                                    );
                                    onChangeData({ ...data, sections: updatedSections });
                                  }}
                                  placeholder="e.g. 08/2021 or Aug 2021"
                                  className="w-full rounded-xl border border-[#EBDDD1] bg-white pl-7 pr-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-semibold text-[#352020]">
                                  End Date
                                </label>
                                <label className="flex items-center gap-1 text-[10px] text-stone-500 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(entry.isCurrent)}
                                    onChange={(e) => {
                                      const updatedEntries = [...currentSection.entries];
                                      updatedEntries[entIdx].isCurrent = e.target.checked;
                                      if (e.target.checked) updatedEntries[entIdx].endDate = "";
                                      const updatedSections = data.sections.map((s) =>
                                        s.id === currentSection.id
                                          ? { ...s, entries: updatedEntries }
                                          : s
                                      );
                                      onChangeData({ ...data, sections: updatedSections });
                                    }}
                                    className="rounded text-[#7A0F1F]"
                                  />
                                  <span>Present</span>
                                </label>
                              </div>
                              <div className="relative">
                                <Calendar
                                  size={12}
                                  className="absolute left-2.5 top-2.5 text-stone-400"
                                />
                                <input
                                  type="text"
                                  disabled={Boolean(entry.isCurrent)}
                                  value={entry.endDate || ""}
                                  onChange={(e) => {
                                    const updatedEntries = [...currentSection.entries];
                                    updatedEntries[entIdx].endDate = e.target.value;
                                    const updatedSections = data.sections.map((s) =>
                                      s.id === currentSection.id
                                        ? { ...s, entries: updatedEntries }
                                        : s
                                    );
                                    onChangeData({ ...data, sections: updatedSections });
                                  }}
                                  placeholder={entry.isCurrent ? "Present" : "e.g. 06/2024 or Present"}
                                  className="w-full rounded-xl border border-[#EBDDD1] bg-white pl-7 pr-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden disabled:bg-stone-50 disabled:text-stone-400"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Row 3: URL & Score */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                                Project URL / Verification Link <span className="text-stone-400 font-normal">(Optional)</span>
                              </label>
                              <div className="relative">
                                <ExternalLink
                                  size={12}
                                  className="absolute left-2.5 top-2.5 text-stone-400"
                                />
                                <input
                                  type="text"
                                  value={entry.url || ""}
                                  onChange={(e) => {
                                    const updatedEntries = [...currentSection.entries];
                                    updatedEntries[entIdx].url = e.target.value;
                                    const updatedSections = data.sections.map((s) =>
                                      s.id === currentSection.id
                                        ? { ...s, entries: updatedEntries }
                                        : s
                                    );
                                    onChangeData({ ...data, sections: updatedSections });
                                  }}
                                  placeholder="e.g. https://github.com/username/project"
                                  className="w-full rounded-xl border border-[#EBDDD1] bg-white pl-7 pr-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                                Score / Grade / Honors <span className="text-stone-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                value={entry.score || ""}
                                onChange={(e) => {
                                  const updatedEntries = [...currentSection.entries];
                                  updatedEntries[entIdx].score = e.target.value;
                                  const updatedSections = data.sections.map((s) =>
                                    s.id === currentSection.id
                                      ? { ...s, entries: updatedEntries }
                                      : s
                                  );
                                  onChangeData({ ...data, sections: updatedSections });
                                }}
                                placeholder="e.g. 8.85 CGPA or First Class with Distinction"
                                className="w-full rounded-xl border border-[#EBDDD1] bg-white px-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {/* Row 4: Technologies / Tags */}
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                              Technologies &amp; Competencies
                            </label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Tag
                                  size={12}
                                  className="absolute left-2.5 top-2.5 text-stone-400"
                                />
                                <input
                                  type="text"
                                  value={tagInput}
                                  onChange={(e) =>
                                    setNewTagInputs((prev) => ({
                                      ...prev,
                                      [entry.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && tagInput.trim()) {
                                      e.preventDefault();
                                      addEntryTag(entIdx, tagInput.trim());
                                      setNewTagInputs((prev) => ({ ...prev, [entry.id]: "" }));
                                    }
                                  }}
                                  placeholder="Type tool or skill and press Enter (e.g. React, PostgreSQL, Docker)..."
                                  className="w-full rounded-xl border border-[#EBDDD1] bg-white pl-7 pr-3 py-1.5 text-xs text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!tagInput.trim()) return;
                                  addEntryTag(entIdx, tagInput.trim());
                                  setNewTagInputs((prev) => ({ ...prev, [entry.id]: "" }));
                                }}
                                className="rounded-xl border border-[#EBDDD1] bg-white px-3 py-1.5 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED]"
                              >
                                Add Tag
                              </button>
                            </div>

                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {entry.tags.map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="inline-flex items-center gap-1 rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-700"
                                  >
                                    <span>{t}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeEntryTag(entIdx, tIdx)}
                                      className="text-stone-400 hover:text-rose-700"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Row 5: Overview Description */}
                          <div>
                            <label className="mb-1 block text-[11px] font-semibold text-[#352020]">
                              Overview Description <span className="text-stone-400 font-normal">(Context or intro paragraph)</span>
                            </label>
                            <textarea
                              rows={2}
                              value={entry.text || ""}
                              onChange={(e) => {
                                const updatedEntries = [...currentSection.entries];
                                updatedEntries[entIdx].text = e.target.value;
                                const updatedSections = data.sections.map((s) =>
                                  s.id === currentSection.id
                                    ? { ...s, entries: updatedEntries }
                                    : s
                                );
                                onChangeData({ ...data, sections: updatedSections });
                              }}
                              placeholder="Briefly state the goal, scope, and technical context..."
                              className="w-full rounded-xl border border-[#EBDDD1] bg-white p-2.5 text-xs leading-relaxed text-[#2B1810] focus:border-[#7A0F1F] focus:outline-hidden resize-none"
                            />
                          </div>

                          {/* Row 6: Bullet Deliverables & Drag-and-Drop */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#765F5D]">
                                Bullet Deliverables ({entry.bullets.length}) &bull; Drag to reorder
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedEntries = [...currentSection.entries];
                                  updatedEntries[entIdx].bullets.push({
                                    id: createItemId("b"),
                                    text: "Executed actionable procedure delivering verified outcome.",
                                    provenance: "STUDENT_INPUT",
                                    isApproved: true,
                                  });
                                  const updatedSections = data.sections.map((s) =>
                                    s.id === currentSection.id
                                      ? { ...s, entries: updatedEntries }
                                      : s
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
                                const bKey = `${entIdx}:${bIdx}`;
                                const isBDragging = draggedBulletKey === bKey;
                                const isBOver = dragOverBulletKey === bKey;

                                return (
                                  <div
                                    key={bullet.id}
                                    draggable
                                    onDragStart={(e) => handleBulletDragStart(e, entIdx, bIdx)}
                                    onDragOver={(e) => handleBulletDragOver(e, entIdx, bIdx)}
                                    onDrop={(e) => handleBulletDrop(e, entIdx, bIdx)}
                                    className={`rounded-xl border transition p-2.5 space-y-2 ${
                                      isBDragging
                                        ? "opacity-40 border-[#7A0F1F] bg-[#FFF9ED]"
                                        : isBOver
                                          ? "border-2 border-[#7A0F1F] bg-[#FFF9ED]/60"
                                          : "border-[#EBDDD1] bg-white"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <GripVertical
                                        size={13}
                                        className="text-stone-300 hover:text-stone-600 shrink-0 cursor-grab mt-1"
                                      />
                                      <span className="text-[#7A0F1F] font-bold shrink-0 mt-0.5">•</span>
                                      <textarea
                                        rows={2}
                                        value={bullet.text}
                                        onChange={(e) => {
                                          const updatedEntries = [...currentSection.entries];
                                          updatedEntries[entIdx].bullets[bIdx].text = e.target.value;
                                          const updatedSections = data.sections.map((s) =>
                                            s.id === currentSection.id
                                              ? { ...s, entries: updatedEntries }
                                              : s
                                          );
                                          onChangeData({ ...data, sections: updatedSections });
                                        }}
                                        className="w-full text-xs text-[#2B1810] focus:outline-hidden leading-relaxed resize-none"
                                      />

                                      {/* Move Up/Down & Delete */}
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          disabled={bIdx === 0}
                                          onClick={() => moveBullet(entIdx, bIdx, "up")}
                                          className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5"
                                          title="Move bullet up"
                                        >
                                          <MoveUp size={11} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={bIdx === entry.bullets.length - 1}
                                          onClick={() => moveBullet(entIdx, bIdx, "down")}
                                          className="text-stone-300 hover:text-stone-600 disabled:opacity-20 p-0.5"
                                          title="Move bullet down"
                                        >
                                          <MoveDown size={11} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedEntries = [...currentSection.entries];
                                            updatedEntries[entIdx].bullets = updatedEntries[
                                              entIdx
                                            ].bullets.filter((_, i) => i !== bIdx);
                                            const updatedSections = data.sections.map((s) =>
                                              s.id === currentSection.id
                                                ? { ...s, entries: updatedEntries }
                                                : s
                                            );
                                            onChangeData({ ...data, sections: updatedSections });
                                          }}
                                          className="text-stone-300 hover:text-rose-700 p-0.5"
                                          title="Delete bullet"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Inline AI Improvement Toolbar */}
                                    <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-1.5 text-[10px]">
                                      <span className="font-bold text-[#765F5D] flex items-center gap-1">
                                        <Wand2 size={10} className="text-[#F6B51C]" />
                                        <span>Improve with AI:</span>
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          triggerBulletImprovement(
                                            entIdx,
                                            bIdx,
                                            bullet.text,
                                            "strengthen"
                                          )
                                        }
                                        className="rounded bg-[#FDF7F5] px-1.5 py-0.5 text-[#7A0F1F] font-semibold border border-[#EBDDD1] hover:bg-[#FFF0D4] transition"
                                      >
                                        Strengthen Impact
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          triggerBulletImprovement(
                                            entIdx,
                                            bIdx,
                                            bullet.text,
                                            "make_specific"
                                          )
                                        }
                                        className="rounded bg-[#FDF7F5] px-1.5 py-0.5 text-[#7A0F1F] font-semibold border border-[#EBDDD1] hover:bg-[#FFF0D4] transition"
                                      >
                                        Make Specific
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          triggerBulletImprovement(
                                            entIdx,
                                            bIdx,
                                            bullet.text,
                                            "shorten"
                                          )
                                        }
                                        className="rounded bg-[#FDF7F5] px-1.5 py-0.5 text-[#7A0F1F] font-semibold border border-[#EBDDD1] hover:bg-[#FFF0D4] transition"
                                      >
                                        Shorten
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          triggerBulletImprovement(
                                            entIdx,
                                            bIdx,
                                            bullet.text,
                                            "fix_grammar"
                                          )
                                        }
                                        className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-900 font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
                                      >
                                        Grammar Check
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bullet AI Side-by-Side Diff Box (Active Improvement) ─────── */}
      {activeBulletDiff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl border border-[#EBDDD1] space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EBDDD1] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7A0F1F] text-[#F2B63D]">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-[#2B1810]">
                    AI Bullet Point Optimizer
                  </h4>
                  <p className="text-[11px] text-[#765F5D]">
                    Review the side-by-side phrasing changes. You can edit before accepting.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveBulletDiff(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Ethics Protection Banner */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
              <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
              <span>
                <strong>Truth Guarantee:</strong> No fake numbers, employers, or skills are generated.
                Provenance tracked as <code>AI_SUGGESTION</code>.
              </span>
            </div>

            {/* Side-by-Side Diff Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Original */}
              <div className="space-y-1.5">
                <span className="font-bold text-[10px] text-stone-500 uppercase tracking-wider block">
                  Original Phrasing:
                </span>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-stone-700 leading-relaxed min-h-[90px]">
                  {activeBulletDiff.originalText}
                </div>
              </div>

              {/* Improved */}
              <div className="space-y-1.5">
                <span className="font-bold text-[10px] text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Improved Draft (Editable):</span>
                  {activeBulletDiff.loading && (
                    <span className="text-amber-600 animate-pulse">Generating...</span>
                  )}
                </span>
                <textarea
                  rows={4}
                  value={activeBulletDiff.improvedText}
                  disabled={activeBulletDiff.loading}
                  onChange={(e) =>
                    setActiveBulletDiff((prev) =>
                      prev ? { ...prev, improvedText: e.target.value } : null
                    )
                  }
                  className="w-full rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 text-xs text-stone-900 font-medium leading-relaxed focus:border-emerald-600 focus:outline-hidden resize-none min-h-[90px]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-[#EBDDD1] pt-3">
              <button
                type="button"
                onClick={() => setActiveBulletDiff(null)}
                className="rounded-xl border border-[#EBDDD1] bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition"
              >
                Keep Original
              </button>

              <button
                type="button"
                disabled={activeBulletDiff.loading}
                onClick={acceptBulletDiff}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#7A0F1F] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#600C18] disabled:opacity-50 transition shadow-xs"
              >
                <Check size={13} />
                <span>Accept Improvement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Custom & Specialized Sections ─────────────────────────── */}
      <div className="rounded-2xl border border-dashed border-[#EBDDD1] bg-[#FDFBF9] p-4 space-y-3">
        <div>
          <span className="font-bold text-[#2B1810] text-[11px] uppercase tracking-wider block">
            Add Specialized &amp; Custom Sections:
          </span>
          <p className="text-[11px] text-[#765F5D]">
            Add industry-recommended sections tailored to your academic domain and target roles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Preset Custom Section Types */}
          <button
            type="button"
            onClick={() => addCustomSection("publications", "Publications & Research", "bullets")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED] transition"
          >
            <BookOpen size={12} />
            <span>+ Publications</span>
          </button>

          <button
            type="button"
            onClick={() => addCustomSection("volunteer", "Leadership & Activities", "bullets")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED] transition"
          >
            <Briefcase size={12} />
            <span>+ Leadership</span>
          </button>

          <button
            type="button"
            onClick={() => addCustomSection("volunteer", "Community Volunteering", "bullets")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED] transition"
          >
            <Sparkles size={12} />
            <span>+ Volunteering</span>
          </button>

          <button
            type="button"
            onClick={() => addCustomSection("custom", "Patents & Inventions", "bullets")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED] transition"
          >
            <Lightbulb size={12} />
            <span>+ Patents</span>
          </button>

          <button
            type="button"
            onClick={() => addCustomSection("languages", "Languages", "tags")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED] transition"
          >
            <Globe size={12} />
            <span>+ Languages</span>
          </button>

          <button
            type="button"
            onClick={() => addCustomSection("achievements", "Honors & Awards", "bullets")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#7A0F1F] hover:bg-[#FFF9ED] transition"
          >
            <Award size={12} />
            <span>+ Awards</span>
          </button>

          {/* Domain framework sections */}
          {framework.sections.map((sec) => {
            const alreadyHas = data.sections.some((s) => s.customTitle === sec.label);
            if (alreadyHas) return null;

            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => addCustomSection("custom", sec.label, "bullets")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-[#FFF9ED] transition"
              >
                <Plus size={11} />
                <span>{sec.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => addCustomSection("custom", "Custom Section", "bullets")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#7A0F1F] bg-[#7A0F1F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#600C18] transition shadow-2xs"
          >
            <Plus size={12} />
            <span>+ Create Freeform Section</span>
          </button>
        </div>
      </div>
    </div>
  );
}
