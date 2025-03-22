// app/bookmark/page.tsx
import dynamic from "next/dynamic";

// ✅ 클라이언트에서만 실행되도록 withSessionCheck 적용된 컴포넌트를 불러옴
const BookMarkPageWithSession = dynamic(
  () => import("../bookmarks/BookMarkPageWithSession"),
  { ssr: false }
);

export default function Page() {
  return <BookMarkPageWithSession />;
}
