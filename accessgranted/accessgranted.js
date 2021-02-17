/*
Copyright 2018-2021 Nicholas D. Horne

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

//element bindings
let lcdElement = document.getElementById("lcd");
let optionsElement = document.getElementById("options");
let modeElement = document.getElementById("mode");
let logLabelElement = document.getElementById("logLabel");
let logElement = document.getElementById("log");
let newGameElement = document.getElementById("newGameButton");
let autoSolveElement = document.getElementById("autoSolveButton");
let autoNewGameElement = document.getElementById("autoNew");
let hintElement = document.getElementById("hintButton");
let modeOptionsElement, modeOptionsLabel;

let pin, entry, entries, state, gameMode, timeLeft, maxAttempts;
let silent, solved, locked, autoSolve, autoNew;
let hintsGiven, keysRevealed, mode1CustomValue, mode2CustomValue;
let verifyTimeout, timeLeftTimeout, resetDisplayTimeout, hintTimeout;
let buttons = [];
let aboutText = [
  "Access Granted JS",
  "A pointless diversion by Nicholas D. Horne",
  "Crack a PIN knowing the digits that the PIN comprises",
  "Can you actually crack a four-digit PIN on your " +
  "first attempt as seen in the movies on a telltale " +
  "worn keypad? The \"worn\" keys contained in the " +
  "PIN have been highlighted on the keypad. PINs " +
  "are four digits in length. Digits may be repeated " +
  "resulting in PINs with less than four keys being " +
  "highlighted. PINs may begin with zero. Input is " +
  "accepted by way of both mouse primary button " +
  "and keyboard number keys.",
  "GNU GPLv3 licensed source code available at " +
  "https://github.com/ndhorne/access-granted-js"
];

//append individual option element to select element
function appendSelectOption(selectElement, optionText, optionValue) {
  let option = document.createElement("option");
  option.text = optionText;
  option.value = optionValue;
  selectElement.add(option);
}

//append option elements to select element
function appendSelectOptions(select, ...options) {
  for (let i = 0; i < options.length; i++) {
    let option = document.createElement("option");
    option.text = options[i];
    option.value = options[i];
    select.add(option);
  }
}

//lockout game mode option elements
let mode1OptionsElement = document.createElement("select");
mode1OptionsElement.id = "mode1Options";

let mode1OptionsLabel = document.createElement("label");
mode1OptionsLabel.innerHTML = "Attempts:";
mode1OptionsLabel.htmlFor = "mode1Options";

//lockout options
appendSelectOptions(
  mode1OptionsElement,
  "25", "20", "15", "10", "5", "Custom"
);

//beat the clock game mode option elements
let mode2OptionsElement = document.createElement("select");
mode2OptionsElement.id = "mode2Options";

let mode2OptionsLabel = document.createElement("label");
mode2OptionsLabel.innerHTML = "Time:";
mode2OptionsLabel.htmlFor = "mode2Options";

//beat the clock options
[
  { text: "2'", value: 120 }, { text: "1'", value: 60 },
  { text: "45\"", value: 45 }, { text: "30\"", value: 30 },
  { text: "15\"", value: 15 }, { text: "Custom", value: "Custom" }
].forEach(function(optionObj) {
  appendSelectOption(
    mode2OptionsElement, optionObj.text, optionObj.value
  );
});

//fine sizing/positioning
optionsElement.style.width =
  modeElement.getBoundingClientRect().width + "px";

//wires up auto new game checkbox with callback to set analogous flag
autoNewGameElement.addEventListener("change", (event) => {
  if (autoNewGameElement.checked) {
    autoNew = true;
  } else {
    autoNew = false;
  }
});

//updates game log
function updateLog(line, spacing = 1) {
  if (!silent) {
    console.log(line);
  }
  
  logElement.innerHTML += line;
  for (let i = 0; i < spacing; i++) {
    logElement.appendChild(document.createElement("br"));
  }
  logElement.scrollTop = logElement.scrollHeight;
}

//updates interface when switching game modes
modeElement.addEventListener("change", event => {
  if (logElement.innerHTML.slice(-8) != "<br><br>") {
    logElement.appendChild(document.createElement("br"));
  }
  
  switch (event.target.selectedIndex) {
    case 0:
      updateLog(
        "Crack the Code mode: No restrictions, no limits (time, " +
        "attempts, or otherwise), attempt every possible permutation " +
        "(and then some) at your own leisure and convenience."
      );
      
      if (modeOptionsElement) {
        modeOptionsElement.remove();
      }
      if (modeOptionsLabel) {
        modeOptionsLabel.remove();
      }
      
      break;
    case 1:
      updateLog(
        "Lockout mode: Crack the PIN within the designated number of " +
        "entry attempts, otherwise, should the maximum number of " +
        "entry attempts be exhausted, the panel will lock."
      );
      
      if (modeOptionsElement) {
        modeOptionsElement.remove();
      }
      if (modeOptionsLabel) {
        modeOptionsLabel.remove();
      }
      
      modeOptionsLabel = optionsElement.insertBefore(
        mode1OptionsLabel, newGameElement
      );
      modeOptionsElement = optionsElement.insertBefore(
        mode1OptionsElement, newGameElement
      );
      
      break;
    case 2:
      updateLog(
        "Beat the Clock mode: First rejected entry triggers a timer " +
        "whithin which the correct PIN must be entered, otherwise, " +
        "should the remaining time expire, the panel will lock."
      );
      
      if (modeOptionsElement) {
        modeOptionsElement.remove();
      }
      if (modeOptionsLabel) {
        modeOptionsLabel.remove();
      }
      
      modeOptionsLabel = optionsElement.insertBefore(
        mode2OptionsLabel, newGameElement
      );
      modeOptionsElement = optionsElement.insertBefore(
        mode2OptionsElement, newGameElement
      );
      
      break;
    default:
      console.error("No case defined for chosen option");
  }
});

//initializes buttons array with references to button elements
for (let i = 0; i < 10; i++) {
  buttons[i] = document.getElementById("button" + i);
}

//wires up button elements with callback function to update entry
//through forEach higher order function
buttons.forEach(button => {
  button.addEventListener("click", event => {
    if (!locked) {
      if (entry.length < 4) {
        entry += event.target.textContent;
        keyIn();
      }
    }
  });
});

//wires up keyboard number keys with callback function to update entry
window.addEventListener("keydown", event => {
  if (!locked) {
    if (/^\d$/.test(event.key)) {
      if (entry.length < 4) {
        entry += event.key;
        keyIn();
      }
    }
  }
});

//updates #lcd div element with current entry
function updateDisplay() {
  lcdElement.style.backgroundColor = "darkgrey";
  if (!locked) {
    lcdElement.textContent = entry;
  } else {
    lcdElement.textContent = "- LOCKED -";
  }
}

//clears hint timeout and does associated clean up
function clearHintTimeout() {
  clearTimeout(hintTimeout);
  //rehighlight keys possibly dehighlighted by hintTimeout
  highlightKeys();
  hintElement.disabled = false;
}

//upon key input clears timeout to reset display(if any), updates
//display with current entry, and when four digits in length verifies
//entry after half-second timeout
function keyIn() {
  clearTimeout(resetDisplayTimeout);
  if (gameMode == 0) {
    clearHintTimeout();
  }
  state = 0;
  
  updateDisplay();
  if (entry.length == 4) {
    verifyTimeout = setTimeout(() => verifyEntry(), 500);
  }
}

//highlights button elements corresponding to keys contained in PIN
function highlightKeys() {
  buttons.forEach(button => {
    button.style.backgroundColor = "";
  });
  for (let key of pin) {
    let button = document.getElementById("button" + key);
    button.style.backgroundColor = "orange";
  }
}

//highlights an element after a given timeout
function highlightElement(element, timeout) {  
  setTimeout(() => {
    element.style.border = "2px solid darkorange";
  }, timeout);
}

//updates array of entered entries
function updateEntries() {
  entries.push(entry);
}

//returns randomly generated PIN
function pinGen() {
  //shadow pin binding residing in global scope
  let pin = "";
  for (let i = 0; i < 4; i++) {
    pin += Math.floor(Math.random() * 10);
  }
  //print PIN to console for debugging (or cheating)
  //console.log(pin);
  return pin;
}

//formats and returns amount of time remaining as colon delimited string
function timeLeftString() {
  let hours, minutes, seconds, centiseconds;
  
  function zeroPad(number) {
    return number > 0 
      ? number >= 10
        ? number
        : "0" + number
      : "00";
  }
  
  hours = Math.floor(timeLeft / 3600000);
  minutes = Math.floor(timeLeft % 3600000 / 60000);
  seconds = Math.floor(timeLeft % 3600000 % 60000 / 1000);
  centiseconds = Math.floor(timeLeft % 3600000 % 60000 % 1000 / 10);
  
  hours = zeroPad(hours);
  minutes = zeroPad(minutes);
  seconds = zeroPad(seconds);
  centiseconds = zeroPad(centiseconds);
  
  return hours + ":" + minutes + ":" + seconds + "." + centiseconds;
}

//formats and returns time value in seconds as human readable string
function humanReadableTimeString(time) {
  let hours, minutes, seconds, result = "";
  
  hours = Math.floor(time / 3600);
  minutes = Math.floor(time % 3600 / 60);
  seconds = Math.floor(time % 3600 % 60);
  
  if (hours > 0) {
    result += hours + " hour";
    if (hours > 1) result += "s";
  }
  if (minutes > 0) {
    result += result ? ", " : "";
    if (seconds == 0 && hours > 0) result += "and ";
    result += minutes + " minute";
    if (minutes > 1) result += "s";
  }
  if (seconds > 0) {
    result += result ? ", " : "";
    if (hours > 0 || minutes > 0) result += "and ";
    result += seconds + " second";
    if (seconds > 1) result += "s";
  }
  
  return result;
}

//initializes new game
function initGame(pinArg) {
  
  switch (modeElement.selectedIndex) {
    case 0:
      gameMode = 0;
      hintElement.disabled = false;
      autoSolveElement.disabled = false;
      break;
    case 1:
      gameMode = 1;
      hintElement.disabled = true;
      autoSolveElement.disabled = true;
      
      if (modeOptionsElement.value == "Custom") {
        mode1CustomValue = prompt("Desired number of attempts:");
        if (mode1CustomValue == null) {
          return;
        }
        if (!Number.isInteger(Number(mode1CustomValue))
            || mode1CustomValue <= 0) {
          alert("Please enter a whole number greater than zero.");
          return;
        } else {
          maxAttempts = mode1CustomValue;
          updateLog("Number of entry attempts set to custom value " +
            mode1CustomValue);
        }
      } else {
        maxAttempts = modeOptionsElement.value;
      }
      
      break;
    case 2:
      gameMode = 2;
      hintElement.disabled = true;
      autoSolveElement.disabled = true;
      
      if (modeOptionsElement.value == "Custom") {
        mode2CustomValue = prompt(
          "Desired length of time (in seconds):"
        );
        if (mode2CustomValue == null) {
          return;
        }
        if (!Number.isInteger(Number(mode2CustomValue))
            || mode2CustomValue <= 0) {
          alert("Please enter a whole number greater than zero.");
          return;
        } else {
          if (mode2CustomValue <= 360000) {
            timeLeft = mode2CustomValue * 1000;
            updateLog(
              "Time length allotted to solve within set to custom" +
              " value " + humanReadableTimeString(mode2CustomValue)
            );
          } else {
            timeLeft = 360000 * 1000;
            updateLog(
              "Time length allotted to solve within set to truncated" +
              " value 100 hours"
            );
          }
          
        }
      } else {
        timeLeft = modeOptionsElement.value * 1000;
      }
      
      break;
    default:
      console.error("No case defined for chosen option");
  }
  
  clearTimeout(timeLeftTimeout);
  clearTimeout(hintTimeout);
  
  if (pinArg) {
    pin = pinArg;
  } else {
    pin = pinGen();
  }
  
  state = 0;
  entry = "";
  entries = [];
  hintsGiven = 0;
  keysRevealed = 0;
  solved = false;
  locked = false;
  autoSolve = false;
  updateDisplay();
  highlightKeys();
  
  newGameElement.style.removeProperty("border");
}

//verifies whether entry matches PIN, updates and sets timeout to clear
//display accordingly, updates array of entered entries, displays win
//dialog upon success/clears entry upon failure
function verifyEntry(entryArg) {
  if (entryArg) {
    entry = entryArg;
  }
  
  if (entry == pin) {
    clearTimeout(timeLeftTimeout);
    solved = true;
    state = 1;
    
    if (autoSolve) {
      clearHintTimeout();
    }
    
    lcdElement.textContent = "Access Granted";
    lcdElement.style.backgroundColor = "green";
    
    updateEntries();
    
    let status = "PIN " + pin + " cracked in " + entries.length +
      " attempt" + (entries.length > 1 ? "s" : "");
    if (autoSolve) {
      status = status.replace(/cracked/, "autosolved");
    }
    if (!autoSolve && keysRevealed > 0) {
      status = status.replace(/cracked/, "cracked with "
        + keysRevealed + " position"
        + (keysRevealed > 1 ? "s" : "")
        + " revealed");
    }
    if (gameMode == 2) {
      status += " with "
        + humanReadableTimeString(timeLeft / 1000)
        + " remaining";
    }
    if (pin == "0451") {
      status =
        status.replace(/0451/, "0451 (long live Looking Glass!)");
    }
    
    updateLog(status);
    if (!silent) {
      alert(status);
    }
    
    hintElement.disabled = true;
    autoSolveElement.disabled = true;
    highlightElement(newGameElement, 100);
    
    if (autoNew) {
      //reinitializes game upon success
      resetDisplayTimeout = setTimeout(() => {
        initGame();
      }, 3000);
    }
  } else {
    state = 2;
    
    lcdElement.textContent = "Access Denied";
    lcdElement.style.backgroundColor = "red";
    
    if (!autoSolve) {
      resetDisplayTimeout = setTimeout(() => {
        state = 0;
        updateDisplay();
        
        if (gameMode == 2 && entry == "" && !locked) {
          lcdElement.textContent = timeLeftString();
        }
      }, 1500);
    }
    
    updateEntries();
    entry = "";
    
    if (gameMode == 1 && entries.length < maxAttempts) {
      updateLog(
        "Entry rejected, "
        + (maxAttempts - entries.length)
        + " attempt"
        + ((maxAttempts - entries.length > 1) ? "s" : "")
        + " remaining"
      );
    }
    
    if (gameMode == 1 && entries.length == maxAttempts) {
      clearTimeout(resetDisplayTimeout);
      locked = true;
      state = 3;
      
      if (gameMode == 1 && modeOptionsElement.value == "Custom") {
        newGameElement.disabled = true;
      }
      
      resetDisplayTimeout = setTimeout(() => {
        updateDisplay();
        highlightElement(newGameElement, 100);
        newGameElement.disabled = false;
        updateLog(
          "LOCKED! Allotted number of entry attempts exhausted"
        );
        
        if (autoNew) {
          resetDisplayTimeout = setTimeout(() => {
            initGame();
          }, 5000);
        }
      }, 1500);
    }
    
    if (gameMode == 2 && entries.length == 1) {
      updateLog(
        "Entry rejected, enter correct PIN within "
        + humanReadableTimeString(timeLeft / 1000)
      );
      
      (function setTimeLeftTimeout() {
        timeLeftTimeout = setTimeout(() => {
          timeLeft -= 10;
          if (timeLeft > 0) {
            if (state == 0 && entry == "") {
              lcdElement.textContent = timeLeftString();
            }
            
            setTimeLeftTimeout();
          } else {
            clearTimeout(verifyTimeout);
            locked = true;
            state = 3;
            
            updateDisplay();
            highlightElement(newGameElement, 100);
            updateLog(
              "LOCKED! Time length allotted to enter correct PIN within"
              + " expired"
            );
            
            if (autoNew) {
              resetDisplayTimeout = setTimeout(() => {
                initGame();
              }, 5000);
            }
          }
        }, 10);
      })();
    }
  }
}

//initializes user invoked new game
function newGame(event) {
  clearTimeout(resetDisplayTimeout);
  initGame();
  event.preventDefault();
}

//displays about dialog
function about(event) {
  alert(
    aboutText.join("\n\n")
  );
  event.preventDefault();
}

//flash incremental number of keys in pin upon hint request
function hint(event) {
  hintElement.disabled = true;
  
  let keysToFlash = keysRevealed < 4 ? keysRevealed + 1 : keysRevealed;
  let current = 0, logUpdated = false;
  let button = document.getElementById("button" + pin[current]);
  
  function flashKey(times) {
    hintTimeout = setTimeout(() => {
      hintTimeout = setTimeout(() => {
        button.style.backgroundColor = "";
        if (keysToFlash == 1 && keysRevealed < 4 && !logUpdated) {
          keysRevealed++;
          updateLog(
            keysRevealed
            + " of 4 positions revealed, "
            + (keysRevealed < 4
              ? "hint again for "
                + (keysRevealed + 1)
                + " of 4 positions"
              : "no positions remaining")
          );
          logUpdated = true;
        }
        hintTimeout = setTimeout(() => {
          button.style.backgroundColor = "orange";
          if (--times > 0) {
            flashKey(times);
          } else {
            if (--keysToFlash > 0) {
              hintTimeout = setTimeout(() => {
                current++;
                button =
                  document.getElementById("button" + pin[current]);
                flashKey(3);
              }, 500);
            } else {
              hintElement.disabled = false;
            }
          }
        }, 250);
      }, 250);
    }, 0);
  }
  
  flashKey(3);
  hintsGiven++;
}

//returns array of unique PIN digits
function getUniqueDigits() {
  let uniqueDigits = [];
  
  for (let i = 0; i < 10; i++) {
    if (pin.includes(i) && !uniqueDigits.includes(i)) {
      uniqueDigits.push(i);
    }
  }
  
  return uniqueDigits;
}

//returns array of all possible combinations of unique PIN digits
function inferAbsentDigits() {
  let uniqueDigits = getUniqueDigits();
  let inferences = [];
  
  if (uniqueDigits.length == 4) {
    inferences.push(uniqueDigits.join(""));
  } else if (uniqueDigits.length == 3) {
    for (let i = 0; i < 3; i++) {
      inferences.push(uniqueDigits.join("") + uniqueDigits[i]);
    }
  } else if (uniqueDigits.length == 2) {
    for (let i = 0; i < 2; i++) {
      inferences.push(uniqueDigits.join("") + uniqueDigits[i] +
        uniqueDigits[i]);
    }
    inferences.push(uniqueDigits.join("") + uniqueDigits[0] +
      uniqueDigits[1]);
  } else if (uniqueDigits.length == 1) {
    inferences.push(uniqueDigits.join("") + uniqueDigits[0] +
      uniqueDigits[0] + uniqueDigits[0]);
  } else {
    console.error("uniqueDigits has bad length");
  }
  
  return inferences;
}

//shifts digits of base combination to exhaust permutations
function shiftBase(base, pass) {
  let current;
  
  if (pass == 0) {
    current = base;
  } else if (pass == 1) {
    current = base[1] + base[0] + base[2] + base[3];
  } else if (pass == 2) {
    current = base[2] + base[0] + base[1] + base[3];
  } else if (pass == 3) {
    current = base[3] + base[0] + base[1] + base[2];
  } else {
    console.error("Erroneous pass value");
  }
  
  return current;
}

//sequentially attempts all possible permutations of each combination
//until solved
function autoSolveSequential(event) {
  let inferences = inferAbsentDigits();
  
  autoSolve = true;
  
  for (let inference of inferences) {
    
    for (let i = 0; i < 4; i++) {
      let current;
      
      current = shiftBase(inference, i);
      
      verifyEntry(current);
      for (let j = 0; j < 3; j++) {
        if (!solved) {
          current = current[0] + current[1] + current[3] + current[2];
          if (!entries.includes(current)) {
            verifyEntry(current);
          }
        } else {
          break;
        }
        if (j == 2) {
          break;
        }
        if (!solved) {
          current = current[0] + current[2] + current[1] + current[3];
          if (!entries.includes(current)) {
            verifyEntry(current);
          }
        } else {
          break;
        }
      }
      if (solved) {
        break;
      }
    }
    if (solved) {
      break;
    }
  }
  
  event.preventDefault();
}

//sequentially creates array of all possible permutations of each
//combination and then attempts each permutation until solved
function autoSolveSequential2(event) {
  let inferences = inferAbsentDigits();
  let permutations = [];
  
  autoSolve = true;
  
  for (let inference of inferences) {
    
    for (let i = 0; i < 4; i++) {
      let current;
      
      current = shiftBase(inference, i);
      
      permutations.push(current);
      for (let j = 0; j < 3; j++) {
        current = current[0] + current[1] + current[3] + current[2];
        if (!permutations.includes(current)) {
          permutations.push(current);
        }
        if (j == 2) {
          break;
        }
        current = current[0] + current[2] + current[1] + current[3];
        if (!permutations.includes(current)) {
          permutations.push(current);
        }
      }
    }
  }
  
  for (let permutation of permutations) {
    verifyEntry(permutation);
    if (solved) {
      break;
    }
  }
  
  event.preventDefault();
}

//randomly generates all possible permutations of each combination
//while immediately attempting unentered permutations until solved
function autoSolveRandom(event) {
  let uniqueDigits = getUniqueDigits();
  let inferences = inferAbsentDigits();
  
  autoSolve = true;
  
  for (let i = 0; i < inferences.length; i++) {
    let inference = inferences[i];
    let maxPermutations;
    
    if (uniqueDigits.length == 4) {
      maxPermutations = 24;
    }
    if (uniqueDigits.length == 3) {
      maxPermutations = 12;
    }
    if (uniqueDigits.length == 2 && i <= 1) {
      maxPermutations = 4;
    }
    if (uniqueDigits.length == 2 && i == 2) {
      maxPermutations = 6;
    }
    if (uniqueDigits.length == 1) {
      maxPermutations = 1;
    }
    
    for (let j = 0; j < maxPermutations; j++) {
      do {
        let inferredDigits = inference.split("");
        entry = "";
        for (let k = 4; k > 0; k--) {
          let randomIndex = Math.floor(Math.random() * k);
          entry += inferredDigits.splice(randomIndex, 1).join("");
        }
      } while (entries.includes(entry));
      
      verifyEntry();
      if (solved) {
        break;
      }
    }
    if (solved) {
      break;
    }
  }
  
  event.preventDefault();
}

//randomly generates entries from unique PIN digits and immediately
//attempts unentered entries until solved
function autoSolveRandom2(event) {
  let uniqueDigits = getUniqueDigits();
  
  autoSolve = true;
  
  do {
    entry = "";
    for (let i = 0; i < 4; i++) {
      let randomIndex = Math.floor(Math.random() * uniqueDigits.length);
      entry += uniqueDigits[randomIndex];
    }
    if (!entries.includes(entry)) {
      verifyEntry();
    }
  } while (!solved);
  
  event.preventDefault();
}

//randomly generates entries from all digits and immediately attempts
//unentered entries until solved
function autoSolveRandom3(event) {
  autoSolve = true;
  
  do {
    entry = "";
    for (let i = 0; i < 4; i++) {
      let randomNumber = Math.floor(Math.random() * 10);
      entry += randomNumber;
    }
    if (!entries.includes(entry)) {
      verifyEntry();
    }
  } while (!solved);
  
  event.preventDefault();
}

//logs to console duration of auto-solve functions in milliseconds
//note: does not take into account accuracy/precision of the platform's
//timer, which may only update as often as every 15ms on older versions
//of Windows
function autoSolveBenchmarks() {
  let startTime, endTime;
  let benchpin = pinGen();
  let autoSolveFunctions = [];
  
  autoSolveFunctions.push(autoSolveSequential);
  autoSolveFunctions.push(autoSolveSequential2);
  autoSolveFunctions.push(autoSolveRandom);
  autoSolveFunctions.push(autoSolveRandom2);
  autoSolveFunctions.push(autoSolveRandom3);
  
  //suppress win dialog box
  silent = true;
  
  for (let i = 0; i < autoSolveFunctions.length; i++) {
    initGame(benchpin);
    startTime = Date.now();
    autoSolveFunctions[i](new CustomEvent("CustomEvent"));
    endTime = Date.now();
    console.log(autoSolveFunctions[i].name +
      " ".repeat(21 - autoSolveFunctions[i].name.length) +
      "(" + benchpin + ") : " +
      +(endTime - startTime) + "ms");
  }
  
  silent = false;
}

//initializes first game
function start() {
  modeElement.selectedIndex = 0;
  autoNewGameElement.checked = false;
  initGame();
  
  aboutText.forEach(line => {
    updateLog(line, 2);
  });
}

//initiate first game
start();

//display instructions dialog box upon page load
//window.addEventListener("load", event => about(event));
