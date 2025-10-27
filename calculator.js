// Select DOM elements
const previousOperandElement = document.getElementById("previous-operand");
const currentOperandElement = document.getElementById("current-operand");
const keysContainer = document.querySelector(".keys");

// Calculator state
const calculatorState = {
  previousOperand: "",
  currentOperand: "0",
  operator: null,
  isResult: false, // Flag to check if currentOperand is a result
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

// Format number with commas
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

// Update the display
function updateDisplay() {
  currentOperandElement.textContent =
    formatNumber(calculatorState.currentOperand) || "0";

  if (calculatorState.operator && calculatorState.previousOperand) {
    const symbol =
      operatorSymbols[calculatorState.operator] || calculatorState.operator;
    previousOperandElement.textContent = `${formatNumber(
      calculatorState.previousOperand
    )} ${symbol}`;
  } else {
    previousOperandElement.textContent = "";
  }
}

// Handle number input
function handleNumber(number) {
  if (calculatorState.isResult) {
    calculatorState.currentOperand = "0";
    calculatorState.isResult = false;
  }

  // Prevent multiple decimal points
  if (number === "." && calculatorState.currentOperand.includes(".")) {
    return;
  }

  const cur = calculatorState.currentOperand;

  // If current is exactly "0" (positive) and input is not ".", replace it
  if (cur === "0" && number !== ".") {
    calculatorState.currentOperand = number;
    updateDisplay();
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
    updateDisplay();
    return;
  }

  // General append (covers "-1", "12", "3.4", "-0.5" etc.)
  calculatorState.currentOperand += number;
  updateDisplay();
}

// Handle operator input
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
    updateDisplay();
    return;
  }

  // If current operand is just a '-', it's an invalid state for an operator
  if (calculatorState.currentOperand === "-") return;

  // Can't use operator without a number
  if (calculatorState.currentOperand === "") return;

  // If there's already a previous operand and operator, calculate first
  if (calculatorState.previousOperand !== "" && calculatorState.operator) {
    calculate();
  }

  calculatorState.operator = operator;
  calculatorState.previousOperand = calculatorState.currentOperand;
  calculatorState.currentOperand = "0";
  calculatorState.isResult = false;

  updateDisplay();
}

// Perform calculation
function calculate() {
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
  calculatorState.isResult = true;
  updateDisplay();
}

// Clear all
function clear() {
  calculatorState.currentOperand = "0";
  calculatorState.previousOperand = "";
  calculatorState.operator = null;
  calculatorState.isResult = false;
  updateDisplay();
}

// Delete last character
function deleteNumber() {
  if (calculatorState.isResult) {
    clear();
    return;
  }

  const cur = String(calculatorState.currentOperand);

  // If "-0" -> deleting should reset to "0"
  if (cur === "-0") {
    calculatorState.currentOperand = "0";
    updateDisplay();
    return;
  }

  // If single character (e.g. "5" or "-") -> reset to 0
  if (cur.length <= 1 || cur === "-") {
    calculatorState.currentOperand = "0";
    updateDisplay();
    return;
  }

  // Otherwise slice off last char
  calculatorState.currentOperand = cur.slice(0, -1);

  // If the result becomes "-" (user deleted digits of negative number), set to "0"
  if (calculatorState.currentOperand === "-") {
    calculatorState.currentOperand = "-0";
  }

  updateDisplay();
}

export function initializeCalculator() {
  // Event delegation for all calculator buttons
  keysContainer.addEventListener("click", (event) => {
    const button = event.target;

    // Ignore clicks on the container itself
    if (!button.classList.contains("btn")) return;

    // Handle numbers
    if (button.dataset.number !== undefined) {
      handleNumber(button.dataset.number);
    }

    // Handle operators
    if (button.dataset.operator !== undefined) {
      handleOperator(button.dataset.operator);
    }

    // Handle actions
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

    // Enter or equals for calculation
    if (key === "Enter" || key === "=") {
      event.preventDefault();
      calculate();
    }

    // Backspace for delete
    if (key === "Backspace") {
      event.preventDefault();
      deleteNumber();
    }

    // Escape for clear
    if (key === "Escape") {
      clear();
    }
  });

  // Initialize display
  updateDisplay();
}
