/*
Copyright 2022, 2023 Nicholas D. Horne

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
"use strict";

const imperialRadio = document.getElementById("imperialRadio");
const metricRadio = document.getElementById("metricRadio");

const imperialDiv = document.getElementById("imperialDiv");
const metricDiv = document.getElementById("metricDiv");

const ftInput = document.getElementById("ft");
const inInput = document.getElementById("in");
const lbInput = document.getElementById("lb");

const cmInput = document.getElementById("cm");
const kgInput = document.getElementById("kg");

const calculateImperial = document.getElementById("calculateImperial");
const calculateMetric = document.getElementById("calculateMetric");
const clearImperial = document.getElementById("clearImperial");
const clearMetric = document.getElementById("clearMetric");

const metricHeightUnit = document.getElementById("metricHeightUnit");

const resultsDiv = document.getElementById("resultsDiv");
const closeResults = document.getElementById("closeResults");

const bmiResultsCell = document.getElementById("bmiResultsCell");
const classResultsCell = document.getElementById("classResultsCell");
const riskResultsCell = document.getElementById("riskResultsCell");

const mobileResultsCell = document.getElementById("mobileResultsCell");
const mobileClassCell = document.getElementById("mobileClassCell");
const mobileRiskCell = document.getElementById("mobileRiskCell");

const categoriesTable = document.getElementById("categoriesTable");

const insideFlowInputDivContainer =
  document.getElementById("insideFlowInputDivContainer")
;

const convertImperialToMetricDiv =
  document.getElementById("convertImperialToMetricDiv")
;
const convertImperialToMetricYes =
  document.getElementById("convertImperialToMetricYes")
;
const convertImperialToMetricNo =
  document.getElementById("convertImperialToMetricNo")
;

const convertMetricToImperialDiv =
  document.getElementById("convertMetricToImperialDiv")
;
const convertMetricToImperialYes =
  document.getElementById("convertMetricToImperialYes")
;
const convertMetricToImperialNo =
  document.getElementById("convertMetricToImperialNo")
;

const convertCentimetersToMetersDiv =
  document.getElementById("convertCentimetersToMetersDiv")
;
const convertCentimetersToMetersYes =
  document.getElementById("convertCentimetersToMetersYes")
;
const convertCentimetersToMetersNo =
  document.getElementById("convertCentimetersToMetersNo")
;

const convertMetersToCentimetersDiv =
  document.getElementById("convertMetersToCentimetersDiv")
;
const convertMetersToCentimetersYes =
  document.getElementById("convertMetersToCentimetersYes")
;
const convertMetersToCentimetersNo =
  document.getElementById("convertMetersToCentimetersNo")
;

let height, weight, bmi;

function getClass(bmi) {
  if (bmi < 18.5) return "Underweight";
  else if (bmi < 25) return "Normal";
  else if (bmi < 30) return "Overweight";
  else if (bmi < 35) return "Obese";
  else if (bmi < 40) return "Severely Obese";
  else return "Morbidly Obese";
}

function getRisk(bmi) {
  if (bmi < 25) return "Minimal";
  else if (bmi < 30) return "Increased";
  else if (bmi < 35) return "High";
  else if (bmi < 40) return "Very High";
  else return "Extremely High";
}

function highlightCategoryRow(bmi) {
  let row;
  
  if (bmi < 18.5) {
    row = document.getElementById("underweightRow");
    row.style.backgroundColor = "green";
  } else if (bmi < 25) {
    row = document.getElementById("normalRow");
    row.style.backgroundColor = "blue";
  } else if (bmi < 30) {
    row = document.getElementById("overweightRow");
    row.style.backgroundColor = "orangered";
  } else if (bmi < 35) {
    row = document.getElementById("obeseClass1Row");
    row.style.backgroundColor = "red";
  } else if (bmi < 40) {
    row = document.getElementById("obeseClass2Row");
    row.style.backgroundColor = "crimson";
  } else {
    row = document.getElementById("obeseClass3Row");
    row.style.backgroundColor = "darkred";
  }
  row.style.color = "white";
}

function resetCategoriesTable() {
  Array.from(categoriesTable.rows).forEach(function(row) {
    row.style.backgroundColor = "";
    row.style.color = "";
  });
}

function setResults(bmi) {
  resetCategoriesTable();
  
  bmiResultsCell.innerHTML = mobileResultsCell.innerHTML = bmi.toFixed(2);
  classResultsCell.innerHTML = mobileClassCell.innerHTML = getClass(bmi);
  riskResultsCell.innerHTML = mobileRiskCell.innerHTML = getRisk(bmi);
  
  highlightCategoryRow(bmi);
  
  resultsDiv.style.visibility = "visible";
}

imperialRadio.addEventListener("click", function(e) {
  metricDiv.style.visibility = "hidden";
  imperialDiv.style.visibility = "visible";
  
  dismissConvertImperialToMetric();
  dismissConvertCentimetersToMeters();
  dismissConvertMetersToCentimeters();
  
  if (ftInput.value == "") {
    ftInput.focus();
  } else if (inInput.value == "") {
    inInput.focus();
  } else if (lbInput.value == "") {
    lbInput.focus();
  } else {
    calculateImperial.focus();
  }
  
  if (
    (cmInput.value != "" && kgInput.value != "")
    && (ftInput.value == "" && inInput.value == "" && lbInput.value == "")
  ) {
    displayConvertMetricToImperial();
  }
}, false);

metricRadio.addEventListener("click", function(e) {
  imperialDiv.style.visibility = "hidden";
  metricDiv.style.visibility = "visible";
  
  dismissConvertMetricToImperial();
  
  if (cmInput.value == "") {
    cmInput.focus();
  } else if (kgInput.value == "") {
    kgInput.focus();
  } else {
    calculateMetric.focus();
  }
  
  if (
    (ftInput.value != "" && lbInput.value != "")
    && (cmInput.value == "" && kgInput.value == "")
  ) {
    displayConvertImperialToMetric();
  }
}, false);

calculateImperial.addEventListener("click", function(e) {
  height = (+ftInput.value * 12) + (+inInput.value);
  weight = +lbInput.value;
  bmi = (weight * 703) / (height * height);
  
  setResults(bmi);
  console.log(bmi, getClass(bmi), getRisk(bmi));
}, false);

calculateMetric.addEventListener("click", function(e) {
  dismissConvertCentimetersToMeters();
  dismissConvertMetersToCentimeters();
  
  height =
    metricHeightUnit.value == "cm"
    ? +cmInput.value / 100 //convert to meters
    : +cmInput.value //already in meters
  ;
  weight = +kgInput.value;
  bmi = weight / (height * height);
  
  setResults(bmi);
  console.log(bmi, getClass(bmi), getRisk(bmi));
}, false);

function enableCalculateImperial() {
  if (
    +ftInput.value > 0
    && (+inInput.value >= 0 && +inInput.value < 12)
    && +lbInput.value > 0
  ) {
    calculateImperial.disabled = false;
  } else {
    calculateImperial.disabled = true;
  }
}

function enableCalculateMetric() {
  if (+cmInput.value > 0 && +kgInput.value > 0) {
    calculateMetric.disabled = false;
  } else {
    calculateMetric.disabled = true;
  }
}

function enableClearImperial() {
  if (ftInput.value != "" || inInput.value != "" || lbInput.value != "") {
    clearImperial.disabled = false;
  } else {
    clearImperial.disabled = true;
  }
}

function enableClearMetric() {
  if (cmInput.value != "" || kgInput.value != "") {
    clearMetric.disabled = false;
  } else {
    clearMetric.disabled = true;
  }
}

ftInput.addEventListener("input", function(e) {
  dismissConvertMetricToImperial();
  
  enableCalculateImperial();
  enableClearImperial();
}, false);

inInput.addEventListener("input", function(e) {
  dismissConvertMetricToImperial();
  
  enableCalculateImperial();
  enableClearImperial();
}, false);

lbInput.addEventListener("input", function(e) {
  dismissConvertMetricToImperial();
  
  enableCalculateImperial();
  enableClearImperial();
}, false);

cmInput.addEventListener("input", function(e) {
  dismissConvertImperialToMetric();
  dismissConvertCentimetersToMeters();
  dismissConvertMetersToCentimeters();
  
  enableCalculateMetric();
  enableClearMetric();
}, false);

kgInput.addEventListener("input", function(e) {
  dismissConvertImperialToMetric();
  
  enableCalculateMetric();
  enableClearMetric();
}, false);

function clearImperialInputs() {
  ftInput.value = "";
  inInput.value = "";
  lbInput.value = "";
  
  enableCalculateImperial();
  enableClearImperial();
}

function clearMetricInputs() {
  cmInput.value = "";
  kgInput.value = "";
  
  enableCalculateMetric();
  enableClearMetric();
}

clearImperial.addEventListener("click", function(e) {
  clearImperialInputs();
}, false);

clearMetric.addEventListener("click", function(e) {
  dismissConvertCentimetersToMeters();
  dismissConvertMetersToCentimeters();
  
  clearMetricInputs();
}, false);

ftInput.addEventListener("keyup", function(e) {
  if (e.keyCode === 13) {
    calculateImperial.click();
  }
}, false);

inInput.addEventListener("keyup", function(e) {
  if (e.keyCode === 13) {
    calculateImperial.click();
  }
}, false);

lbInput.addEventListener("keyup", function(e) {
  if (e.keyCode === 13) {
    calculateImperial.click();
  }
}, false);

cmInput.addEventListener("keyup", function(e) {
  if (e.keyCode === 13) {
    calculateMetric.click();
  }
}, false);

kgInput.addEventListener("keyup", function(e) {
  if (e.keyCode === 13) {
    calculateMetric.click();
  }
}, false);

closeResults.addEventListener("click", function(e) {
  resultsDiv.style.visibility = "hidden";
  resetCategoriesTable();
}, false);

metricHeightUnit.addEventListener("change", function(e) {
  dismissConvertCentimetersToMeters();
  dismissConvertMetersToCentimeters();
  
  if (cmInput.value != "" && metricHeightUnit.value == "m") {
    displayConvertCentimetersToMeters();
  }
  if (cmInput.value != "" && metricHeightUnit.value == "cm") {
    displayConvertMetersToCentimeters();
  }
  
  if (cmInput.value == "") {
    cmInput.focus();
  }
}, false);

function displayConvertImperialToMetric() {
  convertImperialToMetricYes.disabled = false;
  convertImperialToMetricNo.disabled = false;
  
  convertImperialToMetricDiv.classList.add("conversionDivDisplayed");
}

function dismissConvertImperialToMetric() {
  convertImperialToMetricDiv.classList.remove("conversionDivDisplayed");
  
  convertImperialToMetricYes.disabled = true;
  convertImperialToMetricNo.disabled = true;
}

function displayConvertMetricToImperial() {
  convertMetricToImperialYes.disabled = false;
  convertMetricToImperialNo.disabled = false;
  
  convertMetricToImperialDiv.classList.add("conversionDivDisplayed");
}

function dismissConvertMetricToImperial() {
  convertMetricToImperialDiv.classList.remove("conversionDivDisplayed");
  
  convertMetricToImperialYes.disabled = true;
  convertMetricToImperialNo.disabled = true;
}

function displayConvertCentimetersToMeters() {
  convertCentimetersToMetersYes.disabled = false;
  convertCentimetersToMetersNo.disabled = false;
  
  convertCentimetersToMetersDiv.classList.add("conversionDivDisplayed");
}

function dismissConvertCentimetersToMeters() {
  convertCentimetersToMetersDiv.classList.remove("conversionDivDisplayed"); 
  
  convertCentimetersToMetersYes.disabled = true;
  convertCentimetersToMetersNo.disabled = true;
}

function displayConvertMetersToCentimeters() {
  convertMetersToCentimetersYes.disabled = false;
  convertMetersToCentimetersNo.disabled = false;
  
  convertMetersToCentimetersDiv.classList.add("conversionDivDisplayed");
}

function dismissConvertMetersToCentimeters() {
  convertMetersToCentimetersDiv.classList.remove("conversionDivDisplayed");
  
  convertMetersToCentimetersYes.disabled = true;
  convertMetersToCentimetersNo.disabled = true;
}

convertImperialToMetricYes.addEventListener("click", function(e) {
  let cm = ((+ftInput.value * 12) + +inInput.value) * 2.54;
  let kg = +lbInput.value * 0.4536;
  
  metricHeightUnit.value == "cm"
    ? cmInput.value = cm % 1 == 0 ? cm : cm.toFixed(2)
    : cmInput.value = (cm / 100) % 1 == 0 ? cm / 100 : (cm / 100).toFixed(2)
  ;
  
  kgInput.value = kg % 1 == 0 ? kg : kg.toFixed(2);
  
  calculateMetric.disabled = false;
  clearMetric.disabled = false;
  calculateMetric.focus();
  
  dismissConvertImperialToMetric();
}, false);

convertImperialToMetricNo.addEventListener("click", function(e) {
  dismissConvertImperialToMetric();
  cmInput.focus();
}, false);

convertMetricToImperialYes.addEventListener("click", function(e) {
  let cm;
  
  metricHeightUnit.value == "cm"
    ? cm = +cmInput.value
    : cm = +cmInput.value * 100
  ;
  
  ftInput.value = Math.floor((cm / 2.54) / 12);
  inInput.value = ((cm / 2.54) % 12) % 1 == 0
    ? (cm / 2.54) % 12
    : ((cm / 2.54) % 12).toFixed(2)
  ;
  lbInput.value = (+kgInput.value / 0.4536) % 1 == 0
    ? +kgInput.value / 0.4536
    : (+kgInput.value / 0.4536).toFixed(2)
  ;
  
  calculateImperial.disabled = false;
  clearImperial.disabled = false;
  calculateImperial.focus();
  
  dismissConvertMetricToImperial();
}, false);

convertMetricToImperialNo.addEventListener("click", function(e) {
  dismissConvertMetricToImperial();
  ftInput.focus();
}, false);

convertCentimetersToMetersYes.addEventListener("click", function(e) {
  let m = +cmInput.value / 100;
  cmInput.value = m % 1 != 0 ? m.toFixed(2) : m
  
  dismissConvertCentimetersToMeters();
}, false);

convertCentimetersToMetersNo.addEventListener("click", function(e) {
  dismissConvertCentimetersToMeters();
}, false);

convertMetersToCentimetersYes.addEventListener("click", function(e) {
  let cm = +cmInput.value * 100;
  cmInput.value = cm % 1 != 0 ? cm.toFixed(2) : cm
  
  dismissConvertMetersToCentimeters();
}, false);

convertMetersToCentimetersNo.addEventListener("click", function(e) {
  dismissConvertMetersToCentimeters();
}, false);

//(re)initialize widget states
dismissConvertImperialToMetric();
dismissConvertMetricToImperial();
dismissConvertCentimetersToMeters();
dismissConvertMetersToCentimeters();
imperialRadio.checked = true;
clearImperialInputs();
clearMetricInputs();
ftInput.focus();

//fine sizing/positioning
insideFlowInputDivContainer.style.width = Math.max(
  parseFloat(getComputedStyle(imperialDiv).width),
  parseFloat(getComputedStyle(metricDiv).width)
) + "px";
insideFlowInputDivContainer.style.height = Math.max(
  parseFloat(getComputedStyle(imperialDiv).height),
  parseFloat(getComputedStyle(metricDiv).height)
) + "px";
if (
  parseFloat(
    getComputedStyle(
      document.getElementById("metricInputTable").rows[0]
    ).height
  )
  > parseFloat(
    getComputedStyle(
      document.getElementById("imperialInputTable").rows[0]
    ).height
  )
) {
  document.getElementById("imperialInputTable").rows[0].style.height =
    getComputedStyle(document.getElementById("metricInputTable").rows[0]).height
  ;
}

//switch units to metric based on geolocation data
(async function() {
  const response = await fetch("http://ip-api.com/json/");
  
  if (response.ok) {
    const result = await response.json();
    
    if (
      result.countryCode !== "US"
      && result.countryCode !== "LR"
      && result.countryCode !== "MM"
    ) {
      if (
        imperialRadio.checked
        && ftInput.value === ""
        && inInput.value === ""
        && lbInput.value === ""
      ) {
        metricRadio.click();
      }
    }
  } else {
    console.error("Error fetching geolocation data from IP Geolocation API");
  }
})();
