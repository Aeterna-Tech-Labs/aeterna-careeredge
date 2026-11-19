// src/lib/linkedin/parser.ts
// LinkedIn Profile Text & PDF Parser (Day 2 Part 4.2)
// Strictly separates imported external data from Career Passport until user explicitly approves merge.

export interface ParsedLinkedInProfile {
  name?: string;
  email?: string;
  phone?: string;
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
  return /^[•●\-\*▪◦✓\d+\.]\s*/.test(str.trim());
}

const DATE_RANGE_REGEX =
  /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4} - (present|\b[a-z]+ \d{4}|\d{4})\s*(\([^)]+\))?/i;

/**
 * Parses raw text extracted from LinkedIn profile export (or manual paste).
 * Recognizes the official LinkedIn "Save to PDF" 2-column sidebar layout and standard pasted text.
 */
export function parseLinkedInProfileText(
  rawText: string,
  provenance: "LINKEDIN_PDF" | "LINKEDIN_TEXT" = "LINKEDIN_TEXT"
): ParsedLinkedInProfile {
  // Strip page footers (e.g. "Page 1 of 3", "Page 2 of 4")
  const rawLines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => Boolean(l) && !/^page \d+(\s+of\s+\d+)?$/i.test(l));

  let name = "";
  let email = "";
  let phone = "";
  let profileUrl = "";
  let headline = "";
  let about = "";
  let location = "";
  const skills = new Set<string>();
  const experiences: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }> = [];
  const educations: Array<{
    degree: string;
    institution: string;
    year?: string;
  }> = [];
  const certifications = new Set<string>();

  let i = 0;

  // ── 1. Check for official LinkedIn PDF Sidebar Format ───────────────────────
  const isLinkedInPdf =
    provenance === "LINKEDIN_PDF" ||
    rawLines.slice(0, 10).some((l) => /^contact$/i.test(l) || l.includes("(LinkedIn)"));

  if (isLinkedInPdf) {
    // 1.1 Process Sidebar Contact Info
    if (i < rawLines.length && /^contact$/i.test(rawLines[i])) {
      i++;
      while (
        i < rawLines.length &&
        !/^(top skills|languages|certifications|summary|about|experience)$/i.test(rawLines[i])
      ) {
        const line = rawLines[i];
        if (line.includes("@") && !email) {
          const m = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          email = m ? m[0] : line;
        } else if (/\(mobile\)|\(home\)|\(work\)|\+\d[\d\s-]{6,}/i.test(line) && !phone) {
          phone = line.replace(/\s*\([^)]*\)/i, "").trim();
        } else if (line.includes("linkedin.com") && !profileUrl) {
          profileUrl = line;
        }
        i++;
      }
    }

    // 1.2 Process Top Skills until main column header (Real Name & Headline)
    if (i < rawLines.length && /^top skills$/i.test(rawLines[i])) {
      i++;
      while (
        i < rawLines.length &&
        !/^(summary|about|experience|work experience|education|languages|certifications)$/i.test(
          rawLines[i]
        )
      ) {
        const line = rawLines[i];
        const next1 = rawLines[i + 1] || "";
        const next2 = rawLines[i + 2] || "";

        // Check if this line marks the candidate's real name (e.g. "Kunal Khairnar")
        const isPersonName =
          /^[A-Z][a-zA-Z.'-]+(\s+[A-Z][a-zA-Z.'-]+){1,3}$/.test(line) &&
          !line.includes("@") &&
          !line.includes("www.") &&
          !line.startsWith("(");

        const nextIsHeadlineOrLocation =
          next1.includes("|") ||
          next1.includes("•") ||
          /student|developer|engineer|specialist|intern|manager|lead|architect|consultant|analyst/i.test(
            next1
          ) ||
          next1.includes("India") ||
          next1.includes("Area") ||
          next1.includes("District") ||
          next2.includes("India") ||
          next2.includes("Area");

        if (isPersonName && nextIsHeadlineOrLocation && !name) {
          name = line;
          i++;
          const hlParts: string[] = [];
          while (
            i < rawLines.length &&
            !/^(summary|about|experience|work experience|education|languages|certifications)$/i.test(
              rawLines[i]
            )
          ) {
            const hlCandidate = rawLines[i];
            if (
              !location &&
              (hlCandidate.includes("India") ||
                hlCandidate.includes("Area") ||
                hlCandidate.includes("District") ||
                hlCandidate.includes("City"))
            ) {
              location = hlCandidate;
              i++;
              break;
            }
            if (
              hlCandidate.includes("|") ||
              /student|developer|engineer|specialist|intern|manager|lead|consultant|analyst/i.test(
                hlCandidate
              )
            ) {
              hlParts.push(hlCandidate.replace(/\|$/, "").trim());
              i++;
            } else {
              break;
            }
          }
          headline = hlParts.join(" ").trim();
          break;
        } else {
          // This is a skill from the Top Skills sidebar
          if (!line.startsWith("(") && line.length < 50 && !line.includes("@")) {
            skills.add(line);
          }
          i++;
        }
      }
    }
  }

  // ── 2. Process Sections (Summary, Experience, Education, Skills, Certs) ──────
  let currentSection = isLinkedInPdf ? "MAIN" : "HEADER";
  const summaryLines: string[] = [];

  while (i < rawLines.length) {
    const line = rawLines[i];
    const upper = line.toUpperCase().replace(/[:\-_]/g, "").trim();

    // Section Boundary Detection
    if (upper === "SUMMARY" || upper === "ABOUT") {
      currentSection = "SUMMARY";
      i++;
      continue;
    }
    if (upper === "EXPERIENCE" || upper === "WORK EXPERIENCE") {
      currentSection = "EXPERIENCE";
      i++;
      continue;
    }
    if (upper === "EDUCATION") {
      currentSection = "EDUCATION";
      i++;
      continue;
    }
    if (upper === "SKILLS" || upper === "TOP SKILLS" || upper === "CORE SKILLS") {
      currentSection = "SKILLS";
      i++;
      continue;
    }
    if (upper === "CERTIFICATIONS" || upper === "LICENSES & CERTIFICATIONS") {
      currentSection = "CERTIFICATIONS";
      i++;
      continue;
    }

    if (currentSection === "HEADER") {
      // In manual text imports
      if (!name) {
        if (/^contact$/i.test(line) || line.includes("linkedin.com") || line.includes("@")) {
          if (line.includes("@") && !email) email = line;
          i++;
          continue;
        }
        name = line;
      } else if (!headline) {
        if (line.includes("@")) {
          if (!email) email = line;
          i++;
          continue;
        }
        headline = line;
      } else if (
        !location &&
        (line.includes("India") ||
          line.includes("Area") ||
          line.includes("District") ||
          line.includes("City"))
      ) {
        location = line;
      }
      i++;
    } else if (currentSection === "SUMMARY") {
      // Extract embedded tech stacks e.g. "Tech Stack: HTML5 • CSS3 • JavaScript..."
      if (line.toLowerCase().startsWith("tech stack:") || line.toLowerCase().startsWith("skills:")) {
        const rawSkills = line.replace(/^(tech stack|skills):\s*/i, "");
        rawSkills
          .split(/[•●,\-▪|]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s.length < 50)
          .forEach((s) => skills.add(s));
      } else if (isBullet(line)) {
        const clean = line.replace(/^[•●\-\*▪◦✓\d+\.]\s*/, "").trim();
        if (clean.length < 50 && !clean.includes(".")) {
          skills.add(clean);
        } else {
          summaryLines.push(line);
        }
      } else {
        summaryLines.push(line);
      }
      i++;
    } else if (currentSection === "EXPERIENCE") {
      // Pattern A: LinkedIn PDF format
      // Line i:     Company Name
      // Line i+1:   Job Title
      // Line i+2:   Date range (e.g. "June 2025 - Present (1 year 6 months)")
      if (i + 2 < rawLines.length && DATE_RANGE_REGEX.test(rawLines[i + 2])) {
        const comp = rawLines[i];
        const titl = rawLines[i + 1];
        const dates = rawLines[i + 2];
        i += 3;

        // Skip location if present
        if (
          i < rawLines.length &&
          (rawLines[i].includes("India") ||
            rawLines[i].includes("Area") ||
            rawLines[i].includes("District"))
        ) {
          i++;
        }

        const descParts: string[] = [];
        while (
          i < rawLines.length &&
          !/^(education|certifications|skills|languages|summary|about)$/i.test(rawLines[i])
        ) {
          // If next block is an experience entry, stop
          if (i + 2 < rawLines.length && DATE_RANGE_REGEX.test(rawLines[i + 2])) break;
          if (i + 1 < rawLines.length && DATE_RANGE_REGEX.test(rawLines[i + 1])) break;

          const descLine = rawLines[i];
          const clean = descLine.replace(/^[•●\-\*▪◦✓\d+\.]\s*/, "").trim();
          if (clean) descParts.push(`• ${clean}`);
          i++;
        }

        experiences.push({
          company: comp,
          title: titl,
          duration: dates,
          description: descParts.join("\n"),
        });
      } else if (i + 1 < rawLines.length && DATE_RANGE_REGEX.test(rawLines[i + 1])) {
        // Pattern B: Title on line i, Date on line i+1
        const titl = rawLines[i];
        const dates = rawLines[i + 1];
        i += 2;

        const descParts: string[] = [];
        while (
          i < rawLines.length &&
          !/^(education|certifications|skills|languages|summary|about)$/i.test(rawLines[i])
        ) {
          if (i + 2 < rawLines.length && DATE_RANGE_REGEX.test(rawLines[i + 2])) break;
          if (i + 1 < rawLines.length && DATE_RANGE_REGEX.test(rawLines[i + 1])) break;

          const descLine = rawLines[i];
          const clean = descLine.replace(/^[•●\-\*▪◦✓\d+\.]\s*/, "").trim();
          if (clean) descParts.push(`• ${clean}`);
          i++;
        }

        const fallbackComp =
          experiences.length > 0 ? experiences[experiences.length - 1].company : "Organization";
        experiences.push({
          company: fallbackComp,
          title: titl,
          duration: dates,
          description: descParts.join("\n"),
        });
      } else if (line.includes(" at ")) {
        // Pattern C: "Title at Company"
        const [titlePart, compPart] = line.split(" at ");
        i++;
        const descParts: string[] = [];
        while (
          i < rawLines.length &&
          !/^(education|certifications|skills|languages|summary|about)$/i.test(rawLines[i])
        ) {
          if (rawLines[i].includes(" at ")) break;
          if (i + 2 < rawLines.length && DATE_RANGE_REGEX.test(rawLines[i + 2])) break;
          const descLine = rawLines[i];
          const clean = descLine.replace(/^[•●\-\*▪◦✓\d+\.]\s*/, "").trim();
          if (clean) descParts.push(`• ${clean}`);
          i++;
        }
        experiences.push({
          title: titlePart.trim(),
          company: compPart.trim(),
          description: descParts.join("\n"),
        });
      } else {
        i++;
      }
    } else if (currentSection === "EDUCATION") {
      // Continuation line of previous degree
      if (/^\d{4}/.test(line) && educations.length > 0) {
        educations[educations.length - 1].degree += " " + line;
        const yrMatch = educations[educations.length - 1].degree.match(
          /\((?:[A-Za-z]+ )?(\d{4})\s*-\s*(?:[A-Za-z]+ )?(\d{4})\)|\((\d{4})\)/
        );
        if (yrMatch) educations[educations.length - 1].year = yrMatch[0];
        i++;
        continue;
      }

      const inst = line;
      let deg = "Degree / Coursework";
      let yr = "";
      i++;

      if (
        i < rawLines.length &&
        !/^(certifications|skills|languages|experience|summary|education)$/i.test(rawLines[i])
      ) {
        deg = rawLines[i];
        i++;
        // Check if degree wrapped onto another line
        if (i < rawLines.length && /^\d{4}/.test(rawLines[i])) {
          deg += " " + rawLines[i];
          i++;
        }
        const yrMatch = deg.match(
          /\((?:[A-Za-z]+ )?(\d{4})\s*-\s*(?:[A-Za-z]+ )?(\d{4})\)|\((\d{4})\)/
        );
        if (yrMatch) yr = yrMatch[0];
      }

      educations.push({ institution: inst, degree: deg, year: yr });
    } else if (currentSection === "SKILLS") {
      if (line.includes(",")) {
        line
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => skills.add(s));
      } else if (line.length < 50 && !isSectionHeader(line)) {
        skills.add(line.replace(/^[•●\-\*▪◦✓\d+\.]\s*/, "").trim());
      }
      i++;
    } else if (currentSection === "CERTIFICATIONS") {
      if (line.length < 100 && !isSectionHeader(line)) {
        certifications.add(line.replace(/^[•●\-\*▪◦✓\d+\.]\s*/, "").trim());
      }
      i++;
    } else {
      i++;
    }
  }

  about = summaryLines.join(" ").trim();

  return {
    name: name || undefined,
    email: email || undefined,
    phone: phone || undefined,
    headline: headline || undefined,
    about: about || undefined,
    location: location || undefined,
    skills: Array.from(skills).filter(Boolean),
    experiences,
    educations,
    certifications: Array.from(certifications).filter(Boolean),
    provenance,
    importedAt: new Date().toISOString(),
  };
}
