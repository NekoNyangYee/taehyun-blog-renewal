import React from "react";
import Head from "next/head";
import PostDetailPage from "./Posts";

export default function PostPage() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: "태현 블로그 포스트",
              description:
                "프론트엔드 개발자 김태현의 기술 블로그 포스트 목록.",
              author: {
                "@type": "Person",
                name: "김태현",
              },
              publisher: {
                "@type": "Organization",
                name: "TaeHyun's Devlog",
                logo: {
                  "@type": "ImageObject",
                  url: "/profile.jpg",
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": "https://taehyun-blog-renewal.vercel.app/posts",
              },
            }),
          }}
        />
      </Head>
      <PostDetailPage />
    </>
  );
}
