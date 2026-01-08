import type { Metadata } from "next";
import "./globals.css";
import Header from "@components/components/Header";
import NavBar from "@components/components/NavBar";
import { Suspense } from "react";
import PageLoading from "@components/components/loading/PageLoading";
import Footer from "@components/components/Footer";
import Script from "next/script";
import { ReactQueryProvider } from "./ReactQueryProvider";

export const metadata: Metadata = {
  title: "TaeHyun's Devlog",
  description:
    "프론트엔드 개발자 김태현의 기술 블로그입니다. 개발, 공부, 프로젝트, 일상 등 다양한 이야기를 공유합니다.",
  keywords: [
    "프론트엔드",
    "개발",
    "블로그",
    "React",
    "Next.js",
    "TypeScript",
    "김태현",
  ],
  openGraph: {
    title: "TaeHyun's Devlog",
    description: "프론트엔드 개발자 김태현의 기술 블로그입니다.",
    url: "https://taehyun-blog-renewal.vercel.app", // 실제 도메인으로 변경 필요
    siteName: "TaeHyun's Devlog",
    images: [
      {
        url: "/profile.jpg",
        width: 800,
        height: 600,
        alt: "블로그 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaeHyun's Devlog",
    description: "프론트엔드 개발자 김태현의 기술 블로그입니다.",
    images: ["/profile.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22223b" />
        <link
          rel="apple-touch-icon"
          href="/icons/LogoIcon.png"
          sizes="192x192"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        <link rel="icon" href="/logo.png" type="image/png" />

        {/* LCP 이미지 Preload */}
        <link
          rel="preload"
          as="image"
          href="/profile.webp"
          fetchPriority="high"
        />

        {/* Preconnect to external CDNs */}
        <link rel="preconnect" href="https://cdn.mos.cms.futurecdn.net" />
        <link rel="preconnect" href="https://s3.ap-northeast-2.amazonaws.com" />
        <link rel="preconnect" href="https://img.freepik.com" />
        <link
          rel="preconnect"
          href="https://odflryzaijseaabpixhw.supabase.co"
        />

        {/* ✅ Highlight.js CSS (테마) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        />
      </head>
      <body className="flex flex-col h-screen">
        <Header />
        <ReactQueryProvider>
          <div className="flex flex-1  max-w-[90rem] box-border mx-auto w-full pt-[65px]">
            <NavBar />
            <Suspense fallback={<PageLoading />}>{children}</Suspense>
          </div>
        </ReactQueryProvider>
        <Footer />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
          strategy="afterInteractive"
        />
        <Script id="hljs-init" strategy="afterInteractive">{`
          if (typeof window !== 'undefined' && window.hljs) {
            window.hljs.highlightAll();
          }
        `}</Script>
      </body>
    </html>
  );
}
