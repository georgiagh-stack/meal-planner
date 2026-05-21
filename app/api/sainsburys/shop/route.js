import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  const { items } = await request.json();

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "items array required" }, { status: 400 });
  }

  const initialItems = items.map((item) => ({ ...item, status: "pending" }));

  const { data, error } = await supabase
    .from("shop_runs")
    .insert({ items: initialItems, run_status: "running" })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ runId: data.id });
}
