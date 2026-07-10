import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

// Default settings if no database record exists
const DEFAULT_SETTINGS = {
  // General
  websiteName: "Earner",
  websiteLogo: "",
  favicon: "",
  supportEmail: "support@earner.com",
  supportPhone: "",
  defaultCurrency: "USD",
  defaultTimezone: "UTC",
  maintenanceMode: false,
  
  // Authentication
  enableGoogleLogin: true,
  enableLinkedinLogin: false,
  requireEmailVerification: true,
  allowBuyerRegistration: true,
  allowSellerRegistration: true,
  
  // User Settings
  autoApproveSellers: false,
  requireSellerVerification: true,
  maxGigsPerSeller: 10,
  defaultUserRole: "BUYER",
  
  // Gig Settings
  autoApproveGigs: true,
  minGigPrice: 5,
  maxGigPrice: 10000,
  maxImagesPerGig: 5,
  maxVideoSize: 50, // MB
  
  // Payment & Commission
  platformCommission: 20, // 20%
  minWithdrawalAmount: 50,
  enableWithdrawals: true,
  paymentMode: "Test", // Test or Live
  
  // Notifications
  emailNotifications: true,
  adminNotifications: true,
  buyerNotifications: true,
  sellerNotifications: true,
  
  // Security
  enableRecaptcha: false,
  maxLoginAttempts: 5,
  sessionTimeout: 60, // Minutes
  blockSuspendedUsers: true
};

async function getSettings() {
  try {
    const record = await prisma.platformSettings.findUnique({
      where: { id: "global" }
    });
    if (record && record.data) {
      return { ...DEFAULT_SETTINGS, ...(record.data as object) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: any) {
  try {
    await prisma.platformSettings.upsert({
      where: { id: "global" },
      update: { data: settings },
      create: { id: "global", data: settings }
    });
  } catch (error) {
    console.error("Failed to save settings to DB:", error);
    throw new Error("Failed to save settings");
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    if (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await req.json();
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...body };
    
    await saveSettings(newSettings);
    
    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
