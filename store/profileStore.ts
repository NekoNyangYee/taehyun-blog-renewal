import { supabase } from "@components/lib/supabaseClient";
import { create } from "zustand";

export interface Profile {
  id: string;
  is_admin: boolean;
  nickname: string;
  last_login: string;
  created_at: string;
  profile_image: string;
  profile_banner: string;
}

interface ProfileProps {
  profiles: Profile[];
  isCached: boolean;
  fetchProfiles: (userId?: string) => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  checkAdminStatus?: (userId: string) => Promise<boolean>;
  clearCache: () => void;
}

export const useProfileStore = create<ProfileProps>((set, get) => ({
  profiles: [],
  isCached: false,
  fetchProfiles: async (userId?: string) => {
    const state = get();

    // 캐시가 있으면 데이터베이스 호출 건너뛰기
    if (state.isCached && state.profiles.length > 0) {
      return;
    }

    let query = supabase
      .from("profiles")
      .select(
        "id, is_admin, nickname, last_login, created_at, profile_image, profile_banner"
      );

    // userId가 제공되면 특정 사용자만 조회
    if (userId) {
      query = query.eq("id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("프로필 가져오기 에러:", error);
      set({ profiles: [] });
      return;
    }

    set({ profiles: data ?? [], isCached: true });
  },
  updateProfile: async (profileData: Partial<Profile>) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("로그인된 사용자가 없습니다");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", user.id);
    if (error) {
      console.error("프로필 업데이트 에러:", error);
      return;
    }
    // 업데이트 후 캐시 초기화하여 다음 fetch에서 최신 데이터 가져오기
    set({ isCached: false });
    await get().fetchProfiles(user.id);
  },
  clearCache: () => {
    set({ isCached: false, profiles: [] });
  },
}));
