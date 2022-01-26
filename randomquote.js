/*
Copyright 2020, 2021, 2022 Nicholas D. Horne

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

const containerElement = document.getElementById("container");
const quoteElement = document.getElementById("quote");
const quoteInnerContainer = document.createElement("div");
const qElement = document.createElement("q");
const footerElement = document.createElement("footer");
const citeElement = document.createElement("cite");

let inTransition = false;

quoteInnerContainer.appendChild(qElement);
quoteInnerContainer.appendChild(document.createElement("br"));
quoteInnerContainer.appendChild(footerElement);

quoteElement.appendChild(quoteInnerContainer);

quoteElement.style.marginLeft = "auto";
quoteElement.style.marginRight = "auto";
quoteElement.style.textAlign = "center";
quoteElement.style.padding = 15 + "px";
quoteElement.style.borderRadius = 10 + "px";
quoteElement.style.transitionDuration = "0.5s";
quoteElement.style.backgroundColor = "whitesmoke";
quoteElement.style.fontFamily = "Arial, Helvetica, sans-serif";
quoteElement.style.maxWidth =
  containerElement.getBoundingClientRect().width * 0.95 + "px"
;

quoteElement.title =
  "Ajax Ephemeral Random Quotes Demonstration "
  + "(scrollable w/ mouse wheel)"
;

quoteInnerContainer.style.display = "inline-block";
quoteInnerContainer.style.textAlign = "left";

footerElement.style.display = "inline";

function isCharAtEnd(str, char) {
  if (typeof(str) != "string" || typeof(char) != "string") {
    console.error(
      "One or more arguments invalid,",
      "strings expected at both parameters, returning false."
    );
    
    //no match so return false
    return false;
  }
  
  if (char.length > 1) {
    console.error(
      "Single character expected at second parameter,",
      "only using first character of supplied string argument."
    );
  }
  
  const regEx = new RegExp(char[0]);
  
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

function buildFooter(quoteObj) {
  const foot = document.createElement("footer");
  const cite = document.createElement("cite");
  
  if (quoteObj.author) {
    if (quoteObj.author.name) {
      foot.innerHTML = "— " +
        buildName(quoteObj.author.name);
    }
  }
  
  if (quoteObj.source) {
    if (quoteObj.source.title) {
      cite.innerHTML = quoteObj.source.title;
      foot.innerHTML += ", ";
      foot.appendChild(cite);
    }
    
    if (quoteObj.source.date) {
      foot.innerHTML += ", " +
        buildDate(quoteObj.source.date);
    }
  }
  
  if (quoteObj.note) {
    foot.innerHTML += " (" + quoteObj.note + ")";
  }
  
  return foot;
}

function getStage(quoteObj) {
  const qStaged = document.createElement("q");
  const footStaged = document.createElement("footer");
  const stagingElement = document.createElement("div");
  
  stagingElement.style.position = "absolute";
  stagingElement.style.left = "-5000px";
  stagingElement.style.display = "inline-block";
  stagingElement.style.padding = quoteElement.style.padding;
  stagingElement.style.maxWidth = quoteElement.style.maxWidth;
  
  qStaged.innerHTML = quoteObj.quote;
  footStaged.innerHTML = buildFooter(quoteObj).innerHTML;
  
  stagingElement.appendChild(qStaged);
  stagingElement.appendChild(document.createElement("br"));
  stagingElement.appendChild(footStaged);
  
  return {
    getStageWidth: function() {
      let width;
      
      document.body.appendChild(stagingElement);
      width = stagingElement.getBoundingClientRect().width;
      stagingElement.remove();
      
      return width;
    },
    getQuoteWidth: function() {
      let width;
      
      document.body.appendChild(stagingElement);
      width = qStaged.getBoundingClientRect().width;
      stagingElement.remove();
      
      return width;
    },
    getFooterWidth: function() {
      let width;
      
      document.body.appendChild(stagingElement);
      width = footStaged.getBoundingClientRect().width;
      stagingElement.remove();
      
      return width;
    }
  };
}

async function initQuotes(timeout = 15000, isEphemeral = true) {
  try {
    const response = await fetch("quotes.json");
    const quotes = JSON.parse(await response.text());
    let index, quoteTimeout, previousIndices = [];
    
    //public API
    return {
      setQuote: function(indexArg) {
        inTransition = true;
        
        if (
          typeof indexArg != "number"
          || indexArg < 0
          || indexArg >= quotes.length
        ) {
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
        
        const quoteObj = quotes[index];
        
        if (
          quoteElement.getBoundingClientRect().width
          > getStage(quoteObj).getStageWidth()
        ) {
          function update() {
            quoteElement.removeEventListener("transitionend", update);
            inTransition = false;
          }
          
          quoteElement.addEventListener("transitionend", update);
          
          qElement.innerHTML = quoteObj.quote;
          footerElement.innerHTML = buildFooter(quoteObj).innerHTML;
        } else {
          function update() {
            qElement.innerHTML = quoteObj.quote;
            footerElement.innerHTML = buildFooter(quoteObj).innerHTML;
            quoteElement.removeEventListener("transitionend", update);
            inTransition = false;
          }
          
          quoteElement.addEventListener("transitionend", update);
        }
        
        quoteElement.style.width = Math.max(
          getStage(quoteObj).getQuoteWidth(),
          getStage(quoteObj).getFooterWidth()
        ) + "px";
      },
      scrollQuote: function(event) {
        event.preventDefault();
        
        if (!inTransition) {
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
          
          if (isEphemeral) {
            this.setQuoteTimeout();
          }
        }
      },
      setQuoteTimeout: function() {
        if (isEphemeral) {
          quoteTimeout = setTimeout(() => {
            //random quotes
            this.setQuote();
            
            //sequential quotes
            //this.setQuote(++index % quotes.length);
            
            this.setQuoteTimeout();
          }, timeout);
        }
      }
    };
  } catch (e) {
    console.error(e);
    quoteElement.remove();
  }
}

initQuotes().then(function(quoteAPI) {
  const boundScrollQuote = quoteAPI.scrollQuote.bind(quoteAPI);
  quoteElement.addEventListener("wheel", boundScrollQuote, false);
  quoteAPI.setQuote();
  quoteAPI.setQuoteTimeout();
});
