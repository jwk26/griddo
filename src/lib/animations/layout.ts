import type { Variants } from "motion/react";
import {
  motionBorderColor,
  motionDistance,
  motionDuration,
  motionOpacity,
  motionScale,
  motionShadow,
  motionSpring,
} from "@/lib/animations/motion-language";

export const searchOverlayVariants: Variants = {
  hidden: { opacity: motionOpacity.hidden, scale: motionScale.overlayInitial },
  visible: {
    opacity: motionOpacity.visible,
    scale: 1,
    transition: { duration: motionDuration.affordance, ease: "easeOut" },
  },
  exit: {
    opacity: motionOpacity.hidden,
    scale: motionScale.overlayInitial,
    transition: { duration: motionDuration.searchExit, ease: "easeIn" },
  },
};

export const bitDetailPopupVariants: Variants = {
  hidden: { opacity: motionOpacity.hidden, y: motionDistance.popupSlide },
  visible: {
    opacity: motionOpacity.visible,
    y: 0,
    transition: { duration: motionDuration.modalEnter, ease: "easeOut" },
  },
  exit: {
    opacity: motionOpacity.hidden,
    y: motionDistance.popupSlide,
    transition: { duration: motionDuration.modalExit, ease: "easeIn" },
  },
};

export const sidebarVariants: Variants = {
  open: { width: "var(--sidebar-width)" },
  closed: { width: "var(--sidebar-collapsed-width)" },
};

export const sidebarDragTargetRest = {
  scale: 1,
  boxShadow: motionShadow.none,
  borderColor: motionBorderColor.transparent,
} as const;

export const sidebarDragTargetActive = {
  scale: motionScale.sidebarDragTarget,
  boxShadow: motionShadow.sidebarDragTarget,
  borderColor: motionBorderColor.sidebarDragTarget,
} as const;

export const sidebarDragTargetTransition = motionSpring.scale;
