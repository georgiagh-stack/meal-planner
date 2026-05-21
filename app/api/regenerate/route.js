import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const prompt = `You are a meal planning assistant. Generate 5 weeknight dinner meals for 2 people (with leftovers).

Requirements:
- High protein (30g+ per serving)
- Under 30 minutes to cook (except traybakes which can be 35 min)
- Simple, accessible ingredients available at a UK supermarket
- Varied cuisines across the week
- No meal should repeat from a common rotation — be creative

Ingredient overlap (important):
- Actively choose meals that share fresh ingredients across the week. For example, if two meals can both use cherry tomatoes, spinach, or the same protein, prefer those combinations.
- Aim for at least 3–4 fresh ingredients to appear in more than one meal.
- Think of it as shopping once and using everything up — reduce waste, reduce the trolley size.
- Stock cupboard staples (salt, pepper, olive oil, honey, soy sauce) are always available and do not count toward unique ingredients — include them freely in recipes but don't worry about repeating them.

Return ONLY valid JSON in this exact structure, no other text:
{
  "weekOf": "a week date range string like '25–29 May 2026'",
  "meals": [
    {
      "id": 1,
      "day": "Monday",
      "name": "Meal Name",
      "time": "25 min",
      "emoji": "🍗",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "method": ["Step 1 description.", "Step 2 description."],
      "tip": "A useful chef's tip."
    }
  ]
}

Days must be exactly: Monday, Tuesday, Wednesday, Thursday, Friday.
Each meal needs 8–12 ingredients and 5–7 method steps.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    // Strip any markdown code fences if Claude wraps it
    const json = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const data = JSON.parse(json);

    return Response.json(data);
  } catch (err) {
    console.error("Regenerate error:", err);
    return Response.json(
      { error: "Failed to generate meals. Check your API key and try again." },
      { status: 500 }
    );
  }
}
