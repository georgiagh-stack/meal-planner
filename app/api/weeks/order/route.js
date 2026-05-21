import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { weekId } = await request.json();
  if (!weekId) return Response.json({ error: "weekId required" }, { status: 400 });

  // Mark this week as ordered
  const { error: updateError } = await supabase
    .from("weeks")
    .update({ status: "ordered" })
    .eq("id", weekId);

  if (updateError) return Response.json({ error: updateError.message }, { status: 500 });

  // Delete any older ordered weeks so we never accumulate more than 2 weeks
  const { data: allOrdered } = await supabase
    .from("weeks")
    .select("id, created_at")
    .eq("status", "ordered")
    .order("created_at", { ascending: false });

  if (allOrdered && allOrdered.length > 1) {
    const toDelete = allOrdered.slice(1).map((w) => w.id);
    await supabase.from("weeks").delete().in("id", toDelete);
  }

  // Create a fresh planning week for next week
  const { data: newWeek, error: insertError } = await supabase
    .from("weeks")
    .insert({ week_of: "", meals: [], status: "planning" })
    .select()
    .single();

  if (insertError) return Response.json({ error: insertError.message }, { status: 500 });

  return Response.json({ newWeek });
}
