import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BookMarkDetailPage from "./Bookmark";

export default async function BookMarkPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/"); // ✅ 세션 없으면 홈으로 리디렉트
  }

  return <BookMarkDetailPage />;
}
