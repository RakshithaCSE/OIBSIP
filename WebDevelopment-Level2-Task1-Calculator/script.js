const buttonsContainer = document.querySelector(".buttons");
const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const message = document.getElementById("message");

let expression = "";
let justCalculated = false;
let resultLabel = "";

// Display the current expression or result.
function render() {
    display.textContent = expression
        ? formatExpression(expression)
        : "0";

    expressionDisplay.textContent = resultLabel;
    message.textContent = "";
}

// Make operators easier to read on screen.
function formatExpression(value) {
    return value
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " − ");
}

// Limit floating-point precision.
function formatResult(value) {
    const rounded = Number(value.toPrecision(12));
    return String(Object.is(rounded, -0) ? 0 : rounded);
}

// Add a number to the expression.
function addDigit(digit) {
    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    resultLabel = "";

    if (expression === "0") {
        expression = digit;
    } else {
        expression += digit;
    }

    render();
}

// Add a decimal point to the current number.
function addDecimal() {
    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    resultLabel = "";

    if (expression === "" || /[+\-*/]$/.test(expression)) {
        expression += "0.";
    } else {
        const operatorIndex = Math.max(
            expression.lastIndexOf("+"),
            expression.lastIndexOf("-"),
            expression.lastIndexOf("*"),
            expression.lastIndexOf("/")
        );

        const currentNumber = expression.slice(operatorIndex + 1);

        if (!currentNumber.includes(".")) {
            expression += ".";
        }
    }

    render();
}

// Add an arithmetic operator.
function addOperator(operator) {
    resultLabel = "";

    if (justCalculated) {
        justCalculated = false;
    }

    if (expression === "") {
        if (operator === "-") {
            expression = "-";
            render();
        }
        return;
    }

    if (expression === "-") {
        return;
    }

    const lastCharacter = expression.slice(-1);
    const endsWithOperator = /[+\-*/]$/.test(expression);

    if (endsWithOperator) {
        // Allow a negative number after another operator, e.g. 5 * -3.
        if (operator === "-" && lastCharacter !== "-") {
            expression += "-";
        } else {
            // Replace the previous operator if another is selected.
            expression = expression.slice(0, -1) + operator;
        }
    } else {
        expression += operator;
    }

    render();
}

// Remove the final character.
function backspace() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    resultLabel = "";
    render();
}

// Reset the calculator.
function clearCalculator() {
    expression = "";
    justCalculated = false;
    resultLabel = "";
    render();
}

// Convert the expression into numbers and operators.
// This avoids eval() completely.
function tokenize(input) {
    const tokens = [];
    let index = 0;
    let expectOperand = true;

    while (index < input.length) {
        const character = input[index];

        if (/\s/.test(character)) {
            index++;
            continue;
        }

        const startsNumber =
            /[0-9.]/.test(character) ||
            (character === "-" && expectOperand);

        if (startsNumber) {
            if (!expectOperand) {
                throw new Error("Invalid expression.");
            }

            let numberText = "";
            let decimalCount = 0;
            let digitCount = 0;

            if (character === "-") {
                numberText = "-";
                index++;
            }

            while (
                index < input.length &&
                /[0-9.]/.test(input[index])
            ) {
                const current = input[index];

                if (current === ".") {
                    decimalCount++;
                } else {
                    digitCount++;
                }

                numberText += current;
                index++;
            }

            if (digitCount === 0 || decimalCount > 1) {
                throw new Error("Enter a valid number.");
            }

            const number = Number(numberText);

            if (!Number.isFinite(number)) {
                throw new Error("Number is too large.");
            }

            tokens.push(number);
            expectOperand = false;
            continue;
        }

        if ("+-*/".includes(character) && !expectOperand) {
            tokens.push(character);
            expectOperand = true;
            index++;
            continue;
        }

        throw new Error("Invalid expression.");
    }

    if (tokens.length === 0 || expectOperand) {
        throw new Error("Enter a complete expression.");
    }

    return tokens;
}

// Perform one arithmetic operation.
function calculateOperation(left, operator, right) {
    switch (operator) {
        case "+":
            return left + right;

        case "-":
            return left - right;

        case "*":
            return left * right;

        case "/":
            if (right === 0) {
                throw new Error("Cannot divide by zero.");
            }
            return left / right;

        default:
            throw new Error("Unknown operator.");
    }
}

// Evaluate multiplication and division first,
// then addition and subtraction from left to right.
function evaluateExpression(input) {
    const tokens = tokenize(input);

    // First pass: multiplication and division.
    let index = 1;

    while (index < tokens.length) {
        const operator = tokens[index];

        if (operator === "*" || operator === "/") {
            const result = calculateOperation(
                tokens[index - 1],
                operator,
                tokens[index + 1]
            );

            if (!Number.isFinite(result)) {
                throw new Error("Result is out of range.");
            }

            tokens.splice(
                index - 1,
                3,
                Number(formatResult(result))
            );

            index = Math.max(1, index - 2);
        } else {
            index += 2;
        }
    }

    // Second pass: addition and subtraction.
    index = 1;

    while (index < tokens.length) {
        const result = calculateOperation(
            tokens[index - 1],
            tokens[index],
            tokens[index + 1]
        );

        if (!Number.isFinite(result)) {
            throw new Error("Result is out of range.");
        }

        tokens.splice(
            index - 1,
            3,
            Number(formatResult(result))
        );

        index = 1;
    }

    return Number(formatResult(tokens[0]));
}

// Calculate and display the result.
function calculate() {
    if (!expression) {
        message.textContent = "Enter an expression first.";
        return;
    }

    try {
        const originalExpression = expression;
        const result = evaluateExpression(expression);

        resultLabel = formatExpression(originalExpression) + " =";
        expression = formatResult(result);
        justCalculated = true;

        render();
    } catch (error) {
        expressionDisplay.textContent = formatExpression(expression);
        display.textContent = "Error";
        message.textContent = error.message;
    }
}

// Attach event listeners to the calculator buttons.
buttonsContainer.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {
            if ("+-*/".includes(value)) {
                addOperator(value);
            } else {
                addDigit(value);
            }
            return;
        }

        switch (action) {
            case "clear":
                clearCalculator();
                break;

            case "delete":
                backspace();
                break;

            case "decimal":
                addDecimal();
                break;

            case "calculate":
                calculate();
                break;
        }
    });
});

// Optional keyboard support.
document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        addDigit(key);
    } else if ("+-*/".includes(key)) {
        addOperator(key);
    } else if (key === ".") {
        addDecimal();
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        backspace();
    } else if (key === "Escape") {
        clearCalculator();
    }
});

render();