import { createAnimationHandlers } from "./animation.js";

const previousOperandElement = document.getElementById("previous-operand");
const currentOperandElement = document.getElementById("current-operand");
const keysContainer = document.querySelector(".keys");

const animationHandlers = createAnimationHandlers(
  currentOperandElement,
  previousOperandElement
);

// Calculator state
const calculatorState = {
  previousOperand: "",
  currentOperand: "0",
  operator: null,
  hasResult: false, // Flag to check if currentOperand is a result
};

// Operator symbol mapping for keyboard input
const operatorMap = {
  "+": "add",
  "-": "subtract",
  "*": "multiply",
  x: "multiply",
  "/": "divide",
};

// Operator display symbols
const operatorSymbols = {
  add: "+",
  subtract: "-",
  multiply: "x",
  divide: "/",
};

/**
 * Formats a number string with commas for thousands separators.
 * @param {string | number} number The number to format.
 * @returns {string} The formatted number string.
 */
function formatNumber(number) {
  if (number === null || number === "") return "";
  const stringNumber = String(number);
  const [integerPart, decimalPart] = stringNumber.split(".");
  const integerDisplay = isNaN(parseFloat(integerPart))
    ? ""
    : parseFloat(integerPart).toLocaleString("en", {
        maximumFractionDigits: 0,
      });

  if (decimalPart != null) {
    return `${integerDisplay}.${decimalPart}`;
  }
  return integerDisplay;
}

/**
 * Updates the calculator display with the current state and applies an animation.
 * @param {string} [animationType="default"] The type of animation to apply.
 */
function updateDisplay(animationType = "default") {
  const currentText = formatNumber(calculatorState.currentOperand) || "0";
  const previousText =
    calculatorState.operator && calculatorState.previousOperand
      ? `${formatNumber(calculatorState.previousOperand)} ${
          operatorSymbols[calculatorState.operator] || calculatorState.operator
        }`
      : "";

  // Apply animations based on the action
  const handler = animationHandlers[animationType] || animationHandlers.default;
  handler(currentText, previousText);
}

/**
 * Handles the logic for when a number or decimal point is clicked.
 * @param {string} number The digit or "." that was entered.
 */
function handleNumber(number) {
  if (calculatorState.hasResult) {
    calculatorState.currentOperand = "0";
    calculatorState.hasResult = false;
  }

  // Prevent multiple decimal points
  if (number === "." && calculatorState.currentOperand.includes(".")) {
    return;
  }

  const cur = calculatorState.currentOperand;

  // If current is exactly "0" (positive) and input is not ".", replace it
  if (cur === "0" && number !== ".") {
    calculatorState.currentOperand = number;
    updateDisplay("digit-enter");
    return;
  }

  // If current is exactly "-0" (negative zero)
  if (cur === "-0") {
    if (number === ".") {
      // "-0" + "." => "-0."
      calculatorState.currentOperand = "-0.";
    } else {
      // "-0" + "1" => "-1" (replace the zero)
      calculatorState.currentOperand = "-" + number;
    }
    updateDisplay("digit-enter");
    return;
  }

  // General append (covers "-1", "12", "3.4", "-0.5" etc.)
  calculatorState.currentOperand += number;
  updateDisplay("digit-enter");
}

/**
 * Handles the logic for when an operator button is clicked.
 * @param {string} operator The operator action name (e.g., "add", "subtract").
 */
function handleOperator(operator) {
  // Allow starting with a negative number: set "-0" (not append)
  if (
    operator === "subtract" &&
    calculatorState.previousOperand === "" &&
    (calculatorState.currentOperand === "0" ||
      calculatorState.currentOperand === "")
  ) {
    // If user already has "-0" do nothing
    if (calculatorState.currentOperand !== "-0") {
      calculatorState.currentOperand = "-0";
    }
    updateDisplay("digit-enter");
    return;
  }

  // If current operand is just a '-', it's an invalid state for an operator
  if (calculatorState.currentOperand === "-") return;

  // Can't use operator without a number
  if (calculatorState.currentOperand === "") return;

  // If there's already a previous operand and operator, calculate first
  if (calculatorState.previousOperand !== "" && calculatorState.operator) {
    calculate(true); // from operator
  }

  calculatorState.operator = operator;
  calculatorState.previousOperand = calculatorState.currentOperand;
  calculatorState.currentOperand = "0";
  calculatorState.hasResult = false;

  updateDisplay("operator");
}

/**
 * Performs the calculation based on the current state.
 * @param {boolean} [fromOperator=false] Flag to indicate if the calculation was triggered
 * by an operator (for chained operations).
 */
function calculate(fromOperator = false) {
  let computation;
  const prev = parseFloat(calculatorState.previousOperand);
  const current = parseFloat(calculatorState.currentOperand);

  // Need both operands to calculate
  if (isNaN(prev) || isNaN(current)) return;

  // Perform the operation
  switch (calculatorState.operator) {
    case "add":
      computation = prev + current;
      break;
    case "subtract":
      computation = prev - current;
      break;
    case "multiply":
      computation = prev * current;
      break;
    case "divide":
      if (current === 0) {
        alert("Cannot divide by zero!");
        clear();
        return;
      }
      computation = prev / current;
      break;
    default:
      return;
  }

  // Round to avoid floating point errors
  calculatorState.currentOperand = String(
    Math.round(computation * 100000000) / 100000000
  );
  calculatorState.operator = null;
  calculatorState.previousOperand = "";
  calculatorState.hasResult = true;
  // Use result animation only when equals is pressed, not for chained operations
  updateDisplay(fromOperator ? "operator" : "result");
}

/**
 * Resets the calculator to its initial state.
 */
function clear() {
  const needsAnimation =
    calculatorState.currentOperand !== "0" ||
    calculatorState.previousOperand !== "";

  calculatorState.currentOperand = "0";
  calculatorState.previousOperand = "";
  calculatorState.operator = null;
  calculatorState.hasResult = false;

  if (needsAnimation) {
    updateDisplay("reset");
  }
}

/**
 * Deletes the last character from the current operand.
 */
function deleteNumber() {
  // If a result is displayed, DEL should act like a full clear.
  if (calculatorState.hasResult) {
    clear();
    return;
  }

  const cur = String(calculatorState.currentOperand);

  if (cur === "0") {
    return;
  }

  let newOperand;

  if (cur.length === 1 || cur === "-0") {
    newOperand = "0";
  } else {
    newOperand = cur.slice(0, -1);
    if (newOperand === "-") {
      newOperand = "-0";
    }
  }

  calculatorState.currentOperand = newOperand;
  updateDisplay("digit-delete");
}

/**
 * Sets up all event listeners for the calculator buttons and keyboard input.
 */
export function initializeCalculator() {
  // Event delegation for all calculator buttons
  keysContainer.addEventListener("click", (event) => {
    const button = event.target;

    // Ignore clicks on the container itself
    if (!button.classList.contains("btn")) return;

    if (button.dataset.number !== undefined) {
      handleNumber(button.dataset.number);
    }

    if (button.dataset.operator !== undefined) {
      handleOperator(button.dataset.operator);
    }

    if (button.dataset.action !== undefined) {
      const action = button.dataset.action;

      switch (action) {
        case "reset":
          clear();
          break;
        case "delete":
          deleteNumber();
          break;
        case "equals":
          calculate();
          break;
      }
    }
  });

  // Keyboard support
  document.addEventListener("keydown", (event) => {
    const key = event.key;

    // Numbers and decimal
    if ((key >= "0" && key <= "9") || key === ".") {
      handleNumber(key);
    }

    // Operators - map keyboard symbols to operator names
    if (operatorMap[key]) {
      handleOperator(operatorMap[key]);
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      calculate();
    }

    if (key === "Backspace") {
      event.preventDefault();
      deleteNumber();
    }

    // Escape for clear
    if (key === "Escape") {
      clear();
    }
  });

  updateDisplay();
}
