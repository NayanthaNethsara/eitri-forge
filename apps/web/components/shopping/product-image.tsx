"use client";

import { Cpu, CircuitBoard, MemoryStick, Fan, Box, Zap, ImageOff, Monitor } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { safeImageUrl } from "@/lib/utils";
import type { ProductImageProps } from "@/types/shopping";

const categoryIcons = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  gpu: Monitor,
  cooler: Fan,
  case: Box,
  psu: Zap,
};

export function ProductImage({ src, name, category }: ProductImageProps) {
  const [failedSource, setFailedSource] = useState<string>();
  const source = safeImageUrl(src);
  const Icon = category ? categoryIcons[category] : ImageOff;
  return source && source !== failedSource ? (
    <Image
      unoptimized
      width={400}
      height={300}
      src={source}
      alt={name}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSource(source)}
      className="h-full w-full object-contain p-3"
    />
  ) : (
    <span className="flex h-full min-h-20 w-full flex-col items-center justify-center gap-2 text-muted">
      <Icon className="h-9 w-9 stroke-[1.2]" aria-hidden="true" />
      <span className="text-[10px]">Image unavailable</span>
    </span>
  );
}
