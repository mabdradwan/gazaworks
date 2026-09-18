"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  animate,
  useInView,
  type Variants,
  type HTMLMotionProps,
} from "framer-motion";

/**
 * Shared animation primitives for the marketing site.
 *
 * Keep these generic (no copy, no business logic) so any page can
 * import them without pulling in unrelated code. Respect users who
 * prefer reduced motion by keeping distances small and durations short;
 * framer-motion automatically shortens/disables transforms when the OS
 * "reduce motion" setting is on.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades + slides an element in once, the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Wrap a list/grid of children; each direct <StaggerItem> animates in sequence. */
export function StaggerGroup({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/** Subtle lift + shadow on hover/tap — for cards and interactive tiles. */
export function HoverLift({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Gentle continuous float, e.g. for a hero illustration/card. */
export function Float({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated count-up number, triggers once when scrolled into view.
 * e.g. <CountUp value="42" /> or <CountUp value="4.9" />.
 * Non-numeric strings (or numbers with a trailing suffix like "8+") render as-is
 * except the numeric part is what animates; the suffix is appended statically.
 */
export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const numeric = parseFloat(value);
  const suffix = value.slice(String(Math.trunc(numeric)).length).replace(/^\.\d+/, "");
  const decimals = value.includes(".") ? value.split(".")[1].replace(/\D/g, "").length : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(Number.isNaN(numeric) ? null : 0);

  useEffect(() => {
    if (!inView || Number.isNaN(numeric)) return;
    const controls = animate(0, numeric, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => setDisplay(Number(v.toFixed(decimals))),
    });
    return () => controls.stop();
  }, [inView, numeric, decimals]);

  if (Number.isNaN(numeric)) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
