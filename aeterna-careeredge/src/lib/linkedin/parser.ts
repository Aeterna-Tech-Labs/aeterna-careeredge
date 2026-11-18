// src/lib/linkedin/parser.ts
// LinkedIn Profile Text & PDF Parser (Day 2 Part 4.2)
// Strictly separates imported external data from Career Passport until user explicitly approves merge.

export interface ParsedLinkedInProfile {
  name?: string;
  headline?: string;
  about?: string;
  location?: string;
  skills: string[];
  experiences: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }>;
  educations: Array<{
    degree: string;
    institution: string;
    year?: string;
  }>;
  certifications: string[];
  provenance: "LINKEDIN_PDF" | "LINKEDIN_TEXT";
  importedAt: string;
}

const SECTION_HEADERS = new Set([
  "SUMMARY",
  "ABOUT",
  "EXPERIENCE",
  "WORK EXPERIENCE",
  "EDUCATION",
  "SKILLS",
  "TOP SKILLS",
  "CORE SKILLS",
  "CERTIFICATIONS",
  "LICENSES & CERTIFICATIONS",
  "PROJECTS",
  "HONORS & AWARDS",
  "LANGUAGES",
]);

function isSectionHeader(str: string): boolean {
  if (!str) return false;
  const clean = str.trim().toUpperCase().replace(/[:\-_]/g, "");
  return SECTION_HEADERS.has(clean);
}

function isBullet(str: string): boolean {
  return /^[•\-\*▪◦✓\d+\.]\s*/.test(str.trim());
}

/**
 * Parses raw text extracted from LinkedIn profile export (or manual paste).
 * Recognizes common section headers produced by official LinkedIn "Save to PDF".
 */
export function parseLinkedInProfileText(
  rawText: string,
  provenance: "LINKEDIN_PDF" | "LINKEDIN_TEXT" = "LINKEDIN_TEXT"
): ParsedLinkedInProfile {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  let name = "";
  let headline = "";
  let about = "";
  let location = "";
  const skills: string[] = [];
  const experiences: Array<{ title: string; company: string; duration?: string; description?: string }> = [];
  const educations: Array<{ degree: string; institution: string; year?: string }> = [];
  const certifications: string[] = [];

  let currentSection = "HEADER";
  const aboutAccumulator: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase().replace(/[:\-_]/g, "").trim();

    // Section Boundary Detection
    if (upper === "SUMMARY" || upper === "ABOUT") {
      currentSection = "ABOUT";
      continue;
    }
    if (upper === "EXPERIENCE" || upper === "WORK EXPERIENCE") {
      currentSection = "EXPERIENCE";
      continue;
    }
    if (upper === "EDUCATION") {
      currentSection = "EDUCATION";
      continue;
    }
    if (upper === "SKILLS" || upper === "TOP SKILLS" || upper === "CORE SKILLS") {
      currentSection = "SKILLS";
      continue;
    }
    if (upper === "CERTIFICATIONS" || upper === "LICENSES & CERTIFICATIONS") {
      currentSection = "CERTIFICATIONS";
      continue;
    }
    if (isSectionHeader(line)) {
      currentSection = upper;
      continue;
    }

    // Process according to current section
    if (currentSection === "HEADER") {
      if (!name) {
        // Skip metadata lines like "Contact", "www.linkedin.com/in/...", or page numbers
        if (/^contact$/i.test(line) || line.includes("linkedin.com") || /page \d+/i.test(line)) {
          continue;
        }
        name = line;
      } else if (!headline) {
        headline = line;
      } else if (!location && (line.includes("India") || line.includes("Area") || line.includes("District") || line.includes("City"))) {
        location = line;
      }
    } else if (currentSection === "ABOUT") {
      aboutAccumulator.push(line);
    } else if (currentSection === "SKILLS") {
      if (line.includes(",")) {
        line.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => skills.push(s));
      } else if (isBullet(line)) {
        skills.push(line.replace(/^[•\-\*▪◦✓\d+\.]\s*/, "").trim());
      } else if (line.length < 50 && !isSectionHeader(line)) {
        skills.push(line);
      }
    } else if (currentSection === "EXPERIENCE") {
      // If it's a bullet and we have an existing experience, append to its description
      if (isBullet(line) && experiences.length > 0) {
        const last = experiences[experiences.length - 1];
        const cleanBullet = line.replace(/^[•\-\*▪◦✓\d+\.]\s*/, "").trim();
        last.description = last.description ? `${last.description}\n• ${cleanBullet}` : `• ${cleanBullet}`;
        continue;
      }

      // Title at Company
      if (line.includes(" at ")) {
        const [titlePart, compPart] = line.split(" at ");
        experiences.push({
          title: titlePart.trim(),
          company: compPart.trim(),
          description: "",
        });
      } else if (
        i + 1 < lines.length &&
        !isSectionHeader(lines[i + 1]) &&
        !isBullet(lines[i + 1]) &&
        lines[i + 1].length < 80
      ) {
        // Line is title, next line is company
        experiences.push({
          title: line,
          company: lines[i + 1],
          description: "",
        });
        i += 1; // skip company line
      } else if (experiences.length > 0 && !experiences[experiences.length - 1].description) {
        experiences[experiences.length - 1].description = line;
      }
    } else if (currentSection === "EDUCATION") {
      if (isBullet(line)) continue;

      if (line.includes(" - ") || line.includes(" – ") || line.includes(",")) {
        const parts = line.split(/[–\-,]/);
        educations.push({
          institution: parts[0]?.trim() || "University",
          degree: parts[1]?.trim() || "Degree",
        });
      } else if (i + 1 < lines.length && !isSectionHeader(lines[i + 1]) && !isBullet(lines[i + 1])) {
        const line1 = line;
        const line2 = lines[i + 1];
        const isLine1Inst = /univ|colleg|institut|school|academy/i.test(line1);
        const isLine2Inst = /univ|colleg|institut|school|academy/i.test(line2);

        if (isLine1Inst && !isLine2Inst) {
          educations.push({ institution: line1, degree: line2 });
        } else {
          educations.push({ institution: line2, degree: line1 });
        }
        i += 1;
      } else {
        educations.push({
          institution: line,
          degree: "Degree / Coursework",
        });
      }
    } else if (currentSection === "CERTIFICATIONS") {
      if (line.length < 100 && !isSectionHeader(line)) {
        certifications.push(line.replace(/^[•\-\*▪◦✓\d+\.]\s*/, "").trim());
      }
    }
  }

  about = aboutAccumulator.join(" ");

  return {
    name: name || undefined,
    headline: headline || undefined,
    about: about || undefined,
    location: location || undefined,
    skills: Array.from(new Set(skills)).filter(Boolean),
    experiences,
    educations,
    certifications: Array.from(new Set(certifications)).filter(Boolean),
    provenance,
    importedAt: new Date().toISOString(),
  };
}
