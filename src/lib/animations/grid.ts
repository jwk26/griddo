import type { Transition, Variants } from "motion/react";
import {
  motionDistance,
  motionDuration,
  motionOpacity,
  motionScale,
  motionSpring,
  motionZIndex,
} from "@/lib/animations/motion-language";

export const nodeCardVariants: Variants = {
  rest: { scale: 1, zIndex: motionZIndex.nodeRest },
  hover: { scale: motionScale.nodeHover, zIndex: motionZIndex.nodeHover },
  dragging: { scale: motionScale.nodeDrag, zIndex: motionZIndex.nodeDrag },
};

export const nodeCardTransition: Transition = motionSpring.scale;

export const sinkingVariants: Variants = {
  visible: { y: 0, scale: 1, opacity: 1 },
  exit: {
    y: motionDistance.sink,
    scale: motionScale.sinkingExit,
    opacity: motionOpacity.sinkingExit,
    transition: { duration: motionDuration.completionExit, ease: "easeOut" },
  },
};

export const taskTossVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  tossed: {
    scale: motionScale.taskToss,
    rotate: 3,
    transition: motionSpring.taskToss,
  },
};

export const magnetSnapTransition: Transition = motionSpring.gridSnap;

export const creationVariants: Variants = {
  initial: { scale: motionScale.creationInitial, opacity: motionOpacity.hidden },
  animate: {
    scale: 1,
    opacity: motionOpacity.visible,
    transition: motionSpring.creation,
  },
  exit: {
    scale: motionScale.deletionExit,
    opacity: motionOpacity.hidden,
    y: motionDistance.sink,
    transition: { duration: motionDuration.itemExit, ease: "easeIn" },
  },
};
