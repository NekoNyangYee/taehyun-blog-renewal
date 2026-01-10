import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@components/lib/supabaseClient";

interface SessionStore {
  session: Session | null;
  isLoading: boolean;
  addSession: (session: Session | null) => void;
  fetchSession: () => Promise<void>;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session: null,
      isLoading: true,

      addSession: (newSession) => {
        set({ session: newSession, isLoading: false });
      },

      fetchSession: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("세션 가져오기 실패:", error);
          set({ session: null, isLoading: false });
          return;
        }
        // 세션 유효성 검증
        if (data.session && data.session.expires_at) {
          const expiresAt = new Date(data.session.expires_at * 1000);
          if (expiresAt < new Date()) {
            console.warn("세션이 만료되었습니다.");
            set({ session: null, isLoading: false });
            return;
          }
        }
        set({ session: data.session, isLoading: false });
      },
    }),
    {
      name: "session-storage",
      // 로컬 스토리지에서 불러온 후 유효성 재검증
      onRehydrateStorage: () => (state) => {
        if (state?.session) {
          state.fetchSession();
        }
      },
    }
  )
);
