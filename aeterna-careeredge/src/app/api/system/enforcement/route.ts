import { NextResponse } from "next/server";
import { getEntitlementEnforcementMode } from "@/lib/monetization/entitlements";

export async function GET() {
  const mode = getEntitlementEnforcementMode();
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || "development";
  return NextResponse.json({
    appEnv,
    enforcement: mode,
    isTestingMode: mode === "off",
  });
}
