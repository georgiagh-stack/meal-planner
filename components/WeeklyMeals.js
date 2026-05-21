"use client";
import { useState } from "react";
import { useExtras } from "@/hooks/useExtras";
import ShopPanel from "@/components/ShopPanel";
import WeeklyExtras from "@/components/WeeklyExtras";
import { supabase } from "@/lib/supabase";

const DAY_STYLES = {
  Monday:    { badge: "bg-sky-100 text-sky-700" },
  Tuesday:   { badge: "bg-orange-100 text-orange-700" },
  Wednesday: { badge: "bg-teal-100 text-teal-700" },
  Thursday:  { badge: "bg-violet-100 text-violet-700" },
  Friday:    { badge: "bg-rose-100 text-rose-700" },
};

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1.5 5.5l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="15" y1="5" x2="5" y2="15" />
      <line x1="5" y1="5" x2="15" y2="15" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

// ─── Sainsbury's automation placeholder ───────────────────────────────────────
// TODO: Replace with a real call to /api/sainsburys/add when browser automation
// is wired up. Should return { success: boolean }.
async function addItemToSainsburys(_itemText) {
  await new Promise((resolve) => setTimeout(resolve, 45));
  return { success: true };
}
// ──────────────────────────────────────────────────────────────────────────────

function RecipeModal({ meal, checkedMap, onToggle, onClose }) {
  const styles = DAY_STYLES[meal.day] || { badge: "bg-stone-100 text-stone-600" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-y-auto shadow-2xl animate-slide-up sm:animate-none">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-100 px-6 py-4 flex items-start justify-between">
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
              {meal.day}
            </span>
            <h2 className="text-stone-900 font-bold text-xl mt-2 leading-tight">{meal.name}</h2>
            <p className="text-stone-400 text-sm mt-0.5">{meal.time} · Serves 2 + leftovers</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors ml-4 mt-1 flex-shrink-0 p-1 -mr-1"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-7">
          <section>
            <h3 className="text-stone-900 font-semibold text-base mb-3">Ingredients</h3>
            <ul className="space-y-2.5">
              {meal.ingredients.map((ing, i) => {
                const checked = checkedMap[i] || false;
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 cursor-pointer select-none"
                    onClick={() => onToggle(i)}
                  >
                    <span className={`checkbox-inner mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      checked ? "bg-emerald-500 border-emerald-500" : "border-stone-300 hover:border-emerald-400"
                    }`}>
                      {checked && <CheckIcon />}
                    </span>
                    <span className={`text-sm leading-relaxed ${checked ? "line-through text-stone-400" : "text-stone-700"}`}>
                      {ing}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="text-stone-900 font-semibold text-base mb-3">Method</h3>
            <ol className="space-y-3.5">
              {meal.method.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-stone-700 text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-900 font-semibold text-sm mb-1">Chef's tip</p>
            <p className="text-amber-800 text-sm leading-relaxed">{meal.tip}</p>
          </section>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

export default function WeeklyMeals({ initialMeals, initialStaples, initialWeekOf }) {
  const [meals, setMeals] = useState(initialMeals);
  const [staples] = useState(initialStaples);
  const [weekOf, setWeekOf] = useState(initialWeekOf);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenError, setRegenError] = useState(null);
  const [shopItems, setShopItems] = useState(null);
  const [shopError, setShopError] = useState(null);
  const [shopChannel, setShopChannel] = useState(null);

  const { extras, loading: extrasLoading, configured: extrasConfigured, addExtra, removeExtra } = useExtras();

  const toggleIngredient = (mealId, idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [mealId]: { ...(prev[mealId] || {}), [idx]: !(prev[mealId]?.[idx] || false) },
    }));
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch("/api/regenerate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setMeals(data.meals);
      setWeekOf(data.weekOf);
      setCheckedIngredients({});
      setSelectedMeal(null);
    } catch (err) {
      setRegenError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStartShop = async () => {
    setShopError(null);

    const allItems = [
      ...meals.flatMap((m) =>
        m.ingredients.map((ing) => ({ text: ing, status: "pending", section: m.day }))
      ),
      ...staples.map((s) => ({ text: s, status: "pending", section: "Staples" })),
      ...extras.map((e) => ({ text: e.text, status: "pending", section: "Extras" })),
    ];

    // Show the panel immediately with all items pending
    setShopItems(allItems);

    // Start the run on Railway via our API route
    let runId;
    try {
      const res = await fetch("/api/sainsburys/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: allItems }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to start shop");
      runId = data.runId;
    } catch (err) {
      setShopItems(null);
      setShopError(err.message);
      return;
    }

    // Subscribe to Supabase realtime for this run — items update live as the bot works
    if (!supabase) return;
    const channel = supabase
      .channel(`shop-run-${runId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "shop_runs", filter: `id=eq.${runId}` },
        (payload) => {
          setShopItems(payload.new.items);
          // If the run failed, mark any remaining pending items as errored
          if (payload.new.run_status === "failed") {
            setShopItems((prev) =>
              prev ? prev.map((item) =>
                item.status === "pending" ? { ...item, status: "error" } : item
              ) : null
            );
          }
        }
      )
      .subscribe();

    setShopChannel(channel);
  };

  const handleDismissShop = () => {
    if (shopChannel && supabase) {
      supabase.removeChannel(shopChannel);
      setShopChannel(null);
    }
    setShopItems(null);
    setShopError(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      <header className="bg-emerald-800 text-white px-5 pt-10 pb-8">
        <div className="max-w-xl mx-auto">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-2">
            Week of {weekOf}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">This Week's Meals</h1>
          <p className="text-emerald-300 mt-1.5 text-sm">
            High protein · Under 30 min · Serves 2 + leftovers
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <SparkleIcon />
              {isRegenerating ? "Generating…" : "Regenerate meals"}
            </button>

            <button
              onClick={handleStartShop}
              disabled={!!shopItems}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <CartIcon />
              Start Sainsbury's shop
            </button>
          </div>

          {regenError && (
            <p className="mt-3 text-red-300 text-sm bg-red-900/30 rounded-lg px-3 py-2">
              {regenError}
            </p>
          )}
          {shopError && (
            <p className="mt-3 text-red-300 text-sm bg-red-900/30 rounded-lg px-3 py-2">
              {shopError}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-5 space-y-3">
        {meals.map((meal) => {
          const styles = DAY_STYLES[meal.day] || { badge: "bg-stone-100 text-stone-600" };
          return (
            <button
              key={meal.id}
              onClick={() => setSelectedMeal(meal)}
              className="w-full text-left bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
                      {meal.day}
                    </span>
                    <span className="text-xs text-stone-400">⏱ {meal.time}</span>
                  </div>
                  <h2 className="text-stone-900 font-semibold text-[15px] leading-snug">{meal.name}</h2>
                </div>
                <span className="text-2xl flex-shrink-0 mt-0.5">{meal.emoji}</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-emerald-700 text-sm font-medium">
                <span>View recipe</span>
                <span className="text-emerald-500">›</span>
              </div>
            </button>
          );
        })}

        {/* Weekly staples */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <h2 className="font-semibold text-amber-900 text-sm mb-3">🛒 Weekly staples</h2>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            {staples.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-amber-800 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Collaborative extras */}
        <WeeklyExtras
          extras={extras}
          loading={extrasLoading}
          configured={extrasConfigured}
          onAdd={addExtra}
          onRemove={removeExtra}
        />
      </main>

      {selectedMeal && (
        <RecipeModal
          meal={selectedMeal}
          checkedMap={checkedIngredients[selectedMeal.id] || {}}
          onToggle={(idx) => toggleIngredient(selectedMeal.id, idx)}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {shopItems && (
        <ShopPanel items={shopItems} onDismiss={handleDismissShop} />
      )}
    </div>
  );
}
