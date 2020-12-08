/*
Copyright 2020 Nicholas D. Horne

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
quoteElement.style.maxWidth =
  containerElement.getBoundingClientRect().width * 0.95 + "px";

footerElement.style.display = "inline";

async function setQuote(index) {
  try {
    let response = await fetch("quotes.json");
    let quotes = JSON.parse(await response.text());
    
    if (typeof index != "number"
        || index < 0
        || index >= quotes.length) {
      index = Math.floor(Math.random() * quotes.length);
    }
    
    let quote = quotes[index];
    
    qElement.innerHTML = quote.quote;
    footerElement.innerHTML = "— " + quote.author;
    
    
    if (quote.source) {
      citeElement.innerHTML = quote.source;
      footerElement.innerHTML += ", ";
      footerElement.appendChild(citeElement);
    }
    
    if (quote.date) {
      footerElement.innerHTML += ", " + quote.date;
    }
    
    quoteElement.style.width = "";
    quoteElement.style.width = Math.max(
      qElement.getBoundingClientRect().width,
      footerElement.getBoundingClientRect().width) + "px";
    quoteElement.style.visibility = "visible";
    
    index = ++index % quotes.length;
    
    //setTimeout(() => setQuote(index), 15000);
  } catch (e) {
    console.error(e);
    quoteElement.remove();
  }
}

setQuote();
