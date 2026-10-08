const temperatureInput = document.getElementById("temperature");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const error = document.getElementById("error");

convertBtn.addEventListener("click", function () {
    const inputValue = temperatureInput.value.trim();
    const temperature = parseFloat(inputValue);
    const from = fromUnit.value;
    const to = toUnit.value;

    error.textContent = "";
    result.textContent = "Result will appear here";

    // Validate empty or non-numeric input
    if (inputValue === "" || !Number.isFinite(temperature)) {
        error.textContent = "Please enter a valid numeric temperature.";
        return;
    }

    // Absolute zero validation
    if (from === "celsius" && temperature < -273.15) {
        error.textContent = "Celsius temperature cannot be below -273.15°C.";
        return;
    }

    if (from === "fahrenheit" && temperature < -459.67) {
        error.textContent = "Fahrenheit temperature cannot be below -459.67°F.";
        return;
    }

    if (from === "kelvin" && temperature < 0) {
        error.textContent = "Kelvin temperature cannot be below 0 K.";
        return;
    }

    // Convert input temperature to Celsius
    let celsius;

    if (from === "celsius") {
        celsius = temperature;
    } else if (from === "fahrenheit") {
        celsius = (temperature - 32) * 5 / 9;
    } else if (from === "kelvin") {
        celsius = temperature - 273.15;
    }

    // Convert Celsius to selected unit
    let convertedTemperature;

    if (to === "celsius") {
        convertedTemperature = celsius;
    } else if (to === "fahrenheit") {
        convertedTemperature = (celsius * 9 / 5) + 32;
    } else if (to === "kelvin") {
        convertedTemperature = celsius + 273.15;
    }

    result.textContent =
        `${formatNumber(temperature)}° ${getUnitSymbol(from)} = ` +
        `${convertedTemperature.toFixed(2)}° ${getUnitSymbol(to)}`;
});


function getUnitSymbol(unit) {
    if (unit === "celsius") {
        return "C";
    } else if (unit === "fahrenheit") {
        return "F";
    } else {
        return "K";
    }
}


function formatNumber(value) {
    return Number.isInteger(value) ? value : value.toFixed(2);
}