export async function GET() {
  return Response.json({ events: [] });
}

export async function POST(req) {
  try {
    const data = await req.json();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}