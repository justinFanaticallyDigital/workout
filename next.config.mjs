import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline.html",
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/exercises(\?.*)?$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "exercise-library",
        expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a dev server and a production build coexist (NEXT_DIST_DIR=.next-dev for dev).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default pwaConfig(nextConfig);
