// src/app/evidence-vault/page.tsx
// Evidence Vault ("Proof Bank") UI (Day 2 Addendum Section B1)

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { EvidenceVaultClient } from "./evidence-vault-client";

export default async function EvidenceVaultPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          academicDomain: true,
          preferredJobRole: true,
        },
      },
      skills: {
        select: { id: true, name: true, category: true },
      },
      storedDocuments: {
        select: {
          id: true,
          originalFileName: true,
          fileSizeBytes: true,
          mimeType: true,
          category: true,
        },
      },
      evidenceItems: {
        include: {
          storedDocument: {
            select: {
              id: true,
              originalFileName: true,
              fileSizeBytes: true,
              mimeType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <EvidenceVaultClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        academicDomain: user.profile?.academicDomain || "Multi-Domain",
        preferredJobRole: user.profile?.preferredJobRole || undefined,
      }}
      initialSkills={user.skills}
      initialDocuments={user.storedDocuments}
      initialEvidence={user.evidenceItems}
    />
  );
}
