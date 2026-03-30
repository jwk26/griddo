import type { Transition, Variants } from "motion/react";

export const dayColumnExpandVariants: Variants = {
  collapsed: { opacity: 0.7, scaleY: 0.95 },
  expanded: {
    opacity: 1,
    scaleY: 1,
    transition: { type: "spring", damping: 20, stiffness: 300 },
  },
};

export const magnetSnapCalendarTransition: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 250,
};
