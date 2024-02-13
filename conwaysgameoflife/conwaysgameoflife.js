/*
Copyright 2019, 2023, 2024 Nicholas D. Horne

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

class Matrix {
  constructor(width = 30, height = 15, element = (x, y) => false) {
    this.width = width;
    this.height = height;
    this.content = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.content[y * width + x] = element(x, y);
      }
    }
  }

  get(x, y) {
    return this.content[y * this.width + x];
  }
  
  set(x, y, value) {
    return this.content[y * this.width + x] = value;
  }
}

const markerGroups = {
  blackSquares: {
    live: String.fromCodePoint(0x2B1B),
    dead: String.fromCodePoint(0x2B1C)
  },
  redSquares: {
    live: String.fromCodePoint(0x1F7E5),
    dead: String.fromCodePoint(0x2B1C)
  },
  blueSquares: {
    live: String.fromCodePoint(0x1F7E6),
    dead: String.fromCodePoint(0x2B1C)
  },
  orangeSquares: {
    live: String.fromCodePoint(0x1F7E7),
    dead: String.fromCodePoint(0x2B1C)
  },
  yellowSquares: {
    live: String.fromCodePoint(0x1F7E8),
    dead: String.fromCodePoint(0x2B1C)
  },
  greenSquares: {
    live: String.fromCodePoint(0x1F7E9),
    dead: String.fromCodePoint(0x2B1C)
  },
  purpleSquares: {
    live: String.fromCodePoint(0x1F7EA),
    dead: String.fromCodePoint(0x2B1C)
  },
  brownSquares: {
    live: String.fromCodePoint(0x1F7EB),
    dead: String.fromCodePoint(0x2B1C)
  },
  flowers: {
    live: String.fromCodePoint(0x1F339),
    dead: String.fromCodePoint(0x1F940)
  },
  microbes: {
    live: String.fromCodePoint(0x1F9A0),
    dead: String.fromCodePoint(0x1F480)
  },
};

const container = document.getElementById("container");
const gridElement = document.getElementById("grid");
const autoGenerationButton = document.getElementById("auto");
const nextGenerationButton = document.getElementById("next");
const prevGenerationButton = document.getElementById("prev");
const intervalRange = document.getElementById("interval");
const markersSelect = document.getElementById("markers-select");
const squareMarkerColors = document.getElementById("square-marker-colors");
const squareMarkerColorSelect = (
  document.getElementById("square-marker-color-select")
);
const newGameButton = document.getElementById("new");
const startNewGameButton = document.getElementById("start-new-game");
const aboutButton = document.getElementById("about");

const widthInput = document.getElementById("width-input");
const heightInput = document.getElementById("height-input");
const markerSizeInput = document.getElementById("marker-size-input");

const newGameModal = document.getElementById("new-game-modal");
const closeNewGameModal = document.getElementById("close-new-game-modal");

const aboutModal = document.getElementById("about-modal");
const closeAboutModal = document.getElementById("close-about-modal");

const errorModal = document.getElementById("error-modal");
const closeErrorModal = document.getElementById("close-error-modal");
const errorMessage = document.getElementById("error-message");

let width = 30, height = 15;
let grid, gridHistory, auto, intervalId, markers, markerSize, tableElement;

function newGrid(width, height) {
  return new Matrix(width, height, (x, y) => Math.random() > .5 ? true : false);
}

function nextGen(grid) {
  const width = grid.width;
  const height = grid.height;
  
  const liveNeighbors = grid.content.map((_, i) => {
    let yStart = Math.floor(i / width) - 1;
    let yEnd = yStart + 3;
    let xStart = (i - (Math.floor(i / width) * width)) - 1;
    let xEnd = xStart + 3;
    let liveNeighbors = 0;
    
    while (yStart < 0) yStart++;
    while (xStart < 0) xStart++;
    while (yEnd > height) yEnd--;
    while (xEnd > width) xEnd--;
    
    for (let y = yStart; y < yEnd; y++) {
      if (y < 0) continue;
      if (y >= height) break;
      
      for (let x = xStart; x < xEnd; x++) {
        if (y * width + x === i || x < 0) continue;
        if (x >= width) break;
        if (grid.get(x, y)) liveNeighbors++;
      }
    }
    
    return liveNeighbors;
  });
  
  const newContent = grid.content.map((status, i) => {
    if (status === true && (liveNeighbors[i] < 2 || liveNeighbors[i] > 3))
      return false;
    if (status === true && (liveNeighbors[i] === 2 || liveNeighbors[i] === 3))
      return true;
    if (status === false && liveNeighbors[i] === 3)
      return true;
    else
      return status;
  });
  
  return new Matrix(width, height, (x, y) => newContent[y * width + x]);
}

function newTable(grid) {
  const width = grid.width;
  const height = grid.height;
  
  const tableElement = document.createElement("table");

  for (let y = 0; y < height; y++) {
    const row = document.createElement("tr");
    
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const marker = grid.get(x, y)
        ? document.createTextNode(markers.live)
        : document.createTextNode(markers.dead)
      ;
      const cell = document.createElement("td");
      
      cell.setAttribute("data-x", x);
      cell.setAttribute("data-y", y);
      cell.setAttribute("data-index", index);
      cell.setAttribute("id", "cell" + index);
      
      cell.appendChild(marker);
      row.appendChild(cell);
    }
    
    tableElement.appendChild(row);
  }
  
  Array.from(tableElement.querySelectorAll("td")).forEach(
    cell => cell.addEventListener(
      "click",
      () => {
        const x = +cell.dataset.x;
        const y = +cell.dataset.y;
        
        cell.childNodes[0].textContent = grid.set(x, y, !grid.get(x, y))
          ? markers.live
          : markers.dead
        ;
        
        if (!auto) {
          autoGenerationButton.disabled = false;
          nextGenerationButton.disabled = false;
        }
      },
      false
    )
  );
  
  return tableElement;
}

function updateTable() {
  if (tableElement) tableElement.remove();
  tableElement = newTable(grid);
  gridElement.appendChild(tableElement);
}

function updateGeneration() {
  gridHistory.push(grid);
  
  if (!auto) prevGenerationButton.disabled = false;
  
  grid = nextGen(grid);
  
  updateTable();
  
  const nextGrid = nextGen(grid);
  
  // if next grid matches current grid cease further generation
  if (nextGrid.content.every((status, i) => status === grid.content[i])) {
    if (auto) autoGenerationButton.click();
    
    autoGenerationButton.disabled = true;
    nextGenerationButton.disabled = true;
  }
}

function startAutoGeneration() {
  intervalId = setInterval(
    () => updateGeneration(),
    Number(intervalRange.value)
  );
}

function showErrorModal(e) {
  console.error(e.message);
  errorMessage.innerHTML = e.message;
  errorModal.style.display = "block";
}

function startNewGame() {
  width = +widthInput.value;
  height = +heightInput.value;
  markerSize = +markerSizeInput.value;
  
  try {
    [width, height, markerSize].forEach(value => {
      if (
        typeof value === "number" && (value <= 0 || Number.isNaN(value))
        || typeof value !== "number"
      ) {
        throw new Error(
          "Erroneous input encountered: number values > 0 expected"
        );
      }
    });
    
    switch(markersSelect.selectedIndex) {
      case 0:
        switch(squareMarkerColorSelect.selectedIndex) {
          case 0:
            markers = markerGroups["blackSquares"];
            break;
          case 1:
            markers = markerGroups["redSquares"];
            break;
          case 2:
            markers = markerGroups["blueSquares"];
            break;
          case 3:
            markers = markerGroups["orangeSquares"];
            break;
          case 4:
            markers = markerGroups["yellowSquares"];
            break;
          case 5:
            markers = markerGroups["greenSquares"];
            break;
          case 6:
            markers = markerGroups["purpleSquares"];
            break;
          case 7:
            markers = markerGroups["brownSquares"];
            break;
          default:
            throw new Error("Invalid square marker color selected");
          // end cases
        }
        break;
      case 1:
        markers = markerGroups["flowers"];
        break;
      case 2:
        markers = markerGroups["microbes"];
        break;
      default:
        throw new Error("Invalid markers group selected");
      // end cases
    }
  } catch (e) {
    showErrorModal(e);
    return;
  }
  
  if (auto) autoGenerationButton.click();
  
  gridHistory = [];
  
  autoGenerationButton.disabled = false;
  nextGenerationButton.disabled = false;
  prevGenerationButton.disabled = true;
  
  gridElement.style.fontSize = markerSize + "px";
  
  grid = newGrid(width, height);
  updateTable();
  
  newGameModal.style.display = "none";
}

autoGenerationButton.addEventListener("click", () => {
  if (!auto) {
    auto = true;
    nextGenerationButton.disabled = true;
    prevGenerationButton.disabled = true;
    autoGenerationButton.innerHTML = "Stop";
    autoGenerationButton.title = "Stop auto-generation";
    startAutoGeneration();
  } else {
    auto = false;
    clearInterval(intervalId);
    nextGenerationButton.disabled = false;
    if (gridHistory.length > 0) prevGenerationButton.disabled = false;
    autoGenerationButton.innerHTML = "Start";
    autoGenerationButton.title = "Start auto-generation";
  }
}, false);

nextGenerationButton.addEventListener("click", () => {
  updateGeneration();
}, false);

prevGenerationButton.addEventListener("click", () => {
  if (gridHistory.length > 0) {
    grid = gridHistory.pop();
    
    updateTable();
  }
  
  if (gridHistory.length === 0) prevGenerationButton.disabled = true;
  
  autoGenerationButton.disabled = false;
  nextGenerationButton.disabled = false;
}, false);

intervalRange.addEventListener("input", () => {
  if (auto) {
    clearInterval(intervalId);
    startAutoGeneration();
  }
}, false);

newGameButton.addEventListener("click", () => {
  newGameModal.style.display = "block";
  newGameButton.blur();
}, false);

startNewGameButton.addEventListener("click", () => {
  startNewGame();
}, false);

closeNewGameModal.addEventListener("click", () => {
  newGameModal.style.display = "none";
}, false);

aboutButton.addEventListener("click", () => {
  aboutModal.style.display = "block";
  aboutButton.blur();
}, false);

closeAboutModal.addEventListener("click", () => {
  aboutModal.style.display = "none";
}, false);

closeErrorModal.addEventListener("click", () => {
  errorModal.style.display = "none";
}, false);

window.addEventListener("click", (e) => {
  if (e.target === newGameModal) newGameModal.style.display = "none";
  
  if (e.target === aboutModal) aboutModal.style.display = "none";
  
  if (e.target === errorModal) errorModal.style.display = "none";
}, false);

markersSelect.addEventListener("input", () => {
  if (markersSelect.selectedIndex !== 0) {
    squareMarkerColors.classList.add("square-marker-colors-hidden");
  } else {
    squareMarkerColors.classList.remove("square-marker-colors-hidden");
  }
}, false);

squareMarkerColorSelect.addEventListener("input", () => {
  try {
    switch(squareMarkerColorSelect.selectedIndex) {
      case 0:
        markersSelect[0].innerHTML = "&#x2B1B";
        break;
      case 1:
        markersSelect[0].innerHTML = "&#x1F7E5";
        break;
      case 2:
        markersSelect[0].innerHTML = "&#x1F7E6";
        break;
      case 3:
        markersSelect[0].innerHTML = "&#x1F7E7";
        break;
      case 4:
        markersSelect[0].innerHTML = "&#x1F7E8";
        break;
      case 5:
        markersSelect[0].innerHTML = "&#x1F7E9";
        break;
      case 6:
        markersSelect[0].innerHTML = "&#x1F7EA";
        break;
      case 7:
        markersSelect[0].innerHTML = "&#x1F7EB";
        break;
      default:
        throw new Error("Invalid square marker color selected (input event)");
      // end cases
    }
    
    markersSelect[0].innerHTML += " Squares";
  } catch (e) {
    showErrorModal(e);
    return;
  }
}, false);

// game doesn't play well on a small grid, decrease glyph size instead
if (parseFloat(getComputedStyle(container).width) < 1140) {
  markerSize = Math.floor(parseFloat(getComputedStyle(container).width) / 57);
  gridElement.style.fontSize = markerSize + "px";
  
  // minimum font size fix (for android chrome via facebook messenger)
  if (markerSize < parseFloat(getComputedStyle(gridElement).fontSize)) {
    let i = parseFloat(getComputedStyle(gridElement).fontSize) - markerSize;
    
    for (; i > 0; i--) width--;
  }
}

widthInput.value = width;
heightInput.value = height;
intervalRange.value = 1000;
markerSizeInput.value = parseFloat(getComputedStyle(gridElement).fontSize);
markersSelect.selectedIndex = 0;
squareMarkerColorSelect.selectedIndex = 0;

startNewGame();
