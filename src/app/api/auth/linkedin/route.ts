import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  
  if (!clientId) {
    return new NextResponse("LINKEDIN_CLIENT_ID is not set in environment variables.", { status: 500 });
  }

  // Get the base URL from the request to build the redirect URI
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/linkedin/callback`;

  // Standard LinkedIn OAuth 2.0 parameters for Sign In with LinkedIn
  const scope = "openid profile email";
  
  // Create a random state string to prevent CSRF
  const state = Math.random().toString(36).substring(7);

  const linkedInAuthUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  linkedInAuthUrl.searchParams.append("response_type", "code");
  linkedInAuthUrl.searchParams.append("client_id", clientId);
  linkedInAuthUrl.searchParams.append("redirect_uri", redirectUri);
  linkedInAuthUrl.searchParams.append("state", state);
  linkedInAuthUrl.searchParams.append("scope", scope);

  return NextResponse.redirect(linkedInAuthUrl.toString());
}
