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
            isLoading: true, // ✅ 세션 로딩 여부 초기값 true

            addSession: (newSession) => {
                set({ session: newSession, isLoading: false });
            },

            fetchSession: async () => {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("세션 가져오기 실패:", error);
                    set({ isLoading: false }); // 오류 발생 시 로딩 해제
                    return;
                }
                set({ session: data.session, isLoading: false }); // ✅ 세션 가져오면 로딩 해제
            },
        }),
        {
            name: "session-storage", // ✅ 로컬 스토리지에 저장하여 새로고침 후에도 유지
        }
    )
);
