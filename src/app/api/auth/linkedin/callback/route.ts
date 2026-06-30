import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Handle user cancelling or other OAuth errors
  if (error) {
    return new NextResponse(
      renderPopupCloserHTML({ error: errorDescription || error }),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new NextResponse("No authorization code provided.", { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return new NextResponse(
      renderPopupCloserHTML({ error: "LinkedIn credentials missing in environment variables." }),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const redirectUri = `${url.origin}/api/auth/linkedin/callback`;

  try {
    // 1. Exchange auth code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || "Failed to fetch access token");
    }

    // 2. Fetch User Info using the new OIDC endpoint
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      throw new Error(profileData.message || "Failed to fetch profile data");
    }

    // Return HTML that posts the data back to the opener window and closes itself
    return new NextResponse(
      renderPopupCloserHTML({
        success: true,
        data: {
          name: profileData.name,
          firstName: profileData.given_name,
          lastName: profileData.family_name,
          email: profileData.email,
          picture: profileData.picture,
        }
      }),
      { headers: { "Content-Type": "text/html" } }
    );

  } catch (err: any) {
    console.error("LinkedIn OAuth Error:", err);
    return new NextResponse(
      renderPopupCloserHTML({ error: err.message }),
      { headers: { "Content-Type": "text/html" } }
    );
  }
}

// Helper to render the HTML that communicates back to the main window
function renderPopupCloserHTML(payload: any) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>LinkedIn Import</title>
      </head>
      <body>
        <p>Importing profile...</p>
        <script>
          // Send the payload back to the main window
          if (window.opener) {
            window.opener.postMessage(
              { type: 'LINKEDIN_IMPORT', payload: ${JSON.stringify(payload)} },
              window.location.origin
            );
          }
          // Close the popup
          window.close();
        </script>
      </body>
    </html>
  `;
}
