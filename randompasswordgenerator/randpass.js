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

let lowerAlphaCheckbox = document.getElementById("loweralpha");
let upperAlphaCheckbox = document.getElementById("upperalpha");
let numericCheckbox = document.getElementById("numeric");
let specialCharsCheckbox = document.getElementById("special");
let lengthField = document.getElementById("length");
let quantityField = document.getElementById("quantity");
let exclusionsField = document.getElementById("exclusions");
let outputTextarea = document.getElementById("output");
let genButton = document.getElementById("generate");
let copyButton = document.getElementById("copy");
let clearButton = document.getElementById("clear");
let aboutButton = document.getElementById("about");
let methodSelect = document.getElementById("method");
let beginWithLetterCheckbox = document.getElementById("beginwithletter");
let excludeSimilarCheckbox = document.getElementById("excludesimilar");
let excludeDuplicatesCheckbox = document.getElementById("excludeduplicates");
let excludeSequentialCheckbox = document.getElementById("excludesequential");

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

Array.prototype.pushCharCodeRange = function(from, to) {
  for (let i = from; i <= to; i++) {
    this.push(String.fromCharCode(i));
  }
};

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
    exclusions: exclusionsField.value.split(""),
    method: +methodSelect.value,
    length: +lengthField.value,
    quantity: +quantityField.value
  };
  
  if (
    !config.lowerAlpha
    && !config.upperAlpha
    && !config.numeric
    && !config.special
  ) {
    alert("Please select one or more character sets");
    return;
  }
  
  if (config.length < 6) {
    alert("Bad length: minimum number of characters is 6");
    return;
  }
  
  if (config.quantity < 1) {
    alert("Bad quantity: minimum number of passwords is 1");
    return;
  }
  
  if (
    config.lowerAlpha
    && sets.lowerAlpha.split("").every(char => config.exclusions.includes(char))
  ) {
    alert("Entire lowercase alpha set excluded, removing from included sets");
    config.lowerAlpha = false;
    lowerAlphaCheckbox.click();
  }
  
  if (
    config.upperAlpha
    && sets.upperAlpha.split("").every(char => config.exclusions.includes(char))
  ) {
    alert("Entire uppercase alpha set excluded, removing from included sets");
    config.upperAlpha = false;
    upperAlphaCheckbox.click();
  }
  
  if (
    config.numeric
    && sets.numeric.split("").every(char => config.exclusions.includes(char))
  ) {
    alert("Entire numeric set excluded, removing from included sets");
    config.numeric = false;
    numericCheckbox.click();
  }
  
  if (
    config.special
    && sets.special.split("").every(char => config.exclusions.includes(char))
  ) {
    alert("Entire special character set excluded, removing from included sets");
    config.special = false;
    specialCharsCheckbox.click();
  }
  
  //if entire excluded set is only set specified, silently cancel
  if (
    !config.lowerAlpha
    && !config.upperAlpha
    && !config.numeric
    && !config.special
  ) {
    return;
  }
  
  if (
    config.beginWithLetter
    && !config.lowerAlpha
    && !config.upperAlpha
  ) {
    alert("Illegal option combination, cannot begin with letter");
    beginWithLetterCheckbox.click();
    return;
  }
  
  if (
    config.excludeSimilar
    && (
      [
        config.lowerAlpha,
        config.upperAlpha,
        config.numeric,
        config.special
      ].filter(option => option == true).length == 1
    )
  ) {
    alert("No similar characters to exclude, deselecting");
    config.excludeSimilar = false;
    excludeSimilarCheckbox.click();
  }
  
  if (config.excludeSimilar) {
    config.exclusions.push("l", "I", "1", "|", "O", "0");
  }
  
  const maxUniqueLength =
    (config.lowerAlpha ? sets.lowerAlpha.length : 0)
    + (config.upperAlpha ? sets.upperAlpha.length : 0)
    + (config.numeric ? sets.numeric.length : 0)
    + (config.special ? sets.special.length : 0)
    - config.exclusions.length
  ;
  
  if (config.excludeDuplicates && config.length > maxUniqueLength) {
    alert("Length option exceeds maximum number of unique characters");
    excludeDuplicatesCheckbox.click();
    return;
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
}

const sets = {
  lowerAlpha: "abcdefghijklmnopqrstuvwxyz",
  upperAlpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numeric: "0123456789",
  special: "!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~"
};

genButton.addEventListener("click", getPass);
copyButton.addEventListener("click", copyToClipboard);
clearButton.addEventListener("click", clearOutput);
aboutButton.addEventListener("click", about);
