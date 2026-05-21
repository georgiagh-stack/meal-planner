import { createClient } from "@supabase/supabase-js";
import WeeklyMeals from "@/components/WeeklyMeals";
import { meals as staticMeals, staples, weekOf as staticWeekOf } from "@/data/meals";

export default async function Home() {
  let planningWeek = { id: null, week_of: staticWeekOf, meals: staticMeals, status: "planning" };
  let orderedWeek = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: weeks } = await supabase
      .from("weeks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2);

    if (weeks && weeks.length > 0) {
      planningWeek = weeks.find((w) => w.status === "planning") || planningWeek;
      orderedWeek = weeks.find((w) => w.status === "ordered") || null;
    } else if (weeks && weeks.length === 0) {
      // First ever load — seed with static meals
      const { data: seeded } = await supabase
        .from("weeks")
        .insert({ week_of: staticWeekOf, meals: staticMeals, status: "planning" })
        .select()
        .single();
      if (seeded) planningWeek = seeded;
    }
  }

  return (
    <WeeklyMeals
      initialPlanningWeek={planningWeek}
      initialOrderedWeek={orderedWeek}
      initialStaples={staples}
    />
  );
}
