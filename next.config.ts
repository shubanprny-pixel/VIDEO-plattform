import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Thumbnail uploads are validated up to 5MB (see src/lib/blob.ts);
      // Next.js defaults Server Action request bodies to 1MB, which
      // silently fails multipart uploads larger than that.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
