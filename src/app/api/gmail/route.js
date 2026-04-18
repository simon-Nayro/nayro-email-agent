import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  return Response.json({ messages: [] });
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { to, subject, body } = await req.json();

    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2.setCredentials({ access_token: session?.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2 });
    const message = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\r\n");
    const encoded = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encoded },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Gmail error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}