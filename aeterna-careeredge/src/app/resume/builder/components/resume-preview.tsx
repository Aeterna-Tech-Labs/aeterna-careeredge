// src/app/resume/builder/components/resume-preview.tsx
// Universal Real-Time Multi-Template Resume Document Renderer
// Supports 6 ATS/Visual templates, full styling customization, and print-perfect page breaking.

import React from "react";
import type { FullResumeData, ResumeSection, ResumeEntry } from "@/lib/resume/types";
import { SAFE_FONTS } from "@/lib/resume/templates";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

function LinkedInIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function GitHubIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

interface ResumePreviewProps {
  data: FullResumeData;
  onSelectSection?: (sectionId: string) => void;
  activeSectionId?: string;
  isPrintMode?: boolean;
  zoom?: number;
}

export function ResumePreview({
  data,
  onSelectSection,
  activeSectionId,
  isPrintMode = false,
  zoom = 100,
}: ResumePreviewProps) {
  const { contactInfo, sections, style } = data;

  const headingFont =
    SAFE_FONTS.find((f) => f.name === style.fonts.heading)?.family ||
    "var(--font-plus-jakarta), sans-serif";
  const bodyFont =
    SAFE_FONTS.find((f) => f.name === style.fonts.body)?.family ||
    "var(--font-inter), sans-serif";

  // Margin mapping
  const marginClass = {
    compact: "p-6 sm:p-8",
    standard: "p-8 sm:p-10",
    relaxed: "p-10 sm:p-12",
  }[style.spacing.margins] || "p-8 sm:p-10";

  // Divider style mapping
  const dividerBorderClass = {
    solid: "border-b",
    dashed: "border-b border-dashed",
    subtle: "border-b border-stone-200",
    none: "border-none",
  }[style.layout.dividerStyle] || "border-b";

  // Date format helper
  function formatDate(d?: string): string {
    if (!d) return "";
    if (style.layout.dateFormat === "YYYY") {
      const year = d.split("-")[0];
      return year || d;
    }
    if (style.layout.dateFormat === "MM/YYYY") {
      const parts = d.split("-");
      if (parts.length >= 2) return `${parts[1]}/${parts[0]}`;
      return d;
    }
    // Default MMM YYYY
    try {
      const date = new Date(d);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    } catch {
      // Fallback
    }
    return d;
  }

  // Filter visible sections
  const visibleSections = sections.filter((s) => s.visible);

  // Template-specific layout branches: Two-Column Sidebar
  const isTwoColumn = style.templateId === "two-column-sidebar" || style.layout.columnLayout !== "single";

  // Partition sections for two-column if enabled
  const sidebarSectionTypes = new Set(["skills", "certifications", "languages", "volunteer"]);
  const sidebarSections = visibleSections.filter((s) => sidebarSectionTypes.has(s.type));
  const mainSections = visibleSections.filter((s) => !sidebarSectionTypes.has(s.type));

  return (
    <div
      id="resume-document-container"
      className={`resume-print-container relative mx-auto transition-all duration-150 ${
        isPrintMode
          ? "w-full max-w-none border-0 shadow-none rounded-none p-0 min-h-0 bg-transparent"
          : `min-h-[1050px] max-w-[820px] rounded-2xl border border-[#EBDDD1] shadow-md ${marginClass}`
      }`}
      style={{
        backgroundColor: style.colors.background,
        color: style.colors.body,
        fontFamily: bodyFont,
        fontSize: `${style.fontSizes.body}px`,
        lineHeight: style.spacing.lineHeight,
        transform: !isPrintMode && zoom && zoom !== 100 ? `scale(${zoom / 100})` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* ── Page Boundary Guides (Desktop Live Preview) ────────────────── */}
      {!isPrintMode && (
        <>
          <div
            className="absolute left-0 right-0 pointer-events-none flex items-center justify-between border-b-2 border-dashed border-rose-400 text-rose-700 text-[10px] font-bold px-4 py-0.5 z-20"
            style={{ top: "1123px" }}
            title="Standard A4 Page 1 Boundary (1123px cutoff)"
          >
            <span className="bg-rose-50 border border-rose-300 px-2 py-0.5 rounded shadow-xs">
              Page 1 / Page 2 Boundary (Content below spills into Page 2)
            </span>
            <span className="bg-rose-50 border border-rose-300 px-2 py-0.5 rounded shadow-xs">
              A4 Page 1 End
            </span>
          </div>

          <div
            className="absolute left-0 right-0 pointer-events-none flex items-center justify-between border-b-2 border-dashed border-rose-400 text-rose-700 text-[10px] font-bold px-4 py-0.5 z-20"
            style={{ top: "2246px" }}
            title="Standard A4 Page 2 Boundary (2246px cutoff)"
          >
            <span className="bg-rose-50 border border-rose-300 px-2 py-0.5 rounded shadow-xs">
              Page 2 / Page 3 Boundary
            </span>
            <span className="bg-rose-50 border border-rose-300 px-2 py-0.5 rounded shadow-xs">
              A4 Page 2 End
            </span>
          </div>
        </>
      )}

      {/* ── Document Header ────────────────────────────────────────────── */}
      {style.templateId === "creative-portfolio" && (
        <div
          className="h-2 w-full rounded-full mb-4"
          style={{ backgroundColor: style.colors.accent }}
        />
      )}
      <header
        className={`resume-header resume-section ${
          style.page?.fitToOnePage ? "pb-2 mb-2" : "pb-4 mb-4"
        } ${dividerBorderClass}`}
        style={{
          borderColor: style.colors.accent,
          textAlign: style.layout.headerAlignment,
          borderBottomWidth: style.templateId === "executive-classic" ? "2px" : "1px",
        }}
      >
        <div
          className={`flex flex-wrap items-center gap-4 ${
            style.layout.headerAlignment === "center" ? "justify-center" : "justify-between"
          }`}
        >
          <div>
            <h1
              className="font-bold tracking-tight"
              style={{
                fontFamily: headingFont,
                color: style.colors.heading,
                fontSize: `${style.fontSizes.name}px`,
                textTransform: style.templateId === "executive-classic" ? "uppercase" : "none",
                letterSpacing: style.templateId === "executive-classic" ? "0.05em" : "-0.01em",
              }}
            >
              {contactInfo.name || "Student Name"}
            </h1>
            <p
              className="mt-1 font-semibold tracking-wide"
              style={{
                color: style.colors.accent,
                fontSize: `${style.fontSizes.headings}px`,
                textTransform: "uppercase",
              }}
            >
              {data.targetRole || "Target Professional"}
            </p>
          </div>

          {style.layout.showPhoto && style.layout.photoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={style.layout.photoUrl}
              alt={contactInfo.name}
              className="h-20 w-20 rounded-full object-cover border-2 shadow-xs"
              style={{ borderColor: style.colors.accent }}
            />
          )}
        </div>

        {/* Contact Strip */}
        <div
          className={`mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-600 ${
            style.layout.headerAlignment === "center" ? "justify-center" : "justify-start"
          }`}
        >
          {contactInfo.email && (
            <span className="inline-flex items-center gap-1.5">
              {style.layout.showContactIcons && <Mail size={12} style={{ color: style.colors.accent }} />}
              <span>{contactInfo.email}</span>
            </span>
          )}
          {contactInfo.phone && (
            <span className="inline-flex items-center gap-1.5">
              {style.layout.showContactIcons && <Phone size={12} style={{ color: style.colors.accent }} />}
              <span>{contactInfo.phone}</span>
            </span>
          )}
          {contactInfo.location && (
            <span className="inline-flex items-center gap-1.5">
              {style.layout.showContactIcons && <MapPin size={12} style={{ color: style.colors.accent }} />}
              <span>{contactInfo.location}</span>
            </span>
          )}
          {contactInfo.linkedinUrl && (
            <a
              href={contactInfo.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
              style={{ color: style.colors.link }}
            >
              {style.layout.showContactIcons && <LinkedInIcon size={12} />}
              <span>LinkedIn</span>
            </a>
          )}
          {contactInfo.portfolioUrl && (
            <a
              href={contactInfo.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
              style={{ color: style.colors.link }}
            >
              {style.layout.showContactIcons && <Globe size={12} />}
              <span>Portfolio</span>
            </a>
          )}
          {contactInfo.githubUrl && (
            <a
              href={contactInfo.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
              style={{ color: style.colors.link }}
            >
              {style.layout.showContactIcons && <GitHubIcon size={12} />}
              <span>GitHub</span>
            </a>
          )}
        </div>
      </header>

      {/* ── Document Body (Single Column vs Two Column) ────────────────── */}
      {isTwoColumn ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Column */}
          <div
            className="col-span-12 sm:col-span-4 rounded-xl p-4 space-y-4"
            style={{ backgroundColor: style.colors.sidebar }}
          >
            {sidebarSections.map((sec) => (
              <RenderSectionBlock
                key={sec.id}
                section={sec}
                style={style}
                headingFont={headingFont}
                dividerBorderClass={dividerBorderClass}
                formatDate={formatDate}
                onSelectSection={onSelectSection}
                isSelected={!isPrintMode && activeSectionId === sec.id}
                isPrintMode={isPrintMode}
              />
            ))}
          </div>

          {/* Main Column */}
          <div className="col-span-12 sm:col-span-8 space-y-4">
            {mainSections.map((sec) => (
              <RenderSectionBlock
                key={sec.id}
                section={sec}
                style={style}
                headingFont={headingFont}
                dividerBorderClass={dividerBorderClass}
                formatDate={formatDate}
                onSelectSection={onSelectSection}
                isSelected={!isPrintMode && activeSectionId === sec.id}
                isPrintMode={isPrintMode}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleSections.map((sec) => (
            <RenderSectionBlock
              key={sec.id}
              section={sec}
              style={style}
              headingFont={headingFont}
              dividerBorderClass={dividerBorderClass}
              formatDate={formatDate}
              onSelectSection={onSelectSection}
              isSelected={!isPrintMode && activeSectionId === sec.id}
              isPrintMode={isPrintMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Single Section Renderer ───────────────────────────────────────────────────

function RenderSectionBlock({
  section,
  style,
  headingFont,
  dividerBorderClass,
  formatDate,
  onSelectSection,
  isSelected,
  isPrintMode,
}: {
  section: ResumeSection;
  style: FullResumeData["style"];
  headingFont: string;
  dividerBorderClass: string;
  formatDate: (d?: string) => string;
  onSelectSection?: (id: string) => void;
  isSelected?: boolean;
  isPrintMode?: boolean;
}) {
  return (
    <section
      id={section.id}
      onClick={() => !isPrintMode && onSelectSection && onSelectSection(section.id)}
      className={`resume-section ${
        isPrintMode
          ? ""
          : `cursor-pointer rounded-lg p-1.5 transition ${
              isSelected ? "ring-2 ring-[#7A0F1F]/40 bg-[#FFF9ED]/30" : "hover:bg-stone-50/50"
            }`
      }`}
      style={{
        marginBottom: `${style.spacing.sectionSpacing}px`,
      }}
    >
      {/* Section Title */}
      <h2
        className={`resume-section-heading font-bold uppercase tracking-wider ${
          style.page?.fitToOnePage ? "pb-0.5 mb-1 text-xs" : "pb-1 mb-2"
        } ${dividerBorderClass} ${
          style.layout.headerAlignment === "center" ? "text-center" : "text-left"
        }`}
        style={{
          fontFamily: headingFont,
          color: style.colors.heading,
          fontSize: `${style.fontSizes.headings}px`,
          borderColor: style.colors.accent,
          borderBottomWidth: style.templateId === "executive-classic" ? "2px" : "1px",
          letterSpacing: style.templateId === "executive-classic" ? "0.08em" : "0.02em",
        }}
      >
        {section.customTitle}
      </h2>

      {/* Entries */}
      <div className={style.page?.fitToOnePage ? "space-y-1.5" : "space-y-3"}>
        {section.entries.map((entry) => (
          <RenderEntryItem
            key={entry.id}
            entry={entry}
            sectionType={section.type}
            displayMode={section.layoutOptions?.displayMode}
            style={style}
            formatDate={formatDate}
          />
        ))}
      </div>
    </section>
  );
}

// ── Single Entry Item Renderer ────────────────────────────────────────────────

function RenderEntryItem({
  entry,
  sectionType: _sectionType,
  displayMode,
  style,
  formatDate,
}: {
  entry: ResumeEntry;
  sectionType?: string;
  displayMode?: "bullets" | "paragraph" | "tags" | "grouped";
  style: FullResumeData["style"];
  formatDate: (d?: string) => string;
}) {
  const hasHeader = entry.title || entry.subtitle || entry.startDate || entry.score;

  return (
    <div className={`resume-entry ${style.page?.fitToOnePage ? "space-y-0.5" : "space-y-1"}`}>
      {hasHeader && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
          <div className="font-semibold text-stone-900">
            <span>{entry.title}</span>
            {entry.subtitle && (
              <span className="font-normal text-stone-600"> • {entry.subtitle}</span>
            )}
            {entry.location && (
              <span className="font-normal text-stone-500"> ({entry.location})</span>
            )}
          </div>

          {(entry.startDate || entry.endDate || entry.score) && (
            <div className="text-[11px] text-stone-500 shrink-0 flex items-center gap-2">
              {entry.score && (
                <span className="font-semibold" style={{ color: style.colors.accent }}>
                  {entry.score}
                </span>
              )}
              {(entry.startDate || entry.endDate) && (
                <span>
                  {formatDate(entry.startDate)}
                  {entry.endDate ? ` – ${formatDate(entry.endDate)}` : entry.isCurrent ? " – Present" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* URL Link if project/portfolio item */}
      {entry.url && (
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] block hover:underline truncate max-w-sm"
          style={{ color: style.colors.link }}
        >
          {entry.url}
        </a>
      )}

      {/* Paragraph Text (e.g. for Summary or custom descriptions) */}
      {entry.text && (
        <p className="leading-relaxed text-stone-700 whitespace-pre-line">{entry.text}</p>
      )}

      {/* Skills or Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className={`flex flex-wrap ${style.page?.fitToOnePage ? "gap-1 pt-0.5" : "gap-1.5 pt-0.5"}`}>
          {entry.tags.map((tag, idx) => (
            <span
              key={idx}
              className={`rounded ${
                style.page?.fitToOnePage ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5 text-xs"
              } font-medium`}
              style={{
                backgroundColor:
                  style.templateId === "tech-minimal"
                    ? "#F3F4F6"
                    : style.templateId === "academic-clinical"
                    ? "#F0FDF4"
                    : style.templateId === "creative-portfolio"
                    ? "#F5F3FF"
                    : "#FDF7F5",
                color: style.colors.heading,
                border: "1px solid #E5E7EB",
                fontFamily: style.templateId === "tech-minimal" ? "'Courier New', monospace" : undefined,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bullet Points */}
      {entry.bullets && entry.bullets.length > 0 && (
        displayMode === "paragraph" ? (
          <p className="leading-relaxed text-stone-700 whitespace-pre-line text-xs">
            {entry.bullets.map((b) => b.text).join(" ")}
          </p>
        ) : (
          <ul
            className={`list-disc ${style.page?.fitToOnePage ? "space-y-0.5" : "space-y-1"} text-stone-700`}
            style={{
              paddingLeft: `${style.spacing.bulletIndent}px`,
            }}
          >
            {entry.bullets.map((b) => (
              <li key={b.id} className="resume-bullet leading-relaxed">
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
