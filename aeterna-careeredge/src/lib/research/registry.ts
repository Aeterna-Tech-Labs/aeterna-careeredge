// src/lib/research/registry.ts
// Server-side reference data retrieval modules with source attribution

import { db } from "@/lib/db";
import { isReferenceDataFresh, type SourceProvenance } from "./provenance";

export interface VerifiedReferenceResult<T> {
  data: T;
  provenance: SourceProvenance;
  isFresh: boolean;
}

/**
 * Server-side retrieval of verified educational institutions (e.g., VTU, autonomous colleges).
 * Does not hardcode large datasets into React components.
 */
export async function getVerifiedInstitutions(filter?: {
  state?: string;
  type?: string;
}) {
  const records = await db.referenceInstitution.findMany({
    where: {
      ...(filter?.state ? { state: filter.state } : {}),
      ...(filter?.type ? { institutionType: filter.type } : {}),
      verificationStatus: "VERIFIED",
    },
    include: {
      source: true,
    },
    take: 50,
    orderBy: { name: "asc" },
  });

  return records.map((inst) => {
    const provenance: SourceProvenance = {
      sourceName: inst.source.name,
      sourceUrl: inst.sourceUrl,
      retrievedDate: inst.retrievedDate,
      lastVerifiedDate: inst.lastVerifiedDate,
      verificationStatus: inst.verificationStatus as SourceProvenance["verificationStatus"],
      country: inst.country,
      validUntil: inst.validUntil,
    };

    return {
      id: inst.id,
      name: inst.name,
      code: inst.institutionCode,
      type: inst.institutionType,
      city: inst.city,
      state: inst.state,
      websiteUrl: inst.websiteUrl,
      accreditation: inst.accreditationGrade,
      affiliatingUniv: inst.affiliatingUniv,
      provenance,
      isFresh: isReferenceDataFresh(provenance),
    };
  });
}

/**
 * Server-side retrieval of verified study destinations and official visa requirements.
 */
export async function getVerifiedStudyDestinations() {
  const records = await db.referenceStudyDestination.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: { source: true },
    orderBy: { countryName: "asc" },
  });

  return records.map((dest) => {
    const provenance: SourceProvenance = {
      sourceName: dest.source.name,
      sourceUrl: dest.sourceUrl,
      retrievedDate: dest.retrievedDate,
      lastVerifiedDate: dest.lastVerifiedDate,
      verificationStatus: dest.verificationStatus as SourceProvenance["verificationStatus"],
      country: dest.countryCode,
    };

    return {
      countryCode: dest.countryCode,
      countryName: dest.countryName,
      officialImmigrationUrl: dest.officialImmigrationUrl,
      postStudyWorkSummary: dest.postStudyWorkSummary,
      visaCategoryName: dest.visaCategoryName,
      provenance,
      isFresh: isReferenceDataFresh(provenance),
    };
  });
}
