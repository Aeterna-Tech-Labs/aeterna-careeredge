// aeterna-careeredge/scripts/run-passport-deduplication.js
// Runs deduplication across all users in database and reports summary

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function normalizeText(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[–—â€“]/g, "-")
    .replace(/[^a-z0-9&+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isFuzzyMatch(a, b) {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const shorter = normA.length <= normB.length ? normA : normB;
  const longer = normA.length > normB.length ? normA : normB;

  if (shorter.length >= 4 && longer.includes(shorter)) {
    return true;
  }
  return false;
}

const SKILL_ALIASES = {
  "react js": "react",
  "react.js": "react",
  "reactjs": "react",
  "node js": "node",
  "node.js": "node",
  "nodejs": "node",
  "vue js": "vue",
  "vue.js": "vue",
  "vuejs": "vue",
  "next js": "next js",
  "next.js": "next js",
  "nextjs": "next js",
  "express js": "express",
  "express.js": "express",
  "expressjs": "express",
  "js": "javascript",
  "javascript es6+": "javascript",
  "javascript es6": "javascript",
  "ts": "typescript",
  "postgres": "postgresql",
  "mongo": "mongodb",
  "aws cloud": "aws",
  "amazon web services": "aws",
};

function normalizeSkillName(name) {
  const norm = normalizeText(name);
  return SKILL_ALIASES[norm] || norm;
}

function isJunkProjectTitle(title) {
  const trimmed = title.trim();
  if (!trimmed || trimmed.length < 3) return true;
  if (/^[•\-\*–—â€¢▪◦✓]/.test(trimmed)) return true;
  if (/^[a-zA-Z]+\.$/.test(trimmed)) return true;
  if (/^(?:github\s*[:-]|https?:\/\/|www\.)/i.test(trimmed)) return true;
  if (/^[a-z]/.test(trimmed)) return true;
  return false;
}

function isJunkExperience(title, company) {
  const t = title.trim();
  const c = company.trim();
  if (/^[•\-\*–—â€¢▪◦✓]/.test(t) || /^[•\-\*–—â€¢▪◦✓]/.test(c)) return true;
  if (/^(?:reducing|building|engineering|developing|leading|collaborating|managing)\b/i.test(c)) return true;
  return false;
}

async function deduplicateAll() {
  console.log("=== STARTING PASSPORT DEDUPLICATION ACROSS ALL USERS ===");
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });

  let grandTotal = 0;

  for (const user of users) {
    const userId = user.id;

    // 1. Educations
    const educations = await prisma.educationRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const eduSeen = [];
    const eduIdsToDelete = [];

    for (const edu of educations) {
      const normInst = normalizeText(edu.institution);
      const normDeg = normalizeText(edu.degree || edu.level);

      const duplicate = eduSeen.find((seen) => {
        const instMatches = isFuzzyMatch(seen.normInst, normInst);
        const degMatches = isFuzzyMatch(seen.normDeg, normDeg);
        const yearMatches = seen.startYear && edu.startYear && seen.startYear === edu.startYear;
        return instMatches && (degMatches || yearMatches);
      });

      if (duplicate) {
        eduIdsToDelete.push(edu.id);
      } else {
        eduSeen.push({ id: edu.id, normInst, normDeg, startYear: edu.startYear });
      }
    }
    if (eduIdsToDelete.length > 0) {
      await prisma.educationRecord.deleteMany({ where: { id: { in: eduIdsToDelete } } });
    }

    // 2. Experiences
    const experiences = await prisma.studentExperience.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const expSeen = [];
    const expIdsToDelete = [];

    for (const exp of experiences) {
      if (isJunkExperience(exp.jobTitle, exp.companyName)) {
        expIdsToDelete.push(exp.id);
        continue;
      }

      const normComp = normalizeText(exp.companyName);
      const normTitle = normalizeText(exp.jobTitle);

      const duplicate = expSeen.find((seen) => {
        const compMatches = isFuzzyMatch(seen.normComp, normComp);
        const titleMatches = isFuzzyMatch(seen.normTitle, normTitle);
        return compMatches && titleMatches;
      });

      if (duplicate) {
        expIdsToDelete.push(exp.id);
      } else {
        expSeen.push({ id: exp.id, normComp, normTitle });
      }
    }
    if (expIdsToDelete.length > 0) {
      await prisma.studentExperience.deleteMany({ where: { id: { in: expIdsToDelete } } });
    }

    // 3. Projects
    const projects = await prisma.studentProject.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const projSeen = [];
    const projIdsToDelete = [];

    for (const proj of projects) {
      if (isJunkProjectTitle(proj.title)) {
        projIdsToDelete.push(proj.id);
        continue;
      }

      const normTitle = normalizeText(proj.title);
      const duplicate = projSeen.find((seen) => isFuzzyMatch(seen.normTitle, normTitle));
      if (duplicate) {
        projIdsToDelete.push(proj.id);
      } else {
        projSeen.push({ id: proj.id, normTitle });
      }
    }
    if (projIdsToDelete.length > 0) {
      await prisma.studentProject.deleteMany({ where: { id: { in: projIdsToDelete } } });
    }

    // 4. Skills
    const skills = await prisma.studentSkill.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const skillSeen = [];
    const skillIdsToDelete = [];

    for (const skill of skills) {
      const normName = normalizeSkillName(skill.name);
      const duplicate = skillSeen.find((seen) => seen.normName === normName);
      if (duplicate) {
        skillIdsToDelete.push(skill.id);
      } else {
        skillSeen.push({ id: skill.id, normName });
      }
    }
    if (skillIdsToDelete.length > 0) {
      await prisma.studentSkill.deleteMany({ where: { id: { in: skillIdsToDelete } } });
    }

    // 5. Certifications
    const certs = await prisma.certification.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const certSeen = [];
    const certIdsToDelete = [];

    for (const cert of certs) {
      const normTitle = normalizeText(cert.title);
      const normOrg = normalizeText(cert.issuingOrganization);

      const duplicate = certSeen.find((seen) => {
        const titleMatches = isFuzzyMatch(seen.normTitle, normTitle);
        const orgMatches = !normOrg || !seen.normOrg || isFuzzyMatch(seen.normOrg, normOrg);
        return titleMatches && orgMatches;
      });

      if (duplicate) {
        certIdsToDelete.push(cert.id);
      } else {
        certSeen.push({ id: cert.id, normTitle, normOrg });
      }
    }
    if (certIdsToDelete.length > 0) {
      await prisma.certification.deleteMany({ where: { id: { in: certIdsToDelete } } });
    }

    const totalUserRemoved =
      eduIdsToDelete.length +
      expIdsToDelete.length +
      projIdsToDelete.length +
      skillIdsToDelete.length +
      certIdsToDelete.length;

    if (totalUserRemoved > 0) {
      console.log(
        `User ${user.name} (${user.email}): Removed ${totalUserRemoved} duplicates (Edu: ${eduIdsToDelete.length}, Exp: ${expIdsToDelete.length}, Proj: ${projIdsToDelete.length}, Skills: ${skillIdsToDelete.length}, Certs: ${certIdsToDelete.length})`
      );
      grandTotal += totalUserRemoved;
    }
  }

  console.log(`\n🎉 DEDUPLICATION COMPLETE: Cleaned up a total of ${grandTotal} duplicate records!`);
  await prisma.$disconnect();
}

deduplicateAll();
