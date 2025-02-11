import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { persist } from "zustand/middleware";

interface SessionStore {
    session: Session | null;
    addSession: (session: Session | null) => void;
};

export const useSessionStore = create<SessionStore>()(persist(
    (set) => ({
        session: null,
        addSession: (newSession: Session | null) => {
            set({ session: newSession });
        },
    }),
    {
        name: "session",
    }
))