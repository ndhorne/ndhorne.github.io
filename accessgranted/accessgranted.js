/*
Copyright 2018-2020 Nicholas D. Horne

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

let pin, entry, entries, status, silent;
let buttons = [];
let lcd = document.getElementById("lcd");
let resetDisplayTimeout;

//initializes buttons array with references to button elements
for (let i = 0; i < 10; i++) {
  buttons[i] = document.getElementById("button" + i);
}

//wires up button elements with callback function to update entry
//through forEach higher order function
buttons.forEach(button => {
  button.addEventListener("click", event => {
    if (entry.length < 4) {
      entry += event.target.textContent;
      keyIn();
    }
  });
});

//wires up keyboard number keys with callback function to update entry
window.addEventListener("keydown", event => {
  if (/^\d$/.test(event.key)) {
    if (entry.length < 4) {
      entry += event.key;
      keyIn();
    }
  }
});

//updates lcd div element with current entry
function updateDisplay() {
  lcd.style.backgroundColor = "darkgrey";
  lcd.textContent = entry;
}

//upon key input clears timeout to reset display(if any), updates
//display with current entry, and when four digits in length verifies
//entry after half-second timeout
function keyIn() {
  clearTimeout(resetDisplayTimeout);
  updateDisplay();
  if (entry.length == 4) {
    setTimeout(() => verifyEntry(), 500);
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

//initializes new game
function initGame() {
  pin = pinGen();
  entry = "";
  entries = [];
  highlightKeys();
}

//verifies whether entry matches PIN, updates and sets timeout to clear
//display accordingly, updates array of entered entries, displays win
//dialog and reinitializes game upon success, clears entry upon failure,
//returns analogous boolean value for use with auto-solve
function verifyEntry(fiatEntry) {
  if (fiatEntry) {
    entry = fiatEntry;
  }
  if (entry == pin) {
    lcd.textContent = "Access Granted";
    lcd.style.backgroundColor = "green";
    resetDisplayTimeout = setTimeout(() => updateDisplay(), 3000);
    updateEntries();
    status = "PIN " + pin + " cracked in " + entries.length +
      " attempt" + (entries.length > 1 ? "s" : "");
    if (!silent) {
      alert(status);
    }
    initGame();
    return true;
  } else {
    lcd.textContent = "Access Denied";
    lcd.style.backgroundColor = "red";
    resetDisplayTimeout = setTimeout(() => updateDisplay(), 1500);
    updateEntries();
    entry = "";
    return false;
  }
}

//initializes new game and clears display
function newGame(event) {
  initGame();
  updateDisplay();
  event.preventDefault();
}

//displays about dialog
function about(event) {
  let aboutText =
    "Access Granted JS\n" +
    "\n" +
    "A pointless diversion by Nicholas D. Horne\n" +
    "\n" +
    "Crack a PIN knowing the digits that the PIN comprises\n" +
    "\n" +
    "Can you actually crack a four-digit PIN on your " +
    "first attempt as seen in the movies on a telltale " +
    "worn keypad? The \"worn\" keys contained in the " +
    "PIN have been highlighted on the keypad. PINs " +
    "are four digits in length. Digits may be repeated " +
    "resulting in PINs with less than four keys being " +
    "highlighted. PINs may begin with zero. Input is " +
    "accepted by way of both mouse primary button " +
    "and keyboard number keys.\n" +
    "\n" +
    "GNU GPLv3 licensed source code available at " +
    "https://github.com/ndhorne/access-granted-js";
  alert(aboutText);
  event.preventDefault();
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
    console.log("uniqueDigits has bad length");
  }
  
  return inferences;
}

//sequentially attempts all possible permutations of each combination
//until solved
function autoSolveSequential(event) {
  let inferences = inferAbsentDigits();
  let solved = false;
  
  for (let inference of inferences) {
    
    for (let i = 0; i < 4; i++) {
      let base = inference;
      let current;
      
      if (i == 0) {
        current = base;
      } else if (i == 1) {
        current = base[1] + base[0] + base[2] + base[3];
      } else if (i == 2) {
        current = base[2] + base[0] + base[1] + base[3];
      } else if (i == 3) {
        current = base[3] + base[0] + base[1] + base[2];
      }
      
      solved = verifyEntry(current);
      for (let j = 0; j < 3; j++) {
        if (!solved) {
          current = current[0] + current[1] + current[3] + current[2];
          if (!entries.includes(current)) {
            solved = verifyEntry(current);
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
            solved = verifyEntry(current);
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
//combination and attempts each permutation until solved
function autoSolveSequential2(event) {
  let inferences = inferAbsentDigits();
  let permutations = [];
  let solved = false;
  
  for (let inference of inferences) {
    
    for (let i = 0; i < 4; i++) {
      let base = inference;
      let current;
      
      if (i == 0) {
        current = base;
      } else if (i == 1) {
        current = base[1] + base[0] + base[2] + base[3];
      } else if (i == 2) {
        current = base[2] + base[0] + base[1] + base[3];
      } else if (i == 3) {
        current = base[3] + base[0] + base[1] + base[2];
      }
      
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
    solved = verifyEntry(permutation);
    if (solved) {
      break;
    }
  }
  
  event.preventDefault();
}

//randomly generates all possible permutations of each combination and
//attempts unentered permutations until solved
function autoSolveRandom(event) {
  let uniqueDigits = getUniqueDigits();
  let inferences = inferAbsentDigits();
  let solved = false;
  
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
      
      solved = verifyEntry();
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

//randomly generates entries from unique PIN digits and attempts
//unentered entries until solved
function autoSolveRandom2(event) {
  let uniqueDigits = getUniqueDigits();
  let solved = false;
  
  do {
    entry = "";
    for (let i = 0; i < 4; i++) {
      let randomIndex = Math.floor(Math.random() * uniqueDigits.length);
      entry += uniqueDigits[randomIndex];
    }
    if (!entries.includes(entry)) {
      solved = verifyEntry();
    }
  } while (!solved);
  event.preventDefault();
}

//randomly generates entries from all digits and attempts unentered
//entries until solved
function autoSolveRandom3(event) {
  let solved = false;
  
  do {
    entry = "";
    for (let i = 0; i < 4; i++) {
      let randomNumber = Math.floor(Math.random() * 10);
      entry += randomNumber;
    }
    if (!entries.includes(entry)) {
      solved = verifyEntry();
    }
  } while (!solved);
  event.preventDefault();
}

//logs to console duration of auto-solve methods in milliseconds
function autoSolveBenchmarks() {
  let startTime, endTime;
  let benchpin = pinGen();
  
  //suppress win dialog box
  silent = true;
  
  pin = benchpin;
  startTime = Date.now();
  autoSolveSequential(new CustomEvent("CustomEvent"));
  endTime = Date.now();
  console.log("autoSolveSequential  (" + benchpin + ") : " +
    +(endTime - startTime) + "ms");
  
  pin = benchpin;
  startTime = Date.now();
  autoSolveSequential2(new CustomEvent("CustomEvent"));
  endTime = Date.now();
  console.log("autoSolveSequential2 (" + benchpin + ") : " +
    +(endTime - startTime) + "ms");
  
  pin = benchpin;
  startTime = Date.now();
  autoSolveRandom(new CustomEvent("CustomEvent"));
  endTime = Date.now();
  console.log("autoSolveRandom      (" + benchpin + ") : " +
    +(endTime - startTime) + "ms");
  
  pin = benchpin;
  startTime = Date.now();
  autoSolveRandom2(new CustomEvent("CustomEvent"));
  endTime = Date.now();
  console.log("autoSolveRandom2     (" + benchpin + ") : " +
    +(endTime - startTime) + "ms");
  
  pin = benchpin;
  startTime = Date.now();
  autoSolveRandom3(new CustomEvent("CustomEvent"));
  endTime = Date.now();
  console.log("autoSolveRandom3     (" + benchpin + ") : " +
    +(endTime - startTime) + "ms");
  
  silent = false;
}

//initializes first game
function start() {
  initGame();
}

//initiate first game
start();

//display instructions dialog box upon page load
window.addEventListener("load", event => about(event));
