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

Ingredient overlap (this is a hard requirement, not a suggestion):
- Before picking meals, choose 2–3 "anchor" ingredients that will appear in multiple meals. Good anchors: a protein used twice (e.g., chicken thighs on Monday and Wednesday), a vegetable used in 3 meals (e.g., cherry tomatoes, spinach, or red onion), or a fresh herb used across several dishes (e.g., coriander, parsley).
- Every anchor ingredient MUST appear in at least 2 of the 5 meals.
- Do NOT pick 5 meals with completely different proteins — at least one protein should repeat across 2 meals.
- Think of it as one supermarket shop where nothing goes to waste.
- Stock cupboard staples (salt, pepper, olive oil, honey, soy sauce) are always available — include them freely but they don't count as anchors.

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
