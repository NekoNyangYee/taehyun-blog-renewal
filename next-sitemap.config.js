/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://taehyun-blog-renewal.vercel.app", // 본인 도메인
  generateRobotsTxt: true, // robots.txt 자동 생성 여부
  sitemapSize: 7000, // URL이 많으면 여러 개 파일로 쪼개줌
};
