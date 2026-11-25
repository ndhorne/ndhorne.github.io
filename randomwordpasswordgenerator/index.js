/*
Copyright 2026 Nicholas D. Horne

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
"use strict";

const wordsInput = document.getElementById("words-input");
const quantityInput = document.getElementById("quantity-input");
const customSeparatorInput = document.getElementById("custom-separator-input");

const genButton = document.getElementById("generate-button");
const copyButton = document.getElementById("copy-button");
const clearButton = document.getElementById("clear-button");
const aboutButton = document.getElementById("about-button");

const radioButtons = document.querySelectorAll('input[name="casing"]');

const camelCasingButton = document.getElementById("casing-radio-button-camel");
const pascalCasingButton = (
  document.getElementById("casing-radio-button-pascal")
);
const kebabCasingButton = document.getElementById("casing-radio-button-kebab");
const snakeCasingButton = document.getElementById("casing-radio-button-snake");
const flatCasingButton = document.getElementById("casing-radio-button-flat");

const commonWordBankCb = document.getElementById("word-bank-checkbox-common");
const extensiveWordBankCb = (
  document.getElementById("word-bank-checkbox-extensive")
);
const wordleWordBankCb = document.getElementById("word-bank-checkbox-wordle");
const lovecraftWordBankCb = (
  document.getElementById("word-bank-checkbox-lovecraft")
);
const shakespeareWordBankCb = (
  document.getElementById("word-bank-checkbox-shakespeare")
);

const capitalizePasswordsCb = document.getElementById("capitalize-passwords");
const capitalizeEachWordCb = document.getElementById("capitalize-each-word");
const appendNumbersToPasswordsCb = (
  document.getElementById("append-numbers-to-passwords")
);
const appendNumbersToEachWordCb = (
  document.getElementById("append-numbers-to-each-word")
);
const appendXNumbersToYWordsCb = (
  document.getElementById("append-x-numbers-to-y-words")
);
const appendSymbolsToPasswordsCb = (
  document.getElementById("append-symbols-to-passwords")
);
const appendSymbolsToEachWordCb = (
  document.getElementById("append-symbols-to-each-word")
);
const appendXSymbolsToYWordsCb = (
  document.getElementById("append-x-symbols-to-y-words")
);
const leetifyPasswordsCb = document.getElementById("leetify-passwords");

const appendNumbersToPasswordsQtyInput = (
  document.getElementById("append-numbers-to-passwords-quantity")
);
const appendNumbersToEachWordQtyInput = (
  document.getElementById("append-numbers-to-each-word-quantity")
);
const appendXNumbersToYWordsNumberQtyInput = (
  document.getElementById("append-x-numbers-to-y-words-number-quantity")
);
const appendXNumbersToYWordsWordQtyInput = (
  document.getElementById("append-x-numbers-to-y-words-word-quantity")
);
const appendSymbolsToPasswordsQtyInput = (
  document.getElementById("append-symbols-to-passwords-quantity")
);
const appendSymbolsToEachWordQtyInput = (
  document.getElementById("append-symbols-to-each-word-quantity")
);
const appendXSymbolsToYWordsSymbolQtyInput = (
  document.getElementById("append-x-symbols-to-y-words-symbol-quantity")
);
const appendXSymbolsToYWordsWordQtyInput = (
  document.getElementById("append-x-symbols-to-y-words-word-quantity")
);
const leetifyPasswordsLetterQtyInput = (
  document.getElementById("leetify-passwords-letter-quantity")
);
const leetifyPasswordsWordQtyInput = (
  document.getElementById("leetify-passwords-word-quantity")
);

const useCustomSeparatorCb = document.getElementById("use-custom-separator");
const filterSeparatorCb = document.getElementById("filter-separator");

const excludedWordsInput = document.getElementById("excluded-words-input");
const excludedCharactersInput = (
  document.getElementById("excluded-characters-input")
);

const wordsInputLabel = document.getElementById("words-input-label");
const quantityInputLabel = document.getElementById("quantity-input-label");
const appendNumbersToPasswordsLabel = (
  document.getElementById("append-numbers-to-passwords-label")
);
const appendNumbersToEachWordLabel = (
  document.getElementById("append-numbers-to-each-word-label")
);
const appendXNumbersToYWordsLabel = (
  document.getElementById("append-x-numbers-to-y-words-label")
);
const appendSymbolsToPasswordsLabel = (
  document.getElementById("append-symbols-to-passwords-label")
);
const appendSymbolsToEachWordLabel = (
  document.getElementById("append-symbols-to-each-word-label")
);
const appendXSymbolsToYWordsLabel = (
  document.getElementById("append-x-symbols-to-y-words-label")
);
const leetifyPasswordsLabel = (
  document.getElementById("leetify-passwords-label")
);

const outputPre = document.getElementById("output-pre");
const outputButtonsDiv = document.getElementById("output-buttons-div");

const statusDiv = document.getElementById("status-div");
const statusMessage = document.getElementById("status-message");

const aboutModal = document.getElementById("about-modal");
const closeAbout = document.getElementById("close-about");

const wordBankNames = (
  ["common", "extensive", "wordle", "lovecraft", "shakespeare"]
);
const words = {};

const statusAlerts = [];

const leetMap = new Map([
  [ 'a', '@' ],
  [ 'b', '8' ],
  [ 'c', '(' ],
  [ 'd', ')' ],
  [ 'e', '3' ],
  [ 'f', '=' ],
  [ 'g', '6' ],
  [ 'h', '#' ],
  [ 'i', '!' ],
  [ 'j', ']' ],
  [ 'k', '<' ],
  [ 'l', '|' ],
  [ 'm', '{' ],
  [ 'n', '~' ],
  [ 'o', '0' ],
  [ 'p', '?' ],
  [ 'q', '9' ],
  [ 'r', '2' ],
  [ 's', '$' ],
  [ 't', '+' ],
  [ 'u', '[' ],
  [ 'v', '\\' ],
  [ 'w', '}' ],
  [ 'x', '*' ],
  [ 'y', '/' ],
  [ 'z', '%' ]
]);

if (!Array.prototype.distinct) {
  Array.prototype.distinct = function() {
    return [...new Set(this)];
  };
} else {
  throw new Error("Array.prototype.distinct already exists");
}

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

function getRandomInt(max) {
  return Math.floor(random() * max);
}

function getRandomNumber() {
  return getRandomInt(10);
}

function getRandomSymbol() {
  const symbols = "!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~";
  
  return symbols[getRandomInt(symbols.length)];
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function* genPass(config) {
  const exclusions = config.excludedWords.concat(config.excludedCharacters);
  
  function getSeparator() {
    if (config.useCustomSeparator) return config.customSeparator;
    
    switch (config.casing) {
      case "kebab":
        return "-";
      case "snake":
        return "_";
      default:
        return "";
      //end of cases
    }
  }
  
  function filterExclusions(f) {
    let str = "";
    
    do {
      str = String(f());
    } while (exclusions.includes(str));
    
    return str;
  }
  
  function getXOfYIndexes(x, y) {
    const xIndexes = [], yIndexes = [];
    
    for (let i = 0; i < y; i++) yIndexes.push(i);
    
    while (xIndexes.length < x) {
      const yIndex = getRandomInt(yIndexes.length);
      const xIndex = yIndexes[yIndex];
      
      yIndexes.splice(yIndex, 1);
      xIndexes.push(xIndex);
    }
    
    return xIndexes;
  }
  
  if (config.filterSeparator) {
    const separator = getSeparator();
    
    if (
      separator !== ""
      && !exclusions.includes(separator)
    ) exclusions.push(separator);
  }
  
  //next password
  for (let i = 0; i < config.quantity; i++) {
    const prevIndexes = {}, wordsInPassword = [];
    const appendXNumbersToYWordsWordIndexes = (
      config.appendXNumbersToYWords
      ? getXOfYIndexes(config.appendXNumbersToYWordsWordQty, config.length)
      : []
    );
    const appendXSymbolsToYWordsWordIndexes = (
      config.appendXSymbolsToYWords
      ? getXOfYIndexes(config.appendXSymbolsToYWordsWordQty, config.length)
      : []
    );
    const leetifyPasswordsWordIndexes = (
      config.leetifyPasswords
      ? getXOfYIndexes(config.leetifyPasswordsWordQty, config.length)
      : []
    );
    
    for (const name of wordBankNames) prevIndexes[name] = [];
    
    //next word
    for (let i = 0; i < config.length; i++) {
      const bank = config.wordBanks[getRandomInt(config.wordBanks.length)];
      const prevBankIndexes = prevIndexes[bank];
      
      let index, word;
      
      do {
        word = (
          words[bank][index = getRandomInt(words[bank].length)].toLowerCase()
        );
      } while (
        prevBankIndexes.includes(index)
        || wordsInPassword.includes(word)
        || exclusions.includes(word)
      );
      
      prevBankIndexes.push(index);
      wordsInPassword.push(word);
    }
    
    //casing and concatenation
    const pass = wordsInPassword.map((word, i, arr) => {
      let appendNumbersToEachWordQty = config.appendNumbersToEachWordQty;
      let appendSymbolsToEachWordQty = config.appendSymbolsToEachWordQty;
      let appendXNumbersToYWordsNumberQty = (
        config.appendXNumbersToYWordsNumberQty
      );
      let appendXSymbolsToYWordsSymbolQty = (
        config.appendXSymbolsToYWordsSymbolQty
      );
      const funcs = [];
      
      if (config.leetifyPasswords) {
        if (leetifyPasswordsWordIndexes.includes(i)) {
          const letterIndexes = (
            getXOfYIndexes(
              (
                config.leetifyPasswordsLetterQty <= word.length
                ? config.leetifyPasswordsLetterQty
                : word.length
              ),
              word.length
            )
          );
          const charArray = word.split("");
          
          for (const index of letterIndexes) {
            const char = charArray[index];
            const leetChar = leetMap.get(char);
            
            if (!exclusions.includes(leetChar)) charArray[index] = leetChar;
          }
          
          word = charArray.join("");
        }
      }
      
      if (config.appendNumbersToEachWord) {
        while (appendNumbersToEachWordQty-- > 0) {
          funcs.push(getRandomNumber);
        }
      }
      
      if (config.appendSymbolsToEachWord) {
        while (appendSymbolsToEachWordQty-- > 0) {
          funcs.push(getRandomSymbol);
        }
      }
      
      if (config.appendXNumbersToYWords) {
        if (appendXNumbersToYWordsWordIndexes.includes(i)) {
          while (appendXNumbersToYWordsNumberQty-- > 0) {
            funcs.push(getRandomNumber);
          }
        }
      }
      
      if (config.appendXSymbolsToYWords) {
        if (appendXSymbolsToYWordsWordIndexes.includes(i)) {
          while (appendXSymbolsToYWordsSymbolQty-- > 0) {
            funcs.push(getRandomSymbol);
          }
        }
      }
      
      shuffleArray(funcs);
      
      for (const func of funcs) word += filterExclusions(func);
      
      if (config.capitalizeEachWord) return capitalize(word);
      
      if (config.capitalizePasswords && i === 0) return capitalize(word);
      
      switch (config.casing) {
        case "camel":
          return ((i > 0) ? capitalize(word) : word);
        case "pascal":
          return capitalize(word);
        default:
          return word;
        //end of cases
      }
    }).join(getSeparator()).concat(
      (() => {
        let appendNumbersToPasswordsQty = config.appendNumbersToPasswordsQty;
        let appendSymbolsToPasswordsQty = config.appendSymbolsToPasswordsQty;
        let str = "";
        const funcs = [];
        
        if (config.appendNumbersToPasswords) {
          while (appendNumbersToPasswordsQty-- > 0) {
            funcs.push(getRandomNumber);
          }
        }
        
        if (config.appendSymbolsToPasswords) {
          while (appendSymbolsToPasswordsQty-- > 0) {
            funcs.push(getRandomSymbol);
          }
        }
        
        shuffleArray(funcs);
        
        for (const func of funcs) str += filterExclusions(func);
        
        return str;
      })(),
      ((i < (config.quantity - 1)) ? "\n" : "")
    );
    
    yield pass;
  }
}

function getPass(e) {
  e.preventDefault();
  
  const config = {
    length: Number(wordsInput.value),
    quantity: Number(quantityInput.value),
    casing: Array.from(radioButtons).find(button => button.checked).value,
    wordBanks: [],
    capitalizePasswords: capitalizePasswordsCb.checked,
    capitalizeEachWord: capitalizeEachWordCb.checked,
    appendNumbersToPasswords: appendNumbersToPasswordsCb.checked,
    appendNumbersToEachWord: appendNumbersToEachWordCb.checked,
    appendXNumbersToYWords: appendXNumbersToYWordsCb.checked,
    appendSymbolsToPasswords: appendSymbolsToPasswordsCb.checked,
    appendSymbolsToEachWord: appendSymbolsToEachWordCb.checked,
    appendXSymbolsToYWords: appendXSymbolsToYWordsCb.checked,
    leetifyPasswords: leetifyPasswordsCb.checked,
    useCustomSeparator: useCustomSeparatorCb.checked,
    customSeparator: customSeparatorInput.value,
    filterSeparator: filterSeparatorCb.checked,
    appendNumbersToPasswordsQty: +appendNumbersToPasswordsQtyInput.value,
    appendNumbersToEachWordQty: +appendNumbersToEachWordQtyInput.value,
    appendXNumbersToYWordsNumberQty: (
      +appendXNumbersToYWordsNumberQtyInput.value
    ),
    appendXNumbersToYWordsWordQty: +appendXNumbersToYWordsWordQtyInput.value,
    appendSymbolsToPasswordsQty: +appendSymbolsToPasswordsQtyInput.value,
    appendSymbolsToEachWordQty: +appendSymbolsToEachWordQtyInput.value,
    appendXSymbolsToYWordsSymbolQty: (
      +appendXSymbolsToYWordsSymbolQtyInput.value
    ),
    appendXSymbolsToYWordsWordQty: +appendXSymbolsToYWordsWordQtyInput.value,
    leetifyPasswordsLetterQty: +leetifyPasswordsLetterQtyInput.value,
    leetifyPasswordsWordQty: +leetifyPasswordsWordQtyInput.value,
    excludedWords: (
      excludedWordsInput
      .value
      .split(",")
      .map(w => w.trim())
      .map(w => w.toLowerCase())
      .distinct()
    ),
    excludedCharacters: (
      excludedCharactersInput
      .value
      .split("")
      .map(w => w.trim())
      .filter(c => c !== "")
      .distinct()
    ),
  };
  
  if (commonWordBankCb.checked) config.wordBanks.push("common");
  if (extensiveWordBankCb.checked) config.wordBanks.push("extensive");
  if (wordleWordBankCb.checked) config.wordBanks.push("wordle");
  if (lovecraftWordBankCb.checked) config.wordBanks.push("lovecraft");
  if (shakespeareWordBankCb.checked) config.wordBanks.push("shakespeare");
  
  //clear previous passwords
  outputPre.textContent = "";
  
  //exhaust iterator from generator
  for (let pass of genPass(config)) {
    outputPre.textContent += pass;
  }
}

function checkConfig(e) {
  if (Number(wordsInput.value) < 1) {
    if (!statusAlerts.find(alert => alert.id === 1)) {
      statusAlerts.push({ id: 1, message: "Minimum words per password is 1" });
      wordsInputLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 1)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 1), 1);
      wordsInputLabel.style.color = "";
    }
  }
  
  if (Number(quantityInput.value) < 1) {
    if (!statusAlerts.find(alert => alert.id === 2)) {
      statusAlerts.push({ id: 2, message: "Minimum number of passwords is 1" });
      quantityInputLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 2)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 2), 1);
      quantityInputLabel.style.color = "";
    }
  }
  
  if (
    Array.from(document.querySelectorAll(".word-bank-checkbox"))
    .filter(cb => cb.checked)
    .length === 0
  ) {
    if (!statusAlerts.find(alert => alert.id === 3)) {
      statusAlerts.push({ id: 3, message: "No word banks selected" });
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 3)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 3), 1);
    }
  }
  
  if (
    appendNumbersToPasswordsCb.checked
    && Number(appendNumbersToPasswordsQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 4)) {
      statusAlerts.push({
        id: 4,
        message: "Must append 1 or more numbers to passwords"
      });
      appendNumbersToPasswordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 4)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 4), 1);
      appendNumbersToPasswordsLabel.style.color = "";
    }
  }
  
  if (
    appendNumbersToEachWordCb.checked
    && Number(appendNumbersToEachWordQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 5)) {
      statusAlerts.push({
        id: 5,
        message: "Must append 1 or more numbers to each word"
      });
      appendNumbersToEachWordLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 5)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 5), 1);
      appendNumbersToEachWordLabel.style.color = "";
    }
  }
  
  if (
    appendSymbolsToPasswordsCb.checked
    && Number(appendSymbolsToPasswordsQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 6)) {
      statusAlerts.push({
        id: 6,
        message: "Must append 1 or more symbols to passwords"
      });
      appendSymbolsToPasswordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 6)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 6), 1);
      appendSymbolsToPasswordsLabel.style.color = "";
    }
  }
  
  if (
    appendSymbolsToEachWordCb.checked
    && Number(appendSymbolsToEachWordQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 7)) {
      statusAlerts.push({
        id: 7,
        message: "Must append 1 or more symbols to each word"
      });
      appendSymbolsToEachWordLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 7)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 7), 1);
      appendSymbolsToEachWordLabel.style.color = "";
    }
  }
  
  if (
    appendXNumbersToYWordsCb.checked
    && Number(appendXNumbersToYWordsNumberQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 8)) {
      statusAlerts.push({
        id: 8,
        message: "Must append 1 or more numbers to each random word"
      });
      appendXNumbersToYWordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 8)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 8), 1);
      if (
        !statusAlerts.some(alert => alert.id === 8)
        && !statusAlerts.some(alert => alert.id === 9)
        && !statusAlerts.some(alert => alert.id === 10)
      ) {
        appendXNumbersToYWordsLabel.style.color = "";
      }
    }
  }
  
  if (
    appendXNumbersToYWordsCb.checked
    && Number(appendXNumbersToYWordsWordQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 9)) {
      statusAlerts.push({
        id: 9,
        message: "Minimum of 1 or more random words for numbers"
      });
      appendXNumbersToYWordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 9)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 9), 1);
      if (
        !statusAlerts.some(alert => alert.id === 8)
        && !statusAlerts.some(alert => alert.id === 9)
        && !statusAlerts.some(alert => alert.id === 10)
      ) {
        appendXNumbersToYWordsLabel.style.color = "";
      }
    }
  }
  
  if (
    appendXNumbersToYWordsCb.checked
    && (
      Number(appendXNumbersToYWordsWordQtyInput.value)
      > Number(wordsInput.value)
    )
  ) {
    if (!statusAlerts.find(alert => alert.id === 10)) {
      statusAlerts.push({
        id: 10,
        message: (
          `Limit of ${Number(wordsInput.value)} random words for numbers`
        ),
      });
      appendXNumbersToYWordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 10)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 10), 1);
      if (
        !statusAlerts.some(alert => alert.id === 8)
        && !statusAlerts.some(alert => alert.id === 9)
        && !statusAlerts.some(alert => alert.id === 10)
      ) {
        appendXNumbersToYWordsLabel.style.color = "";
      }
    }
  }
  
  if (
    appendXSymbolsToYWordsCb.checked
    && Number(appendXSymbolsToYWordsSymbolQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 11)) {
      statusAlerts.push({
        id: 11,
        message: "Must append 1 or more symbols to each random word"
      });
      appendXSymbolsToYWordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 11)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 11), 1);
      if (
        !statusAlerts.some(alert => alert.id === 11)
        && !statusAlerts.some(alert => alert.id === 12)
        && !statusAlerts.some(alert => alert.id === 13)
      ) {
        appendXSymbolsToYWordsLabel.style.color = "";
      }
    }
  }
  
  if (
    appendXSymbolsToYWordsCb.checked
    && Number(appendXSymbolsToYWordsWordQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 12)) {
      statusAlerts.push({
        id: 12,
        message: "Minimum of 1 or more random words for symbols"
      });
      appendXSymbolsToYWordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 12)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 12), 1);
      if (
        !statusAlerts.some(alert => alert.id === 11)
        && !statusAlerts.some(alert => alert.id === 12)
        && !statusAlerts.some(alert => alert.id === 13)
      ) {
        appendXSymbolsToYWordsLabel.style.color = "";
      }
    }
  }
  
  if (
    appendXSymbolsToYWordsCb.checked
    && (
      Number(appendXSymbolsToYWordsWordQtyInput.value)
      > Number(wordsInput.value)
    )
  ) {
    if (!statusAlerts.find(alert => alert.id === 13)) {
      statusAlerts.push({
        id: 13,
        message: (
          `Limit of ${Number(wordsInput.value)} random words for symbols`
        ),
      });
      appendXSymbolsToYWordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 13)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 13), 1);
      if (
        !statusAlerts.some(alert => alert.id === 11)
        && !statusAlerts.some(alert => alert.id === 12)
        && !statusAlerts.some(alert => alert.id === 13)
      ) {
        appendXSymbolsToYWordsLabel.style.color = "";
      }
    }
  }
  
  if (
    leetifyPasswordsCb.checked
    && Number(leetifyPasswordsLetterQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 14)) {
      statusAlerts.push({
        id: 14,
        message: "Minimum number of letters to leetify is 1"
      });
      leetifyPasswordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 14)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 14), 1);
      if (
        !statusAlerts.some(alert => alert.id === 14)
        && !statusAlerts.some(alert => alert.id === 15)
        && !statusAlerts.some(alert => alert.id === 16)
      ) {
        leetifyPasswordsLabel.style.color = "";
      }
    }
  }
  
  if (
    leetifyPasswordsCb.checked
    && Number(leetifyPasswordsWordQtyInput.value) < 1
  ) {
    if (!statusAlerts.find(alert => alert.id === 15)) {
      statusAlerts.push({
        id: 15,
        message: "Minimum number of words to leetify is 1"
      });
      leetifyPasswordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 15)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 15), 1);
      if (
        !statusAlerts.some(alert => alert.id === 14)
        && !statusAlerts.some(alert => alert.id === 15)
        && !statusAlerts.some(alert => alert.id === 16)
      ) {
        leetifyPasswordsLabel.style.color = "";
      }
    }
  }
  
  if (
    leetifyPasswordsCb.checked
    && Number(leetifyPasswordsWordQtyInput.value) > Number(wordsInput.value)
  ) {
    if (!statusAlerts.find(alert => alert.id === 16)) {
      statusAlerts.push({
        id: 16,
        message: (
          `Maximum number of words to leetify is ${Number(wordsInput.value)}`
        ),
      });
      leetifyPasswordsLabel.style.color = "red";
    }
  } else {
    if (statusAlerts.find(alert => alert.id === 16)) {
      statusAlerts.splice(statusAlerts.findIndex(alert => alert.id === 16), 1);
      if (
        !statusAlerts.some(alert => alert.id === 14)
        && !statusAlerts.some(alert => alert.id === 15)
        && !statusAlerts.some(alert => alert.id === 16)
      ) {
        leetifyPasswordsLabel.style.color = "";
      }
    }
  }
  
  if (statusAlerts.length > 0) {
    genButton.disabled = true;
    
    statusMessage.textContent = statusAlerts.map(a => a.message).join("\n");
    
    statusDiv.style.color = "red";
    statusDiv.style.bottom = "5px";
  } else {
    genButton.disabled = false;
    
    statusDiv.style.color = "green";
    
    statusMessage.textContent = "OK";
    
    setTimeout(function() {
      if (statusAlerts.length === 0) statusDiv.style.bottom = "-300px";
    }, 500);
  }
}

function copyToClipboard(e) {
  navigator.clipboard.writeText(outputPre.textContent).catch(
    err => showError(new Error(`Clipboard write operation failed: ${err}`))
  );
}

function clearOutput(e) {
  outputPre.textContent = "";
}

function toggleAbout(e) {
  const style = getComputedStyle(aboutModal).display;
  
  switch (style) {
    case "none":
      aboutModal.style.display = "block";
      break;
    case "block":
      aboutModal.style.display = "none";
      break;
    default:
      throw new Error("Unexpected display style");
  }
}

/*
 * set #outputButtons height manually because absolutely positioned elements
 * (its only children) are removed from flow
*/
outputButtonsDiv.style.height = Math.max(
  parseInt(
    getComputedStyle(document.getElementById("output-buttons-left")).height
  ),
  parseInt(
    getComputedStyle(document.getElementById("output-buttons-right")).height
  )
) + "px";

wordsInput.addEventListener("input", checkConfig, false);
quantityInput.addEventListener("input", checkConfig, false);

commonWordBankCb.addEventListener("change", checkConfig, false);
extensiveWordBankCb.addEventListener("change", checkConfig, false);
wordleWordBankCb.addEventListener("change", checkConfig, false);
lovecraftWordBankCb.addEventListener("change", checkConfig, false);
shakespeareWordBankCb.addEventListener("change", checkConfig, false);

appendNumbersToPasswordsCb.addEventListener("change", checkConfig, false);
appendNumbersToEachWordCb.addEventListener("change", checkConfig, false);
appendXNumbersToYWordsCb.addEventListener("change", checkConfig, false);
appendSymbolsToPasswordsCb.addEventListener("change", checkConfig, false);
appendSymbolsToEachWordCb.addEventListener("change", checkConfig, false);
appendXSymbolsToYWordsCb.addEventListener("change", checkConfig, false);
leetifyPasswordsCb.addEventListener("change", checkConfig, false);

appendNumbersToPasswordsQtyInput.addEventListener("input", checkConfig, false);
appendNumbersToEachWordQtyInput.addEventListener("input", checkConfig, false);
appendXNumbersToYWordsNumberQtyInput.addEventListener(
  "input", checkConfig, false
);
appendXNumbersToYWordsWordQtyInput.addEventListener(
  "input", checkConfig, false
);
appendSymbolsToPasswordsQtyInput.addEventListener("input", checkConfig, false);
appendSymbolsToEachWordQtyInput.addEventListener("input", checkConfig, false);
appendXSymbolsToYWordsSymbolQtyInput.addEventListener(
  "input", checkConfig, false
);
appendXSymbolsToYWordsWordQtyInput.addEventListener(
  "input", checkConfig, false
);
leetifyPasswordsLetterQtyInput.addEventListener("input", checkConfig, false);
leetifyPasswordsWordQtyInput.addEventListener("input", checkConfig, false);

genButton.addEventListener("click", getPass, false);
copyButton.addEventListener("click", copyToClipboard, false);
clearButton.addEventListener("click", clearOutput, false);

aboutButton.addEventListener("click", toggleAbout, false);
closeAbout.addEventListener("click", toggleAbout, false);

useCustomSeparatorCb.addEventListener("change", event => {
  if (useCustomSeparatorCb.checked) {
    kebabCasingButton.disabled = true;
    snakeCasingButton.disabled = true;
    
    if (kebabCasingButton.checked || snakeCasingButton.checked) {
      flatCasingButton.click();
    }
  } else {
    kebabCasingButton.disabled = false;
    snakeCasingButton.disabled = false;
  }
}, false);

window.addEventListener("click", event => {
  if (event.target === aboutModal) toggleAbout(event);
}, false);

async function initWordBank(name) {
  const response = await fetch(`./assets/${name}.json`);
  const words = JSON.parse(await response.text());
  
  return words;
}

async function initWordBanks() {
  for (const name of wordBankNames) words[name] = await initWordBank(name);
}

initWordBanks().catch(err => {
  console.error(err);
  statusAlerts.push({ id: 0, message: "Network error getting word banks" });
});

checkConfig(new CustomEvent("init"));
