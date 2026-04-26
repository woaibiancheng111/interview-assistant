import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, createUnauthorizedResponse } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return createUnauthorizedResponse();
  }

  return NextResponse.json({
    success: true,
    data: user,
  });
}
