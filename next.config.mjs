/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ["ik.imagekit.io", "localhost", "127.0.0.1"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
        {
          protocol: "http",
          hostname: "localhost",
          port: "5000",
          pathname: "/uploads/**",
        },
        {
          protocol: "http",
          hostname: "127.0.0.1",
          port: "5000",
          pathname: "/uploads/**",
        },
    ],
  },
};
export default nextConfig;
