import WeeklyMeals from "@/components/WeeklyMeals";
import { meals, staples, weekOf } from "@/data/meals";

export default function Home() {
  return <WeeklyMeals initialMeals={meals} initialStaples={staples} initialWeekOf={weekOf} />;
}
