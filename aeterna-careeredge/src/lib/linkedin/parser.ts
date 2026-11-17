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
    const upper = line.toUpperCase();

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

    // Process according to current section
    if (currentSection === "HEADER") {
      if (!name) {
        name = line;
      } else if (!headline) {
        headline = line;
      } else if (!location && (line.includes("India") || line.includes("Area") || line.includes("District"))) {
        location = line;
      }
    } else if (currentSection === "ABOUT") {
      aboutAccumulator.push(line);
    } else if (currentSection === "SKILLS") {
      // Skills may be bulleted or comma-separated
      if (line.includes(",")) {
        line.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => skills.push(s));
      } else if (line.startsWith("•") || line.startsWith("-")) {
        skills.push(line.replace(/^[•-]\s*/, ""));
      } else if (line.length < 50) {
        skills.push(line);
      }
    } else if (currentSection === "EXPERIENCE") {
      // Expect: Title at Company or Title then Company next line
      if (line.includes(" at ")) {
        const [titlePart, compPart] = line.split(" at ");
        experiences.push({
          title: titlePart.trim(),
          company: compPart.trim(),
          description: lines[i + 1] && !lines[i + 1].includes(" at ") ? lines[i + 1] : "",
        });
      } else if (i + 1 < lines.length && !lines[i + 1].startsWith("•") && lines[i + 1].length < 60) {
        experiences.push({
          title: line,
          company: lines[i + 1],
          description: lines[i + 2] || "",
        });
        i += 1; // skip company line
      }
    } else if (currentSection === "EDUCATION") {
      if (line.includes(" - ") || line.includes(",")) {
        const parts = line.split(/[-,]/);
        educations.push({
          institution: parts[0]?.trim() || "University",
          degree: parts[1]?.trim() || "Degree",
        });
      } else if (i + 1 < lines.length) {
        educations.push({
          institution: line,
          degree: lines[i + 1],
        });
        i += 1;
      }
    } else if (currentSection === "CERTIFICATIONS") {
      if (line.length < 80) {
        certifications.push(line.replace(/^[•-]\s*/, ""));
      }
    }
  }

  about = aboutAccumulator.join(" ");

  return {
    name: name || undefined,
    headline: headline || undefined,
    about: about || undefined,
    location: location || undefined,
    skills: Array.from(new Set(skills)),
    experiences,
    educations,
    certifications: Array.from(new Set(certifications)),
    provenance,
    importedAt: new Date().toISOString(),
  };
}
