const temperatureInput = document.getElementById("temperature");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const error = document.getElementById("error");

convertBtn.addEventListener("click", function () {
    const temperature = parseFloat(temperatureInput.value);
    const from = fromUnit.value;
    const to = toUnit.value;

    error.textContent = "";

    if (isNaN(temperature)) {
        result.textContent = "Result will appear here";
        error.textContent = "Please enter a valid temperature.";
        return;
    }

    // Convert the input temperature to Celsius first
    let celsius;

    if (from === "celsius") {
        celsius = temperature;
    } else if (from === "fahrenheit") {
        celsius = (temperature - 32) * 5 / 9;
    } else if (from === "kelvin") {
        celsius = temperature - 273.15;
    }

    // Convert Celsius to the selected unit
    let convertedTemperature;

    if (to === "celsius") {
        convertedTemperature = celsius;
    } else if (to === "fahrenheit") {
        convertedTemperature = (celsius * 9 / 5) + 32;
    } else if (to === "kelvin") {
        convertedTemperature = celsius + 273.15;
    }

    result.textContent =
        `${temperature}° ${getUnitSymbol(from)} = ${convertedTemperature.toFixed(2)}° ${getUnitSymbol(to)}`;
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