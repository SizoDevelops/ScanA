/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    fallbacks: {
      //image: "/static/images/fallback.png",
      document: "/offline", // if you want to fallback to a custom page rather than /_offline
    },
  });
  
  // Your Next config is automatically typed!
  module.exports = withPWA({
    experimental: {
      missingSuspenseWithCSRBailout: false,
      
    },
    eslint: {
      dirs: ['app','src'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
    },
  
  });
 
