// scripts/test-crm-endpoint.js
// Submits a test counselling lead to the local CRM mock endpoint

const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

async function main() {
  const prisma = new PrismaClient();

  // Find a test user (e.g., Rohit Sharma from Step 7)
  let user = await prisma.user.findFirst({
    where: { email: "rohit.sharma.test@aeterna.education" },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.findFirst({
      include: { profile: true },
    });
  }

  if (!user) {
    console.error("No user found in database to associate counselling lead with.");
    process.exit(1);
  }

  console.log(`👤 Using student: ${user.name} (${user.email})`);

  // 1. Create a local CrmLead in CareerEdge database
  const lead = await prisma.crmLead.create({
    data: {
      userId: user.id,
      leadType: "STUDENT_COUNSELLING",
      name: user.name,
      email: user.email,
      mobile: user.mobile || "9876543210",
      city: "Bangalore",
      state: "Karnataka",
      educationLevel: user.profile?.educationLevel || "B.E. / B.Tech",
      institution: user.profile?.institution || "RV College of Engineering",
      course: user.profile?.course || "Computer Science and Engineering",
      careerInterest: "Software & IT",
      counsellorConsent: true,
      syncStatus: "PENDING",
      syncAttempts: 0,
    },
  });

  console.log(`📝 Created local lead record in CareerEdge: ${lead.id} (Status: ${lead.syncStatus})`);

  // 2. Prepare outbound contract payload
  const idempotencyKey = crypto.randomUUID();
  const payload = {
    eventId: `evt_${crypto.randomBytes(8).toString("hex")}`,
    eventType: "lead.counselling.requested",
    timestamp: new Date().toISOString(),
    idempotencyKey,
    data: {
      leadId: lead.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || "9876543210",
      city: "Bangalore",
      state: "Karnataka",
      educationLevel: user.profile?.educationLevel || "B.E. / B.Tech",
      institution: user.profile?.institution || "RV College of Engineering",
      course: user.profile?.course || "Computer Science and Engineering",
      careerInterest: "Software & IT",
      counsellorConsent: true,
    },
  };

  const payloadString = JSON.stringify(payload);
  const secret = process.env.AETERNA_ONE_CRM_SECRET || "dev-crm-webhook-secret-key";
  const signature = "sha256=" + crypto.createHmac("sha256", secret).update(payloadString).digest("hex");

  const mockEndpointUrl = "http://localhost:3000/api/dev/mock-crm-webhook";
  console.log(`🚀 Dispatching lead to local mock endpoint: ${mockEndpointUrl}...`);

  try {
    const response = await fetch(mockEndpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-aeterna-signature": signature,
        "x-idempotency-key": idempotencyKey,
        Authorization: "Bearer dev-mock-key",
      },
      body: payloadString,
    });

    const responseText = await response.text();
    let responseJson = {};
    try {
      responseJson = JSON.parse(responseText);
    } catch {}

    console.log(`HTTP Status: ${response.status}`);
    console.log("Mock Response:", responseJson);

    // 3. Log attempt and update status to DEV_MOCK_SYNCED
    await prisma.crmSyncLog.create({
      data: {
        leadId: lead.id,
        endpointUrl: mockEndpointUrl,
        requestData: payloadString,
        statusCode: response.status,
        responseData: responseText,
        isSuccess: response.ok,
      },
    });

    if (response.ok) {
      // Important: Mock endpoint delivery is recorded as DEV_MOCK_SYNCED, NEVER as real SYNCED
      const updatedLead = await prisma.crmLead.update({
        where: { id: lead.id },
        data: {
          syncStatus: "DEV_MOCK_SYNCED",
          syncAttempts: 1,
          lastSyncAttempt: new Date(),
          externalCrmId: responseJson.externalCrmId,
        },
      });

      console.log(`\n🎯 Final Lead Sync Status in Database: ${updatedLead.syncStatus}`);
      console.log(`🆔 External CRM ID (Mock): ${updatedLead.externalCrmId}`);
      console.log("✅ Verified: Status is DEV_MOCK_SYNCED (not real SYNCED).");
    } else {
      console.error("❌ Mock endpoint returned non-200 status:", response.status);
    }
  } catch (err) {
    console.error("❌ Network error connecting to mock endpoint:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
