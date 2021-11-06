/*
Copyright 2020, 2021 Nicholas D. Horne

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

let containerElement = document.getElementById("container");
let quoteElement = document.getElementById("quote");
let qElement = document.createElement("q");
let footerElement = document.createElement("footer");
let citeElement = document.createElement("cite");

quoteElement.appendChild(qElement);
quoteElement.appendChild(document.createElement("br"));
quoteElement.appendChild(footerElement);

quoteElement.style.visibility = "hidden";
quoteElement.style.marginLeft = "auto";
quoteElement.style.marginRight = "auto";
quoteElement.style.padding = 15 + "px";
quoteElement.style.borderRadius = 10 + "px";
quoteElement.style.backgroundColor = "whitesmoke";
quoteElement.style.fontFamily = "Arial, Helvetica, sans-serif";
quoteElement.style.maxWidth =
  containerElement.getBoundingClientRect().width * 0.95 + "px";

quoteElement.title =
  "Ajax Ephemeral Random Quotes Demonstration " +
  "(scrollable w/ mouse wheel)";

footerElement.style.display = "inline";

function isCharAtEnd(str, char) {
  if (typeof(str) != "string" || typeof(char) != "string") {
    console.error("One or more arguments invalid,",
      "strings expected at both parameters, returning false.");
    
    //no match so return false
    return false;
  }
  
  if (char.length > 1) {
    console.error("Single character expected at second parameter,",
      "only using first character of supplied string argument.");
  }
  
  let regEx = new RegExp(char[0]);
  
  return regEx.test(str.slice(-1));
}

function buildName(nameObj) {
  let nameStr = "";
  
  if (nameObj.prefix) {
    nameStr += nameObj.prefix;
  }
  
  if (nameObj.first) {
    if (nameStr) {
      nameStr += isCharAtEnd(nameStr, " ") ? "" : " ";
    }
    
    nameStr += nameObj.first;
  }
  
  if (nameObj.middle) {
    if (typeof nameObj.middle == "string") {
      if (nameStr) {
        nameStr += isCharAtEnd(nameStr, " ") ? "" : " ";
      }
      
      nameStr +=  nameObj.middle;
    } else if (typeof nameObj.middle == "object") {
      for (let middleName of nameObj.middle) {
        if (nameStr) {
          nameStr += isCharAtEnd(nameStr, " ") ? "" : " ";
        }
        
        nameStr += middleName;
      }
    }
  }
  
  if (nameObj.last) {
    if (nameStr) {
      nameStr += isCharAtEnd(nameStr, " ") ? "" : " ";
    }
    
    nameStr += nameObj.last;
  }
  
  nameStr = nameStr.trim();
  nameStr = nameStr.replace(/\b(\w)\b/g, "$1.");
  nameStr = nameStr.replace(/ {2,}/g, " ");
  
  return nameStr;
}

function buildDate(dateObj) {
  let dateStr = "";
  
  if (dateObj.day) {
    dateStr += dateObj.day;
  }
  
  if (dateObj.month) {
    if (dateStr) {
      dateStr += isCharAtEnd(dateStr, " ") ? "" : " ";
    }
    
    dateStr += dateObj.month;
  }
  
  if (dateObj.year) {
    if (dateStr) {
      dateStr += isCharAtEnd(dateStr, " ") ? "" : " ";
    }
    
    dateStr += dateObj.year;
  }
  
  dateStr = dateStr.trim();
  dateStr = dateStr.replace(/ {2,}/g, " ");
  
  return dateStr;
}

async function initQuotes() {
  try {
    let response = await fetch("quotes.json");
    let quotes = JSON.parse(await response.text());
    let index, quoteTimeout, previousIndices = [];
    
    return {
      setQuote: function(indexArg) {
        if (typeof indexArg != "number"
            || indexArg < 0
            || indexArg >= quotes.length) {
          if (previousIndices.length == quotes.length) {
            previousIndices = [];
          }
          
          let randomIndex;
          
          do {
            randomIndex = Math.floor(Math.random() * quotes.length);
          } while (previousIndices.includes(randomIndex));
          
          previousIndices.push(randomIndex);
          index = randomIndex;
        } else {
          index = indexArg;
        }
        
        let quote = quotes[index];
        
        quoteElement.style.visibility = "hidden";
        
        qElement.innerHTML = quote.quote;
        
        if (quote.author) {
          if (quote.author.name) {
            footerElement.innerHTML = "— " +
              buildName(quote.author.name);
          }
        }
        
        if (quote.source) {
          if (quote.source.title) {
            citeElement.innerHTML = quote.source.title;
            footerElement.innerHTML += ", ";
            footerElement.appendChild(citeElement);
          }
          
          if (quote.source.date) {
            footerElement.innerHTML += ", " +
              buildDate(quote.source.date);
          }
        }
        
        if (quote.note) {
          footerElement.innerHTML += " (" + quote.note + ")";
        }
        
        quoteElement.style.width = "";
        quoteElement.style.width = Math.max(
          qElement.getBoundingClientRect().width,
          footerElement.getBoundingClientRect().width) + "px";
        quoteElement.style.visibility = "visible";
      },
      scrollQuote: function(event) {
        event.preventDefault();
        clearTimeout(quoteTimeout);
        
        if (event.deltaY < 0) {
          this.setQuote(
            (--index < 0)
            ? index += quotes.length
            : index % quotes.length
          );
        } else {
          this.setQuote(
            ++index % quotes.length
          );
        }
        
        this.setQuoteTimeout();
      },
      setQuoteTimeout: function() {
        quoteTimeout = setTimeout(() => {
          //random quotes
          this.setQuote();
          
          //sequential quotes
          //this.setQuote(++index % quotes.length);
          
          this.setQuoteTimeout();
        }, 15000);
      }
    };
  } catch (e) {
    console.error(e);
    quoteElement.remove();
  }
}

initQuotes().then(function(result) {
  let boundScrollQuote = result.scrollQuote.bind(result);
  quoteElement.addEventListener("wheel", boundScrollQuote, false);
  result.setQuote();
  result.setQuoteTimeout();
});
