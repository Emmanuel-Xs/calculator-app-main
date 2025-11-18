import { animate } from "https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

export const animationConfig = {
  digitEnter: {
    x: [5, 0],
    duration: prefersReducedMotion ? 0 : 0.15,
    easing: "ease-out",
  },
  digitDelete: {
    x: [0, 5],
    duration: prefersReducedMotion ? 0 : 0.15,
    easing: "ease-in",
  },
  digitDeleteFinished: {
    x: [5, 0],
    duration: prefersReducedMotion ? 0 : 0.1,
    easing: "ease-out",
  },
  operatorSlideUp: {
    opacity: [0, 1],
    y: [20, 0],
    duration: prefersReducedMotion ? 0 : 0.2,
    easing: "ease-out",
  },
  currentFadeOutUp: {
    opacity: [1, 0],
    y: [0, -20],
    duration: prefersReducedMotion ? 0 : 0.2,
    delay: 0,
    easing: "ease-in",
  },
  currentFadeInUp: {
    opacity: [0, 1],
    y: [20, 0],
    duration: prefersReducedMotion ? 0 : 0.2,
    easing: "ease-out",
  },
  resultEnter: {
    opacity: [0, 1],
    y: [20, 0],
    scale: [0.85, 1],
    duration: prefersReducedMotion ? 0 : 0.3,
    easing: [0.4, 0, 0.2, 1],
  },
  previousFadeOutUp: {
    opacity: [1, 0],
    y: [0, -15],
    duration: prefersReducedMotion ? 0 : 0.2,
    easing: "ease-in",
  },
  reset: {
    opacity: [0, 1],
    scale: [0, 1],
    duration: prefersReducedMotion ? 0 : 0.15,
    easing: "ease-out",
  },
};

/**
 * A factory function that creates and returns an object of animation handler functions.
 * These handlers need access to the display elements to update their content and apply animations.
 * @param {HTMLElement} currentOperandElement The DOM element for the current operand display.
 * @param {HTMLElement} previousOperandElement The DOM element for the previous operand display.
 * @returns {object} An object containing all animation handler functions.
 */
export function createAnimationHandlers(
  currentOperandElement,
  previousOperandElement
) {
  return {
    "digit-enter": (currentText) => {
      currentOperandElement.textContent = currentText;
      animate(currentOperandElement, animationConfig.digitEnter);
    },
    "digit-delete": (currentText) => {
      animate(currentOperandElement, animationConfig.digitDelete);

      setTimeout(() => {
        currentOperandElement.textContent = currentText;
        animate(currentOperandElement, animationConfig.digitDeleteFinished);
      }, 150);
    },
    operator: (currentText, previousText) => {
      animate(currentOperandElement, animationConfig.currentFadeOutUp);

      setTimeout(() => {
        previousOperandElement.textContent = previousText;
        animate(previousOperandElement, animationConfig.operatorSlideUp);
        currentOperandElement.textContent = currentText;
        animate(currentOperandElement, animationConfig.currentFadeInUp);
      }, 100);
    },
    result: (currentText, previousText) => {
      animate(previousOperandElement, animationConfig.previousFadeOutUp);

      setTimeout(() => {
        previousOperandElement.textContent = previousText;
        currentOperandElement.textContent = currentText;
        animate(currentOperandElement, animationConfig.resultEnter);
      }, 100);
    },
    reset: (currentText, previousText) => {
      currentOperandElement.textContent = currentText;
      previousOperandElement.textContent = previousText;
      animate(currentOperandElement, animationConfig.reset);
    },
    default: (currentText, previousText) => {
      currentOperandElement.textContent = currentText;
      previousOperandElement.textContent = previousText;
    },
  };
}
