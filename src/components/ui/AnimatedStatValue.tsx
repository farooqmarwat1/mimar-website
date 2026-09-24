"use client";

import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export default function AnimatedStatValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const reduceMotion = useReducedMotion();
  const target = Number.parseInt(value, 10);
  const suffix = value.replace(String(target), "");
  const raw = useMotionValue(reduceMotion ? target : 0);
  const eased = useSpring(raw, { stiffness: 55, damping: 18, mass: 0.8 });
  const display = useTransform(eased, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (inView || reduceMotion) raw.set(target);
  }, [inView, raw, reduceMotion, target]);

  return (
    <span ref={ref} aria-label={value}>
      <span className="sr-only">{value}</span>
      <motion.span aria-hidden>{display}</motion.span>
    </span>
  );
}
