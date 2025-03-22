// components/bookmark/BookMarkPageWithSession.tsx
"use client";

import withSessionCheck from "@components/lib/withSessionCheck";
import BookMarkDetailPage from "./Bookmark";

function BookMarkPage() {
  return <BookMarkDetailPage />;
}

export default withSessionCheck(BookMarkPage);
