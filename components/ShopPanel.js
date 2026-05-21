"use client";

const SECTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Staples"];

function Spinner() {
  return (
    <div className="w-4 h-4 rounded-full border-2 border-stone-200 border-t-emerald-500 animate-spin flex-shrink-0" />
  );
}

export default function ShopPanel({ items, onDismiss, onMarkOrdered, isMarkingOrdered }) {
  const shopItems = items.filter((i) => i.status !== "pantry");
  const pantryItems = items.filter((i) => i.status === "pantry");
  const processed = shopItems.filter((i) => i.status !== "pending");
  const successCount = shopItems.filter((i) => i.status === "success").length;
  const errorItems = shopItems.filter((i) => i.status === "error");
  const isDone = shopItems.length > 0 && processed.length === shopItems.length;
  const pct = Math.round((processed.length / shopItems.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl animate-slide-up sm:animate-none">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex-shrink-0">
          <h2 className="font-bold text-stone-900 text-lg">
            {isDone
              ? errorItems.length === 0
                ? "🛒 Shop complete"
                : "🛒 Shop done with some issues"
              : "Adding to your Sainsbury's trolley…"}
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {isDone
              ? errorItems.length === 0
                ? `All ${successCount} items added to your trolley`
                : `${successCount} added · ${errorItems.length} need manual adding`
              : `${processed.length} of ${shopItems.length} items added`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-stone-100 flex-shrink-0 mx-6 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Items list, grouped by section */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {SECTIONS.map((section) => {
            const sectionItems = shopItems.filter((i) => i.section === section);
            if (sectionItems.length === 0) return null;
            return (
              <div key={section}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
                  {section}
                </p>
                <ul className="space-y-2.5">
                  {sectionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-4 flex-shrink-0 flex items-center justify-center">
                        {item.status === "pending" && <Spinner />}
                        {item.status === "success" && <span className="text-sm leading-none">✅</span>}
                        {item.status === "error" && <span className="text-sm leading-none">❌</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            item.status === "success"
                              ? "line-through text-stone-400"
                              : item.status === "error"
                              ? "text-red-600"
                              : "text-stone-700"
                          }`}
                        >
                          {item.text}
                        </p>
                        {item.status === "error" && (
                          <p className="text-xs text-red-400 mt-0.5">Add manually</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Pantry section — assumed in stock, not ordered */}
          {pantryItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2.5">
                🏠 Pantry (not ordered)
              </p>
              <ul className="space-y-2">
                {pantryItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-sm leading-none flex-shrink-0">🏠</span>
                    <p className="text-sm text-stone-400 line-through">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer — shown only when done */}
        {isDone && (
          <div className="px-6 pb-8 pt-4 border-t border-stone-100 flex-shrink-0">
            {errorItems.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-700 font-semibold text-sm mb-1">Items to add manually:</p>
                <ul className="space-y-1">
                  {errorItems.map((item, i) => (
                    <li key={i} className="text-red-600 text-sm">• {item.text}</li>
                  ))}
                </ul>
              </div>
            )}
            {onMarkOrdered && (
              <button
                onClick={onMarkOrdered}
                disabled={isMarkingOrdered}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm mb-3"
              >
                {isMarkingOrdered ? "Saving…" : "✓ Mark as ordered — freeze this week"}
              </button>
            )}
            <button
              onClick={onDismiss}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold py-3.5 rounded-xl transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {!isDone && <div className="h-6 flex-shrink-0" />}
      </div>
    </div>
  );
}
