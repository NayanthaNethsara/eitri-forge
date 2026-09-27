import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(
  fileURLToPath(new URL("../..", import.meta.url)),
  process.env.NODE_ENV === "development",
  console,
  true,
);

const nextConfig = {
  transpilePackages: ["@eitri/types"],
};

export default nextConfig;
