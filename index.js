/*
Copyright 2023, 2026 Nicholas D. Horne

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

function demoAtBottomListItemFactory(href) {
  const listItem = document.createElement("li");
  
  listItem.classList.add("demo-list-item");
  
  if (!href) {
    listItem.innerHTML =
      "Interactive demonstration available at the bottom of this page"
    ;
  } else {
    listItem.innerHTML = "Interactive demonstration available at ";
    
    const demoListItemAnchor = document.createElement("a");
    
    demoListItemAnchor.href = href;
    demoListItemAnchor.text = "the bottom of this page";
    
    listItem.appendChild(demoListItemAnchor);
  }
  
  return listItem;
}

function insertBeforeElementId(element, existingElementId) {
  const existingElement = document.getElementById(existingElementId);
  
  existingElement.parentNode.insertBefore(element, existingElement);
}

if (document.getElementById("quote")) {
  insertBeforeElementId(
    demoAtBottomListItemFactory("#quote"),
    "random-quotes-source-code-list-item"
  );
}

if (document.getElementById("ball")) {
  insertBeforeElementId(
    demoAtBottomListItemFactory("#ball"),
    "bouncing-ball-source-code-list-item"
  );
}

const lastVisit = JSON.parse(localStorage.getItem('lastVisit'));
    
let totalVisits = +JSON.parse(localStorage.getItem('totalVisits'));

totalVisits++;

if (lastVisit) {
  /*
  const headline = document.getElementById('headline');
  const str = headline.textContent;
  
  headline.textContent = `${str.slice(0, 7)} back ${str.slice(8)}`;
  */
  
  console.log('Welcome back!');
  console.log(`Last visit: ${new Date(lastVisit).toString()}`);
} else {
  console.log('Welcome!');
  localStorage.setItem('firstVisit', JSON.stringify(new Date()));
}

const firstVisit = JSON.parse(localStorage.getItem('firstVisit'));

console.log(
  `Visits since ${new Date(firstVisit).toString()}: ${totalVisits}`
);

if (totalVisits === 1) {
  localStorage.setItem('lastVisit', JSON.stringify(firstVisit));
} else {
  localStorage.setItem('lastVisit', JSON.stringify(new Date()));
}

localStorage.setItem('totalVisits', JSON.stringify(totalVisits));
