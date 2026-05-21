export async function POST(request) {
  const botUrl = process.env.RAILWAY_BOT_URL;

  if (!botUrl) {
    return Response.json(
      { error: "RAILWAY_BOT_URL is not configured. Deploy the sainsburys-bot to Railway first." },
      { status: 503 }
    );
  }

  const body = await request.json();

  try {
    const res = await fetch(`${botUrl}/shop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BOT_SECRET && { "x-bot-secret": process.env.BOT_SECRET }),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ error: `Could not reach bot: ${err.message}` }, { status: 502 });
  }
}
