import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "news.ums.ac.id" },
      { protocol: "https", hostname: "muhammadiyah.or.id" },
      { protocol: "https", hostname: "cdn.suaramuhammadiyah.id" },
      { protocol: "https", hostname: "suaramuhammadiyah.id" },
      { protocol: "https", hostname: "lensamu.id" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
