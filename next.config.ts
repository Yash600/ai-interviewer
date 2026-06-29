import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@langchain/langgraph", "@langchain/core", "@langchain/groq"],
  allowedDevOrigins: ["pointed-economy-contempt.ngrok-free.dev"],
};

export default nextConfig;
