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

let quotes = [];

quotes.push(
  {
    quote: "If you don't know anything about computers, just remember "+
      "that they are machines that do exactly what you tell them but " +
      "often surprise you in the result.",
    author: "Richard Dawkins"
  },
  {
    quote: "Some people, when confronted with a problem, think \‘I " +
      "know, I\’ll use regular expressions.\’ Now they have two " +
      "problems.",
    author: "Jamie Zawinski"
  },
  {
    quote: "A user interface is like a joke. If you have to explain " +
    "it, it's not that good.",
    author: "Martin LeBlanc"
  },
  {
    quote: "A computer will do what you tell it to do, but that may " +
    "be much different from what you had in mind.",
    author: "Joseph Weizenbaum"
  },
  {
    quote: "Computers are like old testament gods; lots of rules and " +
    "no mercy.",
    author: "Joseph Campbell"
  },
  {
    quote: "Computers are useless. They can only give you answers.",
    author: "Pablo Picasso"
  }
);

let quoteElement = document.getElementById("quote");
let qElement = document.createElement("q");
let footerElement = document.createElement("footer");

quoteElement.appendChild(qElement);
quoteElement.appendChild(footerElement);

quoteElement.style.marginLeft = "auto";
quoteElement.style.marginRight = "auto";

function setQuote(index) {
  if (typeof index != "number"
      || index < 0
      || index >= quotes.length) {
    index = Math.floor(Math.random() * quotes.length);
  }
  
  let quote = quotes[index];
  
  quoteElement.style.width = "";
  
  qElement.textContent = quote.quote;
  footerElement.textContent = "— " + quote.author;
  
  quoteElement.style.width = qElement.offsetWidth + 1 + "px";
  
  index = ++index % quotes.length;
  
  //setTimeout(() => setQuote(index), 15000);
}

setQuote();
