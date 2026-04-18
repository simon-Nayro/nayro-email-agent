import { google } from "googleapis";

export async function GET() {
  return Response.json({ messages: [] });
}

export async function POST(req) {
  try {
    const { to, subject, body, accessToken } = await req.json();

    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2 });
    const message = [`To: ${to}`, `Subject: ${subject}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "", body].join("\r\n");
    const encoded = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encoded },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Gmail error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}