"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useExtras() {
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const configured = !!supabase;

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("extras")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setExtras(data);
        setLoading(false);
      });

    const channel = supabase
      .channel("extras-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "extras" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setExtras((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "DELETE") {
            setExtras((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const addExtra = async (text) => {
    if (!supabase || !text.trim()) return;
    await supabase.from("extras").insert({ text: text.trim() });
  };

  const removeExtra = async (id) => {
    if (!supabase) return;
    await supabase.from("extras").delete().eq("id", id);
  };

  return { extras, loading, configured, addExtra, removeExtra };
}
