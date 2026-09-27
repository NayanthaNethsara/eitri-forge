import { Cpu, Layers3, PackageSearch, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StarterPrompt = {
  icon: LucideIcon;
  label: string;
  command: string;
  prompt: string;
};

export const starterPrompts: StarterPrompt[] = [
  {
    icon: Cpu,
    label: "Build a gaming PC",
    command: "/build",
    prompt: "Help me plan a gaming PC. Ask about my budget and the games I play.",
  },
  {
    icon: Wrench,
    label: "Plan a workstation",
    command: "/workstation",
    prompt: "Help me plan a workstation. Ask what software I use and what I want to spend.",
  },
  {
    icon: PackageSearch,
    label: "Check inventory",
    command: "/stock",
    prompt: "What CPUs are currently available in the demo catalog?",
  },
  {
    icon: Layers3,
    label: "Match components",
    command: "/match",
    prompt: "Help me find an AM5 motherboard and compatible DDR5 memory in stock.",
  },
];
