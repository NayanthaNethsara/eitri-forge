import type { Config } from "tailwindcss";
import preset from "../../packages/config/tailwind/preset";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  presets: [preset],
} satisfies Config;
