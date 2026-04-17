const basePath = process.env.BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  ...(basePath
    ? { basePath, assetPrefix: `${basePath}/` }
    : {}),
};

export default nextConfig;
