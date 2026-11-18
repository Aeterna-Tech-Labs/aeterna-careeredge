// src/app/resume/builder/components/customize-panel.tsx
// Comprehensive Resume Style & Layout Customization Panel (Part 2.2)
// Template switching, color presets, WCAG contrast alerts, typography, spacing, and layout controls.

import React from "react";
import type { ResumeStyleConfig, ResumeTemplateId } from "@/lib/resume/types";
import {
  RESUME_TEMPLATES,
  COLOR_PRESETS,
  SAFE_FONTS,
  DEFAULT_STYLE_CONFIG,
  getTemplatePreset,
  evaluateColorContrast,
} from "@/lib/resume/templates";
import {
  Palette,
  Type,
  Layout,
  Maximize2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface CustomizePanelProps {
  style: ResumeStyleConfig;
  onChangeStyle: (newStyle: ResumeStyleConfig) => void;
  onFitToOnePage?: () => void;
}

export function CustomizePanel({
  style,
  onChangeStyle,
  onFitToOnePage,
}: CustomizePanelProps) {
  const contrastCheck = evaluateColorContrast(style.colors);

  function handleColorChange(key: keyof ResumeStyleConfig["colors"], value: string) {
    onChangeStyle({
      ...style,
      colors: {
        ...style.colors,
        [key]: value,
      },
    });
  }

  function handleTemplateSelect(tplId: ResumeTemplateId) {
    const preset = getTemplatePreset(tplId);
    onChangeStyle({
      ...style,
      ...preset,
      templateId: tplId,
      colors: {
        ...style.colors,
        ...(preset.colors || {}),
      },
      fonts: {
        ...style.fonts,
        ...(preset.fonts || {}),
      },
      fontSizes: {
        ...style.fontSizes,
        ...(preset.fontSizes || {}),
      },
      spacing: {
        ...style.spacing,
        ...(preset.spacing || {}),
      },
      layout: {
        ...style.layout,
        ...(preset.layout || {}),
        columnLayout: tplId === "two-column-sidebar" ? "two-column-left" : "single",
        headerAlignment: tplId === "executive-classic" ? "center" : "left",
      },
    });
  }

  return (
    <div className="space-y-6 p-4 text-xs">
      {/* ── 1. Templates Selection ────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-bold text-[#2B1810]">
          <Layout size={15} className="text-[#7A0F1F]" />
          <span>Resume Template & ATS Rating</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.values(RESUME_TEMPLATES).map((tpl) => {
            const isSelected = style.templateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => handleTemplateSelect(tpl.id)}
                className={`cursor-pointer rounded-xl border p-3 transition space-y-1.5 ${
                  isSelected
                    ? "border-[#7A0F1F] bg-[#FFF9ED] ring-1 ring-[#7A0F1F]/40 shadow-xs"
                    : "border-[#EBDDD1] bg-white hover:border-[#7A0F1F]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2B1810]">{tpl.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      tpl.isAtsSafe
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {tpl.atsRating}
                  </span>
                </div>
                <p className="text-[10px] text-[#765F5D] leading-snug">{tpl.description}</p>
                <div className="text-[9px] text-[#8A7573]">
                  <strong>Best for:</strong> {tpl.recommendedFor}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Color Palette & WCAG Contrast ───────────────────────────── */}
      <div className="space-y-3 border-t border-[#EBDDD1] pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#2B1810]">
            <Palette size={15} className="text-[#7A0F1F]" />
            <span>Color Palette & Brand Presets</span>
          </div>
          <span className="text-[10px] text-[#765F5D]">Hex / Presets</span>
        </div>

        {/* Brand Presets */}
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChangeStyle({ ...style, colors: preset.colors })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1 text-[11px] font-medium text-[#2B1810] hover:bg-[#FDF7F5] transition"
            >
              <span
                className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: preset.colors.accent }}
              />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-[#765F5D] mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={style.colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="h-7 w-7 rounded-md cursor-pointer border border-[#EBDDD1] p-0.5"
              />
              <input
                type="text"
                value={style.colors.accent}
                onChange={(e) => handleColorChange("accent", e.target.value)}
                className="w-20 rounded border border-[#EBDDD1] px-1.5 py-1 text-[11px] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#765F5D] mb-1">
              Heading Color
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={style.colors.heading}
                onChange={(e) => handleColorChange("heading", e.target.value)}
                className="h-7 w-7 rounded-md cursor-pointer border border-[#EBDDD1] p-0.5"
              />
              <input
                type="text"
                value={style.colors.heading}
                onChange={(e) => handleColorChange("heading", e.target.value)}
                className="w-20 rounded border border-[#EBDDD1] px-1.5 py-1 text-[11px] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#765F5D] mb-1">
              Body Text
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={style.colors.body}
                onChange={(e) => handleColorChange("body", e.target.value)}
                className="h-7 w-7 rounded-md cursor-pointer border border-[#EBDDD1] p-0.5"
              />
              <input
                type="text"
                value={style.colors.body}
                onChange={(e) => handleColorChange("body", e.target.value)}
                className="w-20 rounded border border-[#EBDDD1] px-1.5 py-1 text-[11px] font-mono"
              />
            </div>
          </div>
        </div>

        {/* Contrast Warning Display */}
        {contrastCheck.warnings.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
              <AlertTriangle size={13} />
              <span>WCAG 2.1 Contrast Advisory</span>
            </div>
            {contrastCheck.warnings.map((w, idx) => (
              <p key={idx} className="text-[10px] text-amber-800 leading-snug">
                • {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Typography & Font Sizes ─────────────────────────────────── */}
      <div className="space-y-3 border-t border-[#EBDDD1] pt-4">
        <div className="flex items-center gap-2 font-bold text-[#2B1810]">
          <Type size={15} className="text-[#7A0F1F]" />
          <span>Typography & Safe Fonts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#765F5D] mb-1">
              Heading Font
            </label>
            <select
              value={style.fonts.heading}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  fonts: { ...style.fonts, heading: e.target.value },
                })
              }
              className="w-full rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs text-[#2B1810] focus:outline-hidden"
            >
              {SAFE_FONTS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#765F5D] mb-1">
              Body Font
            </label>
            <select
              value={style.fonts.body}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  fonts: { ...style.fonts, body: e.target.value },
                })
              }
              className="w-full rounded-lg border border-[#EBDDD1] bg-white px-2.5 py-1.5 text-xs text-[#2B1810] focus:outline-hidden"
            >
              {SAFE_FONTS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sliders for Sizes */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[10px] text-[#765F5D]">
              Name Size: {style.fontSizes.name}px
            </label>
            <input
              type="range"
              min={18}
              max={32}
              value={style.fontSizes.name}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  fontSizes: { ...style.fontSizes, name: Number(e.target.value) },
                })
              }
              className="w-full accent-[#7A0F1F]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#765F5D]">
              Headings: {style.fontSizes.headings}px
            </label>
            <input
              type="range"
              min={11}
              max={18}
              value={style.fontSizes.headings}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  fontSizes: { ...style.fontSizes, headings: Number(e.target.value) },
                })
              }
              className="w-full accent-[#7A0F1F]"
            />
          </div>

          <div>
            <label className="block text-[10px] text-[#765F5D]">
              Body Text: {style.fontSizes.body}px
            </label>
            <input
              type="range"
              min={10}
              max={14}
              value={style.fontSizes.body}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  fontSizes: { ...style.fontSizes, body: Number(e.target.value) },
                })
              }
              className="w-full accent-[#7A0F1F]"
            />
          </div>
        </div>
      </div>

      {/* ── 4. Spacing & Page Fit ───────────────────────────────────────── */}
      <div className="space-y-3 border-t border-[#EBDDD1] pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#2B1810]">
            <Maximize2 size={15} className="text-[#7A0F1F]" />
            <span>Spacing & Layout Dimensions</span>
          </div>

          {onFitToOnePage && (
            <button
              type="button"
              onClick={onFitToOnePage}
              className="inline-flex items-center gap-1 rounded-lg border border-[#F6B51C] bg-[#FFF9ED] px-2 py-0.5 text-[10px] font-bold text-[#7A0F1F] hover:bg-[#FFF0D4] transition"
            >
              <Sparkles size={11} className="text-[#F6B51C]" />
              <span>Fit to 1 Page</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#765F5D] mb-1">
              Page Margins
            </label>
            <select
              value={style.spacing.margins}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  spacing: {
                    ...style.spacing,
                    margins: e.target.value as "compact" | "standard" | "relaxed",
                  },
                })
              }
              className="w-full rounded-lg border border-[#EBDDD1] bg-white px-2 py-1.5 text-xs text-[#2B1810]"
            >
              <option value="compact">Compact (8mm - Max Density)</option>
              <option value="standard">Standard (12mm - Clean Balance)</option>
              <option value="relaxed">Relaxed (16mm - Spacious)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#765F5D] mb-1">
              Section Dividers
            </label>
            <select
              value={style.layout.dividerStyle}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  layout: {
                    ...style.layout,
                    dividerStyle: e.target.value as ResumeStyleConfig["layout"]["dividerStyle"],
                  },
                })
              }
              className="w-full rounded-lg border border-[#EBDDD1] bg-white px-2 py-1.5 text-xs text-[#2B1810]"
            >
              <option value="solid">Solid Accent Rule</option>
              <option value="dashed">Dashed Rule</option>
              <option value="subtle">Subtle Light Rule</option>
              <option value="none">No Dividers (Clean Whitespace)</option>
            </select>
          </div>
        </div>

        {/* Layout Options: Photo, Alignment, Icons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={style.layout.showContactIcons}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  layout: { ...style.layout, showContactIcons: e.target.checked },
                })
              }
              className="rounded text-[#7A0F1F]"
            />
            <span>Show Contact Icons</span>
          </label>

          <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={style.layout.showPhoto}
              onChange={(e) =>
                onChangeStyle({
                  ...style,
                  layout: { ...style.layout, showPhoto: e.target.checked },
                })
              }
              className="rounded text-[#7A0F1F]"
            />
            <span>Include Photo</span>
          </label>
        </div>

        {style.layout.showPhoto && (
          <p className="text-[10px] text-[#8A7573] bg-[#FFF9ED] p-2 rounded-lg border border-[#F6B51C]/40">
            Note: Indian IT/Engineering and international ATS employers recommend omitting photos to eliminate unconscious hiring bias. Use primarily for client-facing or hospitality roles.
          </p>
        )}
      </div>

      {/* ── 5. Reset to Defaults ───────────────────────────────────────── */}
      <div className="border-t border-[#EBDDD1] pt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onChangeStyle(DEFAULT_STYLE_CONFIG)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDDD1] bg-white px-3 py-1.5 text-xs font-semibold text-[#765F5D] hover:bg-[#FDF7F5] transition"
        >
          <RotateCcw size={12} />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
}
