"use client";
import { useState } from "react";

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function WeeklyExtras({ extras, loading, configured, onAdd, onRemove }) {
  const [newItem, setNewItem] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setIsAdding(true);
    await onAdd(newItem.trim());
    setNewItem("");
    setIsAdding(false);
  };

  if (!configured) {
    return (
      <div className="bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4">
        <h2 className="font-semibold text-stone-400 text-sm mb-1">This week's extras</h2>
        <p className="text-stone-400 text-xs leading-relaxed">
          Add your Supabase credentials to enable the shared real-time extras list.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold text-stone-900 text-sm">This week's extras</h2>
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          live
        </span>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add an item…"
          className="flex-1 min-w-0 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={isAdding || !newItem.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0"
        >
          Add
        </button>
      </div>

      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : extras.length === 0 ? (
        <p className="text-stone-400 text-sm italic">Nothing added yet — type above to add</p>
      ) : (
        <ul className="space-y-2">
          {extras.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span className="text-stone-700 text-sm">{item.text}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-stone-300 hover:text-red-400 transition-colors p-1 flex-shrink-0 -mr-1"
                aria-label="Remove"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
