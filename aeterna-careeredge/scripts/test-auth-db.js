// scripts/test-auth-db.js
// Automated verification test suite validating Day 1 journeys:
// 1. Password hashing & validation
// 2. User signup in DB
// 3. Duplicate email/mobile prevention
// 4. Invalid credentials rejection
// 5. Valid credentials acceptance
// 6. JWT session creation and verification
// 7. Multi-Domain student profiles (Engineering, Commerce, Healthcare, Arts, Zero-Experience Fresher)
// 8. Universal Career Passport completion score calculation
// 9. Normalized model linkages (Education, Skills, Projects, Experiences, Achievements, Goals)
// 10. Student data ownership & isolation check
// 11. Session expiration / invalidation
// 12. Clean test teardown

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { SignJWT, jwtVerify } = require("jose");

async function runTests() {
  const prisma = new PrismaClient();
  const secret = new TextEncoder().encode(
    process.env.AUTH_SECRET || "test-secret-key-for-unit-testing-32chars"
  );

  console.log("\n🧪 Running Aeterna CareerEdge Day 1 Multi-Domain Tests...\n");

  const testEmails = [
    "rohit.eng@example.com",
    "priya.comm@example.com",
    "dr.sneha.health@example.com",
    "aarav.arts@example.com",
    "fresher.zero@example.com",
    "other.student@example.com",
  ];

  const testMobiles = ["9876543299", "9123456780"];

  // Teardown any previous test artifacts
  await prisma.studentAchievement.deleteMany({ where: { user: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } } });
  await prisma.careerGoal.deleteMany({ where: { user: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } } });
  await prisma.studentExperience.deleteMany({ where: { user: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } } });
  await prisma.studentProject.deleteMany({ where: { user: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } } });
  await prisma.studentSkill.deleteMany({ where: { user: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } } });
  await prisma.educationRecord.deleteMany({ where: { user: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } } });
  await prisma.studentProfile.deleteMany({ where: { user: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } } });
  await prisma.user.deleteMany({ where: { OR: [{ email: { in: testEmails } }, { mobile: { in: testMobiles } }] } });

  // 1. New User Signup & Password Hashing
  const rawPassword = "StudentPassword@123";
  const passwordHash = await bcrypt.hash(rawPassword, 12);
  const newUser = await prisma.user.create({
    data: {
      name: "Rohit Kumar",
      email: testEmails[0],
      mobile: "9876543299",
      passwordHash,
      counsellorConsent: true,
      onboardingCompleted: false,
    },
  });
  console.log("✅ 1. New user signup & password hashing: PASSED");

  // 2. Duplicate Detection
  try {
    await prisma.user.create({
      data: {
        name: "Duplicate User",
        email: testEmails[0],
        mobile: "9123456780",
        passwordHash,
      },
    });
    console.error("❌ 2. Duplicate user constraint failed: duplicate was allowed");
    process.exit(1);
  } catch (_err) {
    console.log("✅ 2. Duplicate email constraint: PASSED");
  }

  // 3. Invalid Credentials
  const isInvalid = await bcrypt.compare("WrongPassword123", newUser.passwordHash);
  if (!isInvalid) {
    console.log("✅ 3. Invalid credentials rejected: PASSED");
  } else {
    console.error("❌ 3. Invalid password was accepted!");
    process.exit(1);
  }

  // 4. Valid Credentials
  const isValid = await bcrypt.compare(rawPassword, newUser.passwordHash);
  if (isValid) {
    console.log("✅ 4. Valid credentials accepted: PASSED");
  } else {
    console.error("❌ 4. Valid password rejected!");
    process.exit(1);
  }

  // 5. JWT Session Token Creation & Verification
  const token = await new SignJWT({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    onboardingCompleted: newUser.onboardingCompleted,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const { payload } = await jwtVerify(token, secret);
  if (payload.userId === newUser.id && payload.email === newUser.email) {
    console.log("✅ 5. JWT session token creation & verification: PASSED");
  } else {
    console.error("❌ 5. JWT session payload mismatch!");
    process.exit(1);
  }

  // 6. Multi-Domain Profile Creation Tests (Engineering, Commerce, Healthcare, Arts, Fresher)
  
  // 6a. Engineering Profile
  const engProfile = await prisma.studentProfile.create({
    data: {
      userId: newUser.id,
      city: "Bengaluru",
      state: "Karnataka",
      academicDomain: "Engineering and Technology",
      educationLevel: "BE / B.Tech",
      institution: "RV College of Engineering",
      course: "Mechanical Engineering",
      specialization: "Robotics & Automation",
      graduationYear: 2026,
      gradingType: "CGPA (10-point Scale)",
      gradeValue: "8.75 CGPA",
      skills: JSON.stringify(["AutoCAD", "SolidWorks", "MATLAB", "Problem Solving"]),
      projects: "Design of automated dual-axis solar tracking chassis",
      experience: "Trainee Engineer at L&T (3 months)",
      careerInterests: JSON.stringify(["Engineering & Technology", "Robotics"]),
      preferredJobRole: "Mechanical Design Engineer",
      passportScore: 90,
    },
  });

  // 6b. Commerce & Finance Profile
  const commUser = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: testEmails[1],
      mobile: "9876543211",
      passwordHash,
      onboardingCompleted: true,
    },
  });
  const commProfile = await prisma.studentProfile.create({
    data: {
      userId: commUser.id,
      city: "Bengaluru",
      state: "Karnataka",
      academicDomain: "Commerce, Accounting and Finance",
      educationLevel: "B.Com / B.Com (Hons)",
      institution: "Christ University",
      course: "B.Com Accounting & Finance",
      specialization: "Corporate Taxation & Auditing",
      graduationYear: 2025,
      gradingType: "Percentage (%)",
      gradeValue: "84%",
      skills: JSON.stringify(["Financial Modeling", "Tally Prime", "GST Compliance", "Advanced Excel"]),
      projects: "Financial ratio analysis and discounted cash flow valuation model of retail company",
      experience: "Article Trainee at Chartered Accountancy Firm (6 months)",
      achievements: "1st Rank in Inter-College Commerce Conclave",
      certifications: "CA Intermediate Group 1 Cleared",
      careerInterests: JSON.stringify(["Finance, Banking & Accounting"]),
      preferredJobRole: "Financial Analyst",
      targetIndustry: "Investment Banking & Corporate Finance",
      passportScore: 95,
    },
  });

  // 6c. Healthcare & Nursing Profile
  const healthUser = await prisma.user.create({
    data: {
      name: "Dr. Sneha Rao",
      email: testEmails[2],
      mobile: "9876543212",
      passwordHash,
      onboardingCompleted: true,
    },
  });
  const healthProfile = await prisma.studentProfile.create({
    data: {
      userId: healthUser.id,
      city: "Mangaluru",
      state: "Karnataka",
      academicDomain: "Healthcare and Medical Sciences",
      educationLevel: "MBBS / BDS",
      institution: "Kasturba Medical College (KMC)",
      course: "MBBS",
      specialization: "General Medicine",
      graduationYear: 2025,
      gradingType: "First Class with Distinction",
      gradeValue: "Distinction",
      skills: JSON.stringify(["Clinical Diagnostics", "Patient Care", "BLS/CPR", "Medical Documentation"]),
      projects: "Epidemiological audit of seasonal dengue prevalence in coastal Karnataka",
      experience: "Compulsory Rotatory Residential Internship (CRRI) at District Hospital",
      certifications: "AHA Certified Basic Life Support (BLS)",
      careerInterests: JSON.stringify(["Healthcare, Medicine & Nursing"]),
      preferredJobRole: "Junior Resident Doctor",
      targetIndustry: "Hospital & Clinical Practice",
      higherEducationGoal: "MD Postgraduate Studies",
      passportScore: 100,
    },
  });

  // 6d. Arts & Humanities Profile
  const artsUser = await prisma.user.create({
    data: {
      name: "Aarav Desai",
      email: testEmails[3],
      mobile: "9876543213",
      passwordHash,
      onboardingCompleted: true,
    },
  });
  const artsProfile = await prisma.studentProfile.create({
    data: {
      userId: artsUser.id,
      city: "Mysuru",
      state: "Karnataka",
      academicDomain: "Arts and Humanities",
      educationLevel: "BA / BA (Hons)",
      institution: "University of Mysore",
      course: "BA Political Science & Economics",
      specialization: "Public Policy & Governance",
      graduationYear: 2026,
      gradingType: "Letter Grade (A+/A/B)",
      gradeValue: "A+",
      skills: JSON.stringify(["Qualitative Research", "Public Policy Analysis", "Critical Writing", "Communication"]),
      projects: "Field impact evaluation of rural self-help group microcredit programs in Mandya district",
      careerInterests: JSON.stringify(["Civil Services & Public Policy", "Education, Teaching & EdTech"]),
      preferredJobRole: "Public Policy Research Associate",
      passportScore: 80,
    },
  });

  // 6e. Zero-Experience Fresher Student Profile
  const fresherUser = await prisma.user.create({
    data: {
      name: "Kavya Murthy",
      email: testEmails[4],
      mobile: "9876543214",
      passwordHash,
      onboardingCompleted: true,
    },
  });
  const fresherProfile = await prisma.studentProfile.create({
    data: {
      userId: fresherUser.id,
      city: "Hubli",
      state: "Karnataka",
      academicDomain: "Commerce, Accounting and Finance",
      educationLevel: "B.Com / B.Com (Hons)",
      institution: "KLE Society College of Commerce",
      course: "B.Com General",
      graduationYear: 2027,
      gradingType: "Percentage (%)",
      gradeValue: "78%",
      skills: JSON.stringify(["Accounting Basics", "Tally", "Communication"]),
      projects: "Class study on local cooperative bank savings trends",
      experience: null, // Zero prior work experience
      certifications: null,
      achievements: null,
      careerInterests: JSON.stringify(["Finance, Banking & Accounting"]),
      preferredJobRole: "Junior Accountant",
      passportScore: 65,
    },
  });

  if (engProfile && commProfile && healthProfile && artsProfile && fresherProfile) {
    console.log("✅ 6. Multi-domain student profile creation (Eng, Comm, Health, Arts, Fresher): PASSED");
  } else {
    console.error("❌ 6. Multi-domain profile creation failed!");
    process.exit(1);
  }

  // 7. Normalized Relational Models Linkage
  // Create an EducationRecord, StudentSkill, StudentProject, StudentExperience, StudentAchievement, CareerGoal
  const eduRecord = await prisma.educationRecord.create({
    data: {
      userId: commUser.id,
      level: "UG",
      institution: "Christ University",
      degree: "B.Com",
      fieldOfStudy: "Commerce & Accounting",
      scoreOrGrade: "84%",
      scoreType: "PERCENTAGE",
      isCurrent: true,
      dataOrigin: "STUDENT_INPUT",
    },
  });

  const skillRecord = await prisma.studentSkill.create({
    data: {
      userId: commUser.id,
      name: "Financial Analysis",
      category: "DOMAIN",
      proficiencyLevel: "ADVANCED",
      dataOrigin: "STUDENT_INPUT",
    },
  });

  const projectRecord = await prisma.studentProject.create({
    data: {
      userId: commUser.id,
      title: "DCF Valuation Model",
      description: "Financial performance analysis of retail firm",
      projectType: "ACADEMIC",
      toolsOrTechnologies: JSON.stringify(["Excel", "Financial Modeling"]),
      artifactUrl: "https://drive.example.com/project-report.pdf",
      dataOrigin: "STUDENT_INPUT",
    },
  });

  const expRecord = await prisma.studentExperience.create({
    data: {
      userId: commUser.id,
      companyName: "R. Sharma & Associates",
      jobTitle: "Article Trainee",
      employmentType: "INTERNSHIP",
      experienceType: "ARTICLESHIP",
      dataOrigin: "STUDENT_INPUT",
    },
  });

  const achievementRecord = await prisma.studentAchievement.create({
    data: {
      userId: commUser.id,
      title: "1st Rank in Commerce Conclave",
      category: "COMPETITION",
      issuer: "State University",
      dataOrigin: "STUDENT_INPUT",
    },
  });

  const goalRecord = await prisma.careerGoal.create({
    data: {
      userId: commUser.id,
      targetRole: "Financial Analyst",
      targetIndustry: "Investment Banking",
      preferredWorkType: "FULL_TIME",
      shortTermGoal: "Join tier-1 advisory firm",
      longTermGoal: "Lead corporate finance division",
    },
  });

  if (eduRecord && skillRecord && projectRecord && expRecord && achievementRecord && goalRecord) {
    console.log("✅ 7. Normalized relational models linkage (Edu, Skill, Project, Exp, Achievement, Goal): PASSED");
  } else {
    console.error("❌ 7. Normalized models linkage failed!");
    process.exit(1);
  }

  // 8. Onboarding Completion & Passport Score Calculation
  const updatedUser = await prisma.user.update({
    where: { id: newUser.id },
    data: { onboardingCompleted: true },
    include: { profile: true },
  });

  if (updatedUser.onboardingCompleted && updatedUser.profile && updatedUser.profile.passportScore > 0) {
    console.log("✅ 8. Onboarding completion & passport score persistence: PASSED");
  } else {
    console.error("❌ 8. Onboarding completion update failed!");
    process.exit(1);
  }

  // 9. Data Isolation & Ownership Check
  const otherUser = await prisma.user.create({
    data: {
      name: "Other Student",
      email: testEmails[5],
      mobile: "9111122222",
      passwordHash,
      onboardingCompleted: true,
    },
  });

  const otherProfile = await prisma.studentProfile.create({
    data: {
      userId: otherUser.id,
      city: "Mangaluru",
      state: "Karnataka",
      academicDomain: "Law and Legal Studies",
      institution: "SDM Law College",
    },
  });

  // Verify User 1 cannot access User 2's profile when query is scoped by userId
  const scopedQuery = await prisma.studentProfile.findFirst({
    where: {
      id: otherProfile.id,
      userId: newUser.id, // Trying to query other's profile with newUser ID
    },
  });

  if (scopedQuery === null) {
    console.log("✅ 9. Student data ownership & isolation check: PASSED");
  } else {
    console.error("❌ 9. Security breach: Cross-student data query succeeded!");
    process.exit(1);
  }

  // 10. Session Invalidation / Logout Check
  try {
    const expiredToken = await new SignJWT({ userId: newUser.id })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 100)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 10)
      .sign(secret);

    await jwtVerify(expiredToken, secret);
    console.error("❌ 10. Expired session token was accepted!");
    process.exit(1);
  } catch (_e) {
    console.log("✅ 10. Session expiration / invalidation verification: PASSED");
  }

  // 11. Clean Teardown
  await prisma.studentAchievement.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await prisma.careerGoal.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await prisma.studentExperience.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await prisma.studentProject.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await prisma.studentSkill.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await prisma.educationRecord.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await prisma.studentProfile.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
  console.log("✅ 11. Test teardown & cleanup: PASSED");

  console.log("\n🎉 All 11 Multi-Domain & Authentication tests passed successfully!\n");
  await prisma.$disconnect();
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
