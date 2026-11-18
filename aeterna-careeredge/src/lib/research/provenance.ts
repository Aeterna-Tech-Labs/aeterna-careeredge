// src/lib/research/provenance.ts
// Source Provenance & Research Data Governance

export interface SourceProvenance {
  sourceName: string;
  sourceUrl: string;
  retrievedDate: Date;
  lastVerifiedDate: Date;
  verificationStatus: "VERIFIED" | "PENDING_REVIEW" | "DEPRECATED";
  country: string;
  validUntil?: Date | null;
}

/**
 * Standard authorized reference source definitions.
 * Follows the requirement:
 * 1. Official government sources (AISHE, MoE, NCS, NSDC).
 * 2. Official university websites.
 * 3. Official employer career pages.
 * 4. Approved APIs & licensed providers.
 */
export const OFFICIAL_DATA_SOURCES = {
  AISHE: {
    name: "AISHE (All India Survey on Higher Education) - Ministry of Education, GoI",
    sourceUrl: "https://aishe.gov.in",
    category: "GOVERNMENT",
    reliabilityScore: 1.0,
  },
  NCS: {
    name: "National Career Service (NCS) - Ministry of Labour & Employment, GoI",
    sourceUrl: "https://www.ncs.gov.in",
    category: "GOVERNMENT",
    reliabilityScore: 1.0,
  },
  NSDC: {
    name: "National Skill Development Corporation (NSDC) - National Occupational Standards",
    sourceUrl: "https://www.nsdcindia.org",
    category: "GOVERNMENT",
    reliabilityScore: 1.0,
  },
  VTU_OFFICIAL: {
    name: "Visvesvaraya Technological University (VTU) Official Academic Portal",
    sourceUrl: "https://vtu.ac.in",
    category: "UNIVERSITY_PORTAL",
    reliabilityScore: 1.0,
  },
  KARNATAKA_DTE: {
    name: "Department of Technical Education, Government of Karnataka",
    sourceUrl: "https://dtek.karnataka.gov.in",
    category: "GOVERNMENT",
    reliabilityScore: 1.0,
  },
  USCIS_STUDENT: {
    name: "USCIS - Student and Exchange Visitor Program (SEVP) Official",
    sourceUrl: "https://www.uscis.gov",
    category: "GOVERNMENT",
    reliabilityScore: 1.0,
  },
  UK_VISAS: {
    name: "UK Visas and Immigration (UKVI) - Student Visa Route",
    sourceUrl: "https://www.gov.uk/student-visa",
    category: "GOVERNMENT",
    reliabilityScore: 1.0,
  },
} as const;

/**
 * Validates that reference data is still fresh (not stale or expired).
 * Never present stale or unverified data as current.
 */
export function isReferenceDataFresh(provenance: SourceProvenance): boolean {
  if (provenance.verificationStatus !== "VERIFIED") {
    return false;
  }

  // If there is an explicit validity date, check if it has passed
  if (provenance.validUntil && new Date() > provenance.validUntil) {
    return false;
  }

  // Default stale threshold: 180 days for academic & career reference data
  const MAX_STALE_DAYS = 180;
  const ageMs = Date.now() - new Date(provenance.lastVerifiedDate).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  return ageDays <= MAX_STALE_DAYS;
}
