export async function GET() {
  return Response.json({ messages: [] });
}

export async function POST(req) {
  try {
    const { to, subject, body } = await req.json();
    console.log("EMAIL SIMULÉ vers:", to, "Sujet:", subject);
    return Response.json({ success: true, simulated: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}