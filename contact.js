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

let labels = document.getElementsByTagName("label");
labels = Array.from(labels);

let labelWidth = labels.reduce(function(maxWidth, label) {
  return Math.max(maxWidth, label.getBoundingClientRect().width);
}, 0);

labels.forEach(function(label) {
  label.style.width = labelWidth + "px";
});

window.addEventListener("unload", function(event) {
  let resetButton = document.getElementById("reset");
  resetButton.click();
});
