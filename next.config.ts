import type { NextConfig } from "next";
import { SERVER_ACTION_BODY_LIMIT } from "./src/lib/upload";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Admin uploads (product images, PDF/PPTX assets) travel as Server Action
    // bodies. The Next.js default of 1 MB rejected anything larger before the
    // action could run, which surfaced as a crash page rather than a message.
    serverActions: {
      bodySizeLimit: SERVER_ACTION_BODY_LIMIT,
    },
  },
};

export default nextConfig;
