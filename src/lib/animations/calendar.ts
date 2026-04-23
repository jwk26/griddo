import type { Transition, Variants } from "motion/react";
import {
  motionOpacity,
  motionScale,
  motionSpring,
} from "@/lib/animations/motion-language";

export const dayColumnExpandVariants: Variants = {
  collapsed: {
    opacity: motionOpacity.dayColumnCollapsed,
    scaleY: motionScale.dayColumnCollapsed,
  },
  expanded: {
    opacity: motionOpacity.visible,
    scaleY: 1,
    transition: motionSpring.dayColumn,
  },
};

export const magnetSnapCalendarTransition: Transition = motionSpring.calendarSnap;
