// next.config.mjs

import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {};

const pwaConfig = withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
  // ... other options you like
});

export default {
  ...nextConfig,
  ...pwaConfig,
};

