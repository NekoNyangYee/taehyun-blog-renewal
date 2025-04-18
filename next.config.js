/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["lh3.googleusercontent.com", "k.kakaocdn.net"], // 외부 이미지 도메인 추가
  },
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

module.exports = nextConfig;