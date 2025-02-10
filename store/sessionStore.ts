import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@components/lib/supabaseClient";
import { persist } from "zustand/middleware";

interface SessionStore {
    session: Session | null;
    addSession: (session: Session | null) => Promise<void>;
};

export const useSessionStore = create<SessionStore>()(persist(
    (set) => ({
        session: null,
        addSession: async (session: Session | null) => {
            set({ session });
        },
    }),
    {
        name: "session",
    }
))