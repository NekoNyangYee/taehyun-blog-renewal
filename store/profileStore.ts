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
  fetchProfiles: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  checkAdminStatus?: (userId: string) => Promise<boolean>;
}

export const useProfileStore = create<ProfileProps>((set, get) => ({
  profiles: [],
  fetchProfiles: async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("로그인된 사용자가 없습니다", userError);
      set({ profiles: [] });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("프로필 가져오기 에러:", error);
      set({ profiles: [] });
      return;
    }

    set({ profiles: data ? [data] : [] });
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
    await get().fetchProfiles();
  },
}));
