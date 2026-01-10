import { supabase } from "@components/lib/supabaseClient";
import { Profile } from "@components/store/profileStore";

export const profileQueryKey = (userId?: string) =>
  userId ? ["profile", userId] : ["profiles"];

export const fetchProfileQueryFn = async (
  userId?: string
): Promise<Profile[]> => {
  let query = supabase
    .from("profiles")
    .select(
      "id, is_admin, nickname, last_login, created_at, profile_image, profile_banner"
    );

  if (userId) {
    query = query.eq("id", userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("프로필 가져오기 에러:", error);
    throw error;
  }

  return data ?? [];
};
