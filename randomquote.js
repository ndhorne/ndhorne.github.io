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

quoteElement.appendChild(qElement);
quoteElement.appendChild(footerElement);

quoteElement.style.visibility = "hidden";
quoteElement.style.marginLeft = "auto";
quoteElement.style.marginRight = "auto";
quoteElement.style.padding = 15 + "px";
quoteElement.style.borderRadius = 10 + "px";
quoteElement.style.backgroundColor = "whitesmoke";
quoteElement.style.maxWidth =
  containerElement.getBoundingClientRect().width * 0.95 + "px";

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
    
    qElement.textContent = quote.quote;
    footerElement.textContent = "— " + quote.author;
    
    quoteElement.style.width = "";
    quoteElement.style.width =
      qElement.getBoundingClientRect().width + "px";
    quoteElement.style.visibility = "visible";
    
    index = ++index % quotes.length;
    
    //setTimeout(() => setQuote(index), 15000);
  } catch (e) {
    console.error(e);
    quoteElement.remove();
  }
}

setQuote();
