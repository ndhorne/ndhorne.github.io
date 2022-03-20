/*
Copyright 2022 Nicholas D. Horne

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

const lowerAlphaCheckbox = document.getElementById("loweralpha");
const upperAlphaCheckbox = document.getElementById("upperalpha");
const numericCheckbox = document.getElementById("numeric");
const specialCharsCheckbox = document.getElementById("special");
const lengthField = document.getElementById("length");
const quantityField = document.getElementById("quantity");
const exclusionsField = document.getElementById("exclusions");
const outputTextarea = document.getElementById("output");
const genButton = document.getElementById("generate");
const copyButton = document.getElementById("copy");
const clearButton = document.getElementById("clear");
const aboutButton = document.getElementById("about");
const methodSelect = document.getElementById("method");
const beginWithLetterCheckbox = document.getElementById("beginwithletter");
const excludeSimilarCheckbox = document.getElementById("excludesimilar");
const excludeDuplicatesCheckbox = document.getElementById("excludeduplicates");
const excludeSequentialCheckbox = document.getElementById("excludesequential");

//const statusDetails = document.getElementById("statusdetails");
//const statusSummary = document.getElementById("statussummary");

const statusDiv = document.getElementById("statusdiv");
const statusLog = document.getElementById("statuslog");

const aboutModal = document.getElementById("aboutModal");
const aboutOKButton = document.getElementById("aboutOK");

const similars = ["l", "I", "1", "|", "O", "0"];

const sets = {
  lowerAlpha: "abcdefghijklmnopqrstuvwxyz",
  upperAlpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numeric: "0123456789",
  special: "!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~"
};

//get Math.random()-like values from crypto.getRandomValues()
function random() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 2**32;
}

//randomize array in-place using Durstenfeld shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getRandomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

if (!Array.prototype.pushCharCodeRange) {
  Array.prototype.pushCharCodeRange = function(from, to) {
    for (let i = from; i <= to; i++) {
      this.push(String.fromCharCode(i));
    }
  };
} else {
  throw new Error("Array.prototype.pushCharCodeRange already exists");
}

if (!Array.prototype.distinct) {
  Array.prototype.distinct = function() {
    return [...new Set(this)];
  };
} else {
  throw new Error("Array.prototype.distinct already exists");
}

function* genPass(config) {
  const charsets = [];
  
  if (config.lowerAlpha) {
    charsets.push(0);
  }
  if (config.upperAlpha) {
    charsets.push(1);
  }
  if (config.numeric) {
    charsets.push(2);
  }
  if (config.special) {
    charsets.push(3);
  }
  
  if (config.method == 1 || config.method == 2) {
    var chars = [];
    
    //build array of character sets
    for (let i = 0; i < charsets.length; i++) {
      switch (charsets[i]) {
        case 0:
          chars.pushCharCodeRange(97, 122);
          break;
        case 1:
          chars.pushCharCodeRange(65, 90);
          break;
        case 2:
          chars.pushCharCodeRange(48, 57);
          break;
        case 3:
          chars.pushCharCodeRange(33, 47);
          chars.pushCharCodeRange(58, 64);
          chars.pushCharCodeRange(91, 96);
          chars.pushCharCodeRange(123, 126);
          break;
        default:
          console.error("bad character set: " + charsets[i]);
        //end switch (charsets[i]) cases
      } //end switch (charsets[i])
    } //end for
    
    if (config.method == 2) {
      shuffleArray(chars);
    }
  }
  
  //next password
  for (let i = 0; i < config.quantity; i++) {
    let pass = "";
    
    //next character
    while (pass.length < config.length) {
      let char;
      
      switch (config.method) {
        case 0:
          let index = Math.floor(random() * charsets.length);
          
          switch (charsets[index]) {
            case 0:
              char = String.fromCharCode(getRandomInt(97, 122));
              break;
            case 1:
              char = String.fromCharCode(getRandomInt(65, 90));
              break;
            case 2:
              char = String.fromCharCode(getRandomInt(48, 57));
              break;
            case 3:
              let range = Math.floor(random() * 4);
              
              switch (range) {
                case 0:
                  char = String.fromCharCode(getRandomInt(33, 47));
                  break;
                case 1:
                  char = String.fromCharCode(getRandomInt(58, 64));
                  break;
                case 2:
                  char = String.fromCharCode(getRandomInt(91, 96));
                  break;
                case 3:
                  char = String.fromCharCode(getRandomInt(123, 126));
                  break;
                default:
                  console.error("bad special character range: " + range);
                //end switch (range) cases
              } //end switch (range)
              break; //end switch (charsets[index]) case 3
            default:
              console.error("bad character set: " + charsets[index]);
            //end switch (charsets[index]) cases
          } //end switch (charsets[index])
          break; //end switch (method) case 0
        case 1:
        case 2:
          char = chars[Math.floor(random() * chars.length)];
          break;
        default:
          console.error("bad method: " + method);
        //end switch (config.method) cases
      } //end switch (config.method)
      if (config.exclusions.includes(char)) {
        continue;
      } else if (config.excludeDuplicates && pass.includes(char)) {
        continue;
      } else if (
        config.beginWithLetter
        && pass.length == 0
        && !sets.lowerAlpha.includes(char)
        && !sets.upperAlpha.includes(char)
      ) {
        continue;
      } else if (
        config.excludeSequential
        && (
          (pass.charCodeAt(pass.length - 1) + 1) == char.charCodeAt(0)
          || (
            sets.lowerAlpha.includes(pass[pass.length - 1])
            && (
              sets.upperAlpha[
                sets.lowerAlpha.indexOf(pass[pass.length - 1])
              ].charCodeAt(0)
              == (char.charCodeAt(0) - 1)
            )
          )
          || (
            sets.upperAlpha.includes(pass[pass.length - 1])
            && (
              sets.lowerAlpha[
                sets.upperAlpha.indexOf(pass[pass.length - 1])
              ].charCodeAt(0)
              == (char.charCodeAt(0) - 1)
            )
          )
        )
      ) {
        continue;
      } else {
        pass += char;
      }
      if (pass.length == config.length) {
        charsets.forEach(charset => {
          switch (charset) {
            case 0:
              if (!/[a-z]/.test(pass)) {
                pass = "";
              }
              break;
            case 1:
              if (!/[A-Z]/.test(pass)) {
                pass = "";
              }
              break;
            case 2:
              if (!/[0-9]/.test(pass)) {
                pass = "";
              }
              break;
            case 3:
              if (!/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(pass)) {
                pass = "";
              }
              break;
            default:
              console.error("bad character set: " + charset);
            //end switch (charset) cases
          } //end switch (charset)
        });
      }
    } //end while
    yield pass + ((i < config.quantity - 1) ? "\n" : "");
  } //end for
}

function getMaxUniqueLength() {
  const lowerAlpha = lowerAlphaCheckbox.checked;
  const upperAlpha = upperAlphaCheckbox.checked;
  const numeric = numericCheckbox.checked;
  const special = specialCharsCheckbox.checked;
  const excludeSimilar = excludeSimilarCheckbox.checked;
  const exclusions = exclusionsField.value.split("").distinct();
  
  const maxUniqueLength =
    (lowerAlpha ? sets.lowerAlpha.length : 0)
    + (upperAlpha ? sets.upperAlpha.length : 0)
    + (numeric ? sets.numeric.length : 0)
    + (special ? sets.special.length : 0)
    - (
      excludeSimilar
        ? similars.concat(exclusions).distinct().length
        : exclusions.length
    )
  ;
  
  return maxUniqueLength;
}

function optionsAdministrivia(e) {
  let lowerAlpha = lowerAlphaCheckbox.checked;
  let upperAlpha = upperAlphaCheckbox.checked;
  let numeric = numericCheckbox.checked;
  let special = specialCharsCheckbox.checked;
  
  let excludeSimilar = excludeSimilarCheckbox.checked;
  let excludeDuplicates = excludeDuplicatesCheckbox.checked;
  let exclusions = excludeSimilar
    ? exclusionsField.value.split("").concat(similars).distinct()
    : exclusionsField.value.split("").distinct()
  ;
  
  let length = +lengthField.value;
  let quantity = +quantityField.value;
  
  if (!lowerAlpha && !upperAlpha) {
    if (beginWithLetterCheckbox.checked) {
      beginWithLetterCheckbox.checked = false;
    }
    beginWithLetterCheckbox.disabled = true;
  } else {
    beginWithLetterCheckbox.disabled = false;
  }
  
  if (sets.lowerAlpha.split("").every(char => exclusions.includes(char))
  ) {
    if (lowerAlphaCheckbox.checked) {
      lowerAlphaCheckbox.checked = false;
    }
    lowerAlphaCheckbox.disabled = true;
    lowerAlpha = lowerAlphaCheckbox.checked;
  } else {
    lowerAlphaCheckbox.disabled = false;
  }
  
  if (sets.upperAlpha.split("").every(char => exclusions.includes(char))
  ) {
    if (upperAlphaCheckbox.checked) {
      upperAlphaCheckbox.checked = false;
    }
    upperAlphaCheckbox.disabled = true;
    upperAlpha = upperAlphaCheckbox.checked;
  } else {
    upperAlphaCheckbox.disabled = false;
  }
  
  if (sets.numeric.split("").every(char => exclusions.includes(char))
  ) {
    if (numericCheckbox.checked) {
      numericCheckbox.checked = false;
    }
    numericCheckbox.disabled = true;
    numeric = numericCheckbox.checked;
  } else {
    numericCheckbox.disabled = false;
  }
  
  if (sets.special.split("").every(char => exclusions.includes(char))
  ) {
    if (specialCharsCheckbox.checked) {
      specialCharsCheckbox.checked = false;
    }
    specialCharsCheckbox.disabled = true;
    special = specialCharsCheckbox.checked;
  } else {
    specialCharsCheckbox.disabled = false;
  }
  
  if ([lowerAlpha, upperAlpha, numeric, special].filter(v => v).length <= 1) {
    if (excludeSimilarCheckbox.checked) {
      excludeSimilarCheckbox.checked = false;
    }
    excludeSimilarCheckbox.disabled = true;
    excludeSimilar = excludeSimilarCheckbox.checked;
  } else {
    excludeSimilarCheckbox.disabled = false;
  }
  
  const maxUniqueLength = getMaxUniqueLength();
  
  if (
    (!lowerAlpha && !upperAlpha && !numeric && !special)
    || length < 6
    || (excludeDuplicates && length > maxUniqueLength)
    || quantity < 1
  ) {
    genButton.disabled = true;
    
    //statusSummary.style.color = "red";
    statusLog.style.color = "red";
    statusDiv.style.bottom = 0;
    
    let errorText = [];
    
    if (!lowerAlpha && !upperAlpha && !numeric && !special) {
      errorText.push("No set selected");
    }
    if (length < 6) {
      errorText.push("Minimum length is 6 characters");
    }
    if (quantity < 1) {
      errorText.push("Minimum quantity is 1 password");
    }
    if (excludeDuplicates && length > maxUniqueLength) {
      errorText.push("Maximum unique length exceeded");
    }
    
    statusLog.textContent = errorText.join("\n");
  } else if (
    [lowerAlpha, upperAlpha, numeric, special].filter(v => v).length > 0
    && length >= 6
    && (!excludeDuplicates || (excludeDuplicates && length <= maxUniqueLength))
    && quantity >= 1
  ) {
    genButton.disabled = false;
    
    //statusSummary.style.color = "black";
    statusLog.style.color = "green";
    statusLog.textContent = "OK";
    setTimeout(function() {
      statusDiv.style.bottom = "-300px";
    }, 500);
  }
}

function getPass(e) {
  e.preventDefault();
  
  const config = {
    lowerAlpha: lowerAlphaCheckbox.checked,
    upperAlpha: upperAlphaCheckbox.checked,
    numeric: numericCheckbox.checked,
    special: specialCharsCheckbox.checked,
    beginWithLetter: beginWithLetterCheckbox.checked,
    excludeSimilar: excludeSimilarCheckbox.checked,
    excludeDuplicates: excludeDuplicatesCheckbox.checked,
    excludeSequential: excludeSequentialCheckbox.checked,
    exclusions: exclusionsField.value.split("").distinct(),
    method: +methodSelect.value,
    length: +lengthField.value,
    quantity: +quantityField.value
  };
  
  if (config.excludeSimilar) {
    config.exclusions = config.exclusions.concat(similars).distinct();
  }
  
  //clear previous passwords
  outputTextarea.value = "";
  
  //exhaust iterator from generator
  for (let pass of genPass(config)) {
    outputTextarea.value += pass;
  }
}

function copyToClipboard(e) {
  navigator.clipboard.writeText(outputTextarea.value);
}

function clearOutput(e) {
  outputTextarea.value = "";
}

function about(e) {
  /*
  const aboutText = [
    "Random Password Generator",
    "A random password generator utilizing crypto.getRandomValues()",
    "Leverage crypto.getRandomValues() to create random passwords comprising "
    + "your choice of lowercase letters, uppercase letters, numbers, and "
    + "special characters. Options to set password length, number of passwords "
    + "to generate, excluded characters, and algorithm allow for further "
    + "customization.",
    "Author: Nicholas D. Horne",
    "GNU GPLv3 licensed source code available at "
    + "https://github.com/ndhorne/random-password-generator-js"
  ];
  
  alert(
    aboutText.join("\n\n")
  );
  */
  
  aboutModal.style.display = "block";
}

window.addEventListener("click", event => {
  if (event.target == aboutModal) {
    aboutModal.style.display = "none";
  }
}, false);

lowerAlphaCheckbox.addEventListener("change", optionsAdministrivia);
upperAlphaCheckbox.addEventListener("change", optionsAdministrivia);
numericCheckbox.addEventListener("change", optionsAdministrivia);
specialCharsCheckbox.addEventListener("change", optionsAdministrivia);

lengthField.addEventListener("input", optionsAdministrivia);
quantityField.addEventListener("input", optionsAdministrivia);
exclusionsField.addEventListener("input", optionsAdministrivia);

excludeDuplicatesCheckbox.addEventListener("change", optionsAdministrivia);

genButton.addEventListener("click", getPass);
copyButton.addEventListener("click", copyToClipboard);
clearButton.addEventListener("click", clearOutput);

aboutButton.addEventListener("click", about);
aboutOKButton.addEventListener("click", e => {
  aboutModal.style.display = "none";
}, false);

optionsAdministrivia(new CustomEvent("CustomEvent"));
