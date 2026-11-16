// src/lib/passport/service.ts
// Central service for accessing and maintaining the Universal Student Career Passport
// Single Source of Student Information across CareerEdge (Multi-Domain)

import { db } from "@/lib/db";
import type { StudentPassportSnapshot, DataOrigin } from "@/types/passport";

/**
 * Retrieve the authenticated student's central Career Passport.
 * Every student-facing feature must call this rather than repeatedly asking
 * the student for previously entered data.
 */
export async function getStudentPassport(
  userId: string
): Promise<StudentPassportSnapshot | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      educations: true,
      skills: true,
      projects: true,
      experiences: true,
      achievements: true,
    },
  });

  if (!user || !user.profile) {
    return null;
  }

  // Parse JSON summary fields safely
  const parseJsonArray = (val: string | null): string[] => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    passportScore: user.profile.passportScore,
    profile: {
      city: user.profile.city,
      state: user.profile.state,
      academicDomain: user.profile.academicDomain,
      specialization: user.profile.specialization,
      educationLevel: user.profile.educationLevel,
      institution: user.profile.institution,
      course: user.profile.course,
      graduationYear: user.profile.graduationYear,
      gradingType: user.profile.gradingType,
      gradeValue: user.profile.gradeValue,
      preferredJobRole: user.profile.preferredJobRole,
      targetIndustry: user.profile.targetIndustry,
      higherEducationGoal: user.profile.higherEducationGoal,
      shortTermGoal: user.profile.shortTermGoal,
      longTermGoal: user.profile.longTermGoal,
      careerInterests: parseJsonArray(user.profile.careerInterests),
      studyAbroadCountries: parseJsonArray(user.profile.studyAbroadCountries),
      achievements: user.profile.achievements,
      certifications: user.profile.certifications,
    },
    normalized: {
      educations: user.educations.map((e) => ({
        id: e.id,
        level: e.level,
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        score: e.scoreOrGrade,
        scoreType: e.scoreType,
        origin: e.dataOrigin as DataOrigin,
        isVerified: e.isVerified,
      })),
      skills: user.skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiencyLevel: s.proficiencyLevel,
        origin: s.dataOrigin as DataOrigin,
        isVerified: s.isVerified,
      })),
      projects: user.projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        role: p.role,
        projectType: p.projectType,
        toolsOrTechnologies: parseJsonArray(p.toolsOrTechnologies || p.techStack),
        artifactUrl: p.artifactUrl || p.projectUrl || p.repositoryUrl,
        origin: p.dataOrigin as DataOrigin,
        isVerified: p.isVerified,
      })),
      experiences: user.experiences.map((exp) => ({
        id: exp.id,
        company: exp.companyName,
        role: exp.jobTitle,
        employmentType: exp.employmentType,
        experienceType: exp.experienceType,
        origin: exp.dataOrigin as DataOrigin,
        isVerified: exp.isVerified,
      })),
      achievements: user.achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        issuer: a.issuer,
        origin: a.dataOrigin as DataOrigin,
        isVerified: a.isVerified,
      })),
    },
  };
}
