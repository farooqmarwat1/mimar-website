"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
  className,
  variant = "default",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "default" | "mask";
  style?: CSSProperties;
}) {
  const reduceMotion = useReducedMotion();
  const initial = variant === "mask"
    ? { opacity: 1, clipPath: "inset(0 0 100% 0)" }
    : { opacity: 0, y: 28 };
  const visible = variant === "mask"
    ? { opacity: 1, clipPath: "inset(0 0 0% 0)" }
    : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={reduceMotion ? false : initial}
      whileInView={visible}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={reduceMotion ? { duration: 0 } : { duration: variant === "mask" ? 1.15 : 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
