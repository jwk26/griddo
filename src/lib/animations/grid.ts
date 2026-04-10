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

export const creationVariants: Variants = {
  initial: { scale: 0.85, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 8,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};
