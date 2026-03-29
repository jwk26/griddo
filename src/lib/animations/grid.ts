import type { Transition, Variants } from "motion/react";

export const sinkingVariants: Variants = {
  visible: { y: 0, scale: 1, opacity: 1 },
  exit: {
    y: 8,
    scale: 0.95,
    opacity: 0.5,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export const taskTossVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  tossed: {
    scale: 1.05,
    rotate: 3,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
};

export const magnetSnapTransition: Transition = {
  type: "spring",
  damping: 15,
  stiffness: 200,
};

export const vignetteVariants: Variants = {
  l0: { opacity: 0 },
  l1: { opacity: 0.15 },
  l2: { opacity: 0.3 },
  l3: { opacity: 0.45 },
};
