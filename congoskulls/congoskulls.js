/*
Copyright 2021 Nicholas D. Horne

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

class Board {
  constructor(width, height, gridOption) {
    if (typeof(width) != "number" || typeof(height) != "number") {
      throw new Error("Numbers expected for width and height parameters.");
    }
    
    this.width = width;
    this.height = height;
    this.grid = new Array(width * height);
    this.gridOption = gridOption;
    this.moves = [];
    this.last;
  }
}

let boardElem = document.getElementById("board");
let aboutElem = document.getElementById("aboutButton");
let newGameElem = document.getElementById("newGameButton");
let howToPlayElem = document.getElementById("howToPlayButton");
let gridSelectElem = document.getElementById("gridSelect");
let player1SelectElem = document.getElementById("player1Select");
let player2SelectElem = document.getElementById("player2Select");
let happyFacesCheckbox = document.getElementById("happyFacesToggle");
let player1InputElem = document.getElementById("player1InputOptions");
let player2InputElem = document.getElementById("player2InputOptions");
let player1InputSelectElem = document.getElementById("player1InputSelect");
let player2InputSelectElem = document.getElementById("player2InputSelect");

let players = [
  {
    name: "Player 1",
    type: player1SelectElem.value,
    input: null
  },
  {
    name: "Player 2",
    type: player2SelectElem.value,
    input: player2InputSelectElem.value
  }
];

let pieces = {
  skull: [
    {
      face: String.fromCodePoint(0x1F480),
      classes: null
    },
    {
      face: String.fromCodePoint(0x1F480),
      classes: ["rotate360", "rotate-360"]
    },
    {
      face: String.fromCodePoint(0x1F480),
      classes: ["rotate90", "rotate-90"]
    }
  ],
  happyFace: [
    {
      face: String.fromCodePoint(0x1F603),
      classes: null
    },
    {
      face: String.fromCodePoint(0x1F61D),
      classes: ["rotate360", "rotate-360"]
    },
    {
      face: String.fromCodePoint(0x1F612),
      classes: ["rotate360", "rotate-360"]
    }
  ]
}

let boardObj, pitCells, turns, state, kbdIndex;
let totalGames = 0, player1Score = 0, player2Score = 0;
let selectColor = "cornflowerblue", nextMoveColor = "lavender";
let markers = pieces["skull"];
let marker = markers[0].face;
let newGameElemHighlightTimeout;

function clearNewGameElemHighlightTimeout() {
  clearTimeout(newGameElemHighlightTimeout);
  newGameElem.style.removeProperty("border");
}

function newOptionSelectedAdministrivia() {
  clearNewGameElemHighlightTimeout();
  
  if (
    boardObj.gridOption != gridSelectElem.selectedIndex
    || players[0].type != player1SelectElem.value
    || players[1].type != player2SelectElem.value
    || (
      players[0].type == "Human"
      && players[0].input != player1InputSelectElem.value
    )
    || (
      players[1].type == "Human"
      && players[1].input != player2InputSelectElem.value
    )
    || state != 0
  ) {
    highlightNewGameElem(500, "darkorange");
  }
}

player1SelectElem.addEventListener("change", event => {
  newOptionSelectedAdministrivia();
  
  if (event.target.value == "CPU") {
    player1InputElem.style.visibility = "hidden";
  } else {
    if (player2SelectElem.value == "Human") {
      if (player2InputSelectElem.selectedIndex == 0) {
        player1InputSelectElem.selectedIndex = 1;
      } else {
        player1InputSelectElem.selectedIndex = 0;
      }
    }
    player1InputElem.style.visibility = "visible";
  }
});

player2SelectElem.addEventListener("change", event => {
  newOptionSelectedAdministrivia();
  
  if (event.target.value == "CPU") {
    player2InputElem.style.visibility = "hidden";
  } else {
    if (player1SelectElem.value == "Human") {
      if (player1InputSelectElem.selectedIndex == 0) {
        player2InputSelectElem.selectedIndex = 1;
      } else {
        player2InputSelectElem.selectedIndex = 0;
      }
    }
    player2InputElem.style.visibility = "visible";
  }
});

player1InputSelectElem.addEventListener("change", event => {
  newOptionSelectedAdministrivia();
});

player2InputSelectElem.addEventListener("change", event => {
  newOptionSelectedAdministrivia();
});

gridSelectElem.addEventListener("change", event => {
  newOptionSelectedAdministrivia();
});

//blink border around new game button until timeout is cleared
function highlightNewGameElem(timeout, color) {
  (function foo(timeout) {
    newGameElemHighlightTimeout = setTimeout(function() {
      highlightElement(newGameElem, 0, color);
      
      newGameElemHighlightTimeout = setTimeout(function() {
        newGameElem.style.removeProperty("border");
        foo(timeout);
      }, timeout);
    }, timeout);
  })(timeout);
}

//highlights an element after a given timeout
function highlightElement(element, timeout, color) {  
  setTimeout(() => {
    element.style.border = "2px solid " + color;
  }, timeout);
}

function getBorderingIndicies(index) {
  let above =
    index - boardObj.width < 0
    || boardObj.grid[index - boardObj.width] == false
    ? null
    : index - boardObj.width
  ;
  
  let below =
    index + boardObj.width >= boardObj.grid.length
    || boardObj.grid[index + boardObj.width] == false
    ? null
    : index + boardObj.width
  ;
  
  let left =
    index % boardObj.width == 0
    || boardObj.grid[index - 1] == false
    ? null
    : index - 1
  ;
  
  let right =
    index % boardObj.width == boardObj.width - 1
    || boardObj.grid[index + 1] == false
    ? null
    : index + 1
  ;
  
  return [above, below, left, right].filter(element => element != null);
}

function getBorderingPieces(index) {
  return getBorderingIndicies(index).filter(
    index => boardObj.grid[index] == true
  );
}

function getAvailableMoves(index) {
  return getBorderingIndicies(index).filter(
    index => boardObj.grid[index] == undefined
  );
}

function mouseInputOn() {
  Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
    cell.addEventListener("click", mouseMove, false);
  });
}

function mouseInputOff() {
  Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
    cell.removeEventListener("click", mouseMove, false);
  });
}

function kbdInputOn() {
  if (boardObj.moves.length == 0) {
    document.addEventListener("keydown", kbdFirstMove, false);
  } else {
    document.addEventListener("keydown", kbdMove, false);
  }
}

function kbdInputOff() {
  document.removeEventListener("keydown", kbdFirstMove, false);
  document.removeEventListener("keydown", kbdMove, false);
}

function fillCellBackground(index, color) {
  document.getElementById("cell" + index).style.background = color;
}

function clearCellBackground(index) {
  document.getElementById("cell" + index).style.background = "";
}

function clearBorderingCellBackgrounds(index) {
  getBorderingIndicies(index).forEach(
    index => clearCellBackground(index)
  );
}

function mouseOver(event) {
  event.target.style.background = selectColor;
}

function mouseOut(event) {
  if (boardObj.moves.length == 0) {
    event.target.style.background = "";
  } else {
    event.target.style.background = nextMoveColor;
  }
}

function mouseOverOn(index) {
  if (
    boardObj.moves.length == 0
    && players[turns % players.length].input == "Mouse"
  ) {
    Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
      cell.addEventListener("mouseover", mouseOver, false);
    });
    Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
      cell.addEventListener("mouseout", mouseOut, false);
    });
  }
  
  if (Number.isInteger(+index)) {
    getAvailableMoves(index).forEach(
      index => document.getElementById(
        "cell" + index
      ).addEventListener(
        "mouseover", mouseOver, false
      )
    );
    
    getAvailableMoves(index).forEach(
      index => document.getElementById(
        "cell" + index
      ).addEventListener(
        "mouseout", mouseOut, false
      )
    );
  }
}

function mouseOverOff(index) {
  if (
    boardObj.moves.length == 0
    && players[turns % players.length].input == "Mouse"
  ) {
    Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
      cell.removeEventListener("mouseover", mouseOver, false);
    });
    Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
      cell.removeEventListener("mouseout", mouseOut, false);
    });
    document.getElementById("cell" + index).style.background = "";
  }
  
  if (boardObj.last != undefined) {
    getBorderingIndicies(boardObj.last).forEach(
      index => document.getElementById(
        "cell" + index
      ).removeEventListener(
        "mouseover", mouseOver, false
      )
    );
    
    getBorderingIndicies(boardObj.last).forEach(
      index => document.getElementById(
        "cell" + index
      ).removeEventListener(
        "mouseout", mouseOut, false
      )
    );
  }
}

function highlightMoves(index, color) {
  if (boardObj.moves.length > 0) {
    clearBorderingCellBackgrounds(boardObj.last);
  }
  
  if (getBorderingPieces(index).length <= 1) {
    getAvailableMoves(index).forEach(
      index => fillCellBackground(index, color)
    );
  }
}

function move(index) {
  let timeout;
  
  function setMark() {
    mouseOverOff(index);
    mouseInputOff();
    kbdInputOff();
    
    boardObj.grid[index] = true;
    document.getElementById("cell" + index).innerHTML = marker;
    boardObj.moves.push(index);
    boardObj.last = index;
    turns++;
  }
  
  let borderingPieces = getBorderingPieces(index);
  
  if (boardObj.grid[index] == false) {
    pitDialog();
    return;
  } else if (boardObj.last == undefined) {
    setMark();
    highlightMoves(index, nextMoveColor);
  } else if (!borderingPieces.includes(boardObj.last)) {
    return;
  } else if (boardObj.grid[index] == undefined) {
    highlightMoves(index, nextMoveColor);
    setMark();
  } else {
    return;
  }
  
  if (borderingPieces.length > 1) {
    //timeout = players[(turns - 1) % players.length].type == "CPU" ? 500 : 0;
    timeout = 500;
    turns % players.length == 0 ? player1Score++ : player2Score++;
    totalGames++;
    
    if (
      players[0].type != players[1].type
      && players[turns % players.length].type == "Human"
    ) {
      state = 1;
    } else {
      state = 2;
    }
    
    updateMarkers();
    
    setTimeout(function() {
      if (
        confirm(
          (
            (
              players[0].type != players[1].type
            )
            ? players[turns % players.length].type == "Human"
              ? "Congratulations! "
              : "Bummer! "
            : ""
          )
          + (
            (
              players[0].type == "Human" && players[1].type == "CPU"
            )
            ? "Wins:" + player1Score
              + " Losses:" + (totalGames - player1Score)
            : ""
          )
          + (
            (
              players[0].type == "CPU" && players[1].type == "Human"
            )
            ? "Wins:" + player2Score
              + " Losses:" + (totalGames - player2Score)
            : ""
          )
          + (
            (
              players[0].type == players[1].type
            )
            ? players[turns % players.length].name + " wins!\n\n"
              + "Player 1: "
              + "Wins:" + player1Score
              + " Losses:" + (totalGames - player1Score) + "\n"
              + "Player 2: "
              + "Wins:" + player2Score
              + " Losses:" + (totalGames - player2Score)
            : ""
          )
          + "\n\nPlay again?"
        )
      ) {
        init();
      } else {
        newGameElem.focus();
      }
    }, timeout);
    
    highlightNewGameElem(500, "darkorange");
  } else {
    timeout = players[0].type == "CPU" && players[1].type == "CPU" ? 500 : 0;
    
    setTimeout(function() {
      if (players[turns % players.length].type == "CPU") {
        let availableMoves = getAvailableMoves(boardObj.last);
        
        let nextMove = availableMoves.reduce((best, cur) => {
          if (
            getBorderingPieces(cur).length < getBorderingPieces(best).length
          ) {
            return cur;
          } else if (
            getBorderingPieces(cur).length == getBorderingPieces(best).length
          ) {
            return [best, cur][Math.floor(Math.random() * 2)];
          } else {
            return best;
          }
        });
        
        move(nextMove);
      }
    }, timeout);
    
    if (players[turns % players.length].input == "Mouse") {
      mouseInputOn();
      mouseOverOn(index);
    }
    
    if (players[turns % players.length].input == "Keyboard") {
      kbdIndex = boardObj.last;
      fillCellBackground(kbdIndex, selectColor);
      kbdInputOn();
    }
  }
}

function mouseMove(event) {
  move(+event.target.dataset.index);
}

function kbdFirstMove(event) {
  switch (event.key) {
    case "ArrowLeft":
    case "A":
    case "a":
      event.preventDefault();
      if (getBorderingIndicies(kbdIndex).includes(kbdIndex - 1)) {
        clearCellBackground(kbdIndex);
        kbdIndex -= 1;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "ArrowRight":
    case "D":
    case "d":
      event.preventDefault();
      if (getBorderingIndicies(kbdIndex).includes(kbdIndex + 1)) {
        clearCellBackground(kbdIndex);
        kbdIndex += 1;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "ArrowUp":
    case "W":
    case "w":
      event.preventDefault();
      if (
        getBorderingIndicies(kbdIndex).includes(kbdIndex - boardObj.width)
      ) {
        clearCellBackground(kbdIndex);
        kbdIndex -= boardObj.width;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "ArrowDown":
    case "S":
    case "s":
      event.preventDefault();
      if (
        getBorderingIndicies(kbdIndex).includes(kbdIndex + boardObj.width)
      ) {
        clearCellBackground(kbdIndex);
        kbdIndex += boardObj.width;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      clearCellBackground(kbdIndex);
      kbdInputOff();
      move(kbdIndex);
      break;
    default:
      break;
  }
}

function kbdMove(event) {
  switch (event.key) {
    case "ArrowLeft":
    case "A":
    case "a":
      event.preventDefault();
      if (
        getAvailableMoves(
          boardObj.last
        ).concat(
          boardObj.last
        ).includes(
          kbdIndex - 1
        )
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex -= 1;
        fillCellBackground(kbdIndex, selectColor);
      } else if (
        getAvailableMoves(boardObj.last).includes(boardObj.last - 1)
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex = boardObj.last - 1;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "ArrowRight":
    case "D":
    case "d":
      event.preventDefault();
      if (
        getAvailableMoves(
          boardObj.last
        ).concat(
          boardObj.last
        ).includes(
          kbdIndex + 1
        )
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex += 1;
        fillCellBackground(kbdIndex, selectColor);
      } else if (
        getAvailableMoves(boardObj.last).includes(boardObj.last + 1)
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex = boardObj.last + 1;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "ArrowUp":
    case "W":
    case "w":
      event.preventDefault();
      if (
        getAvailableMoves(
          boardObj.last
        ).concat(
          boardObj.last
        ).includes(
          kbdIndex - boardObj.width
        )
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex -= boardObj.width;
        fillCellBackground(kbdIndex, selectColor);
      } else if (
        getAvailableMoves(
          boardObj.last
        ).includes(
          boardObj.last - boardObj.width
        )
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex = boardObj.last - boardObj.width;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "ArrowDown":
    case "S":
    case "s":
      event.preventDefault();
      if (
        getAvailableMoves(
          boardObj.last
        ).concat(
          boardObj.last
        ).includes(
          kbdIndex + boardObj.width
        )
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex += boardObj.width;
        fillCellBackground(kbdIndex, selectColor);
      } else if (
        getAvailableMoves(
          boardObj.last
        ).includes(
          boardObj.last + boardObj.width
        )
      ) {
        clearCellBackground(kbdIndex);
        highlightMoves(boardObj.last, nextMoveColor);
        kbdIndex = boardObj.last + boardObj.width;
        fillCellBackground(kbdIndex, selectColor);
      }
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      if (kbdIndex != boardObj.last) {
        clearCellBackground(kbdIndex);
        move(kbdIndex);
      }
      break;
    default:
      break;
  }
}

function updateMarkers() {
  marker = markers[state].face;
  
  Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
    let index = +cell.dataset.index;
    
    if (boardObj.grid[index] == true) {
      cell.classList.remove(...cell.classList);
      cell.innerHTML = marker;
      
      if (markers[state].classes) {
        cell.classList.add(
          markers[state].classes[
            Math.floor(Math.random() * markers[state].classes.length)
          ]
        );
      }
    }
  });
}

function updatePit() {
  function removeBorders() {
    pitCells[0].style.borderRight = "none";
    pitCells[0].style.borderBottom = "none";
    
    pitCells[1].style.borderLeft = "none";
    pitCells[1].style.borderRight = "none";
    pitCells[1].style.borderBottom = "none";
    
    pitCells[2].style.borderLeft = "none";
    pitCells[2].style.borderBottom = "none";
    
    pitCells[3].style.borderRight = "none";
    pitCells[3].style.borderTop = "none";
    pitCells[3].style.borderBottom = "none";
    
    pitCells[4].style.border = "none";
    
    pitCells[5].style.borderLeft = "none";
    pitCells[5].style.borderTop = "none";
    pitCells[5].style.borderBottom = "none";
    
    pitCells[6].style.borderRight = "none";
    pitCells[6].style.borderTop = "none";
    
    pitCells[7].style.borderLeft = "none";
    pitCells[7].style.borderRight = "none";
    pitCells[7].style.borderTop = "none";
    
    pitCells[8].style.borderLeft = "none";
    pitCells[8].style.borderTop = "none";
  }
  
  if (pitCells) {
    if (happyFacesCheckbox.checked) {
      pitCells.forEach(cell => cell.style.background = "floralwhite");
      pitCells.forEach(cell => cell.innerHTML = String.fromCodePoint(0x1F33C));
      
      removeBorders();
    } else {
      pitCells.forEach(cell => cell.innerHTML = "");
      pitCells.forEach(cell => cell.style.border = "1px solid black");
      
      pitCells[0].style.background =
        "linear-gradient(to right bottom, white, white, black)";
      pitCells[1].style.background = "linear-gradient(white, black)";
      pitCells[2].style.background =
        "linear-gradient(to left bottom, white, white, black)";
      pitCells[3].style.background = "linear-gradient(to right, white, black)";
      pitCells[4].style.background = "black";
      pitCells[5].style.background = "linear-gradient(to left, white, black)";
      pitCells[6].style.background =
        "linear-gradient(to right top, white, white, black)";
      pitCells[7].style.background = "linear-gradient(to top, white, black)";
      pitCells[8].style.background =
        "linear-gradient(to left top, white, white, black)";
    }
  }
}

function undo() {
  if (state == 0 && players[0].type != players[1].type) {
    if (boardObj.moves.length > (players[0].type == "CPU" ? 1 : 0)) {
      for (let i = 0; i <  2; i++) {
        boardObj.grid[boardObj.last] = undefined;
        document.getElementById(
          "cell" + boardObj.last
        ).innerHTML = "";
        boardObj.moves.pop();
        boardObj.last = boardObj.moves[boardObj.moves.length - 1];
        turns--;
      }
    }
  }
}

function pitDialog() {
  if (happyFacesCheckbox.checked) {
    alert("Please don't step on the daisies");
  } else {
    alert("Ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
  }
}

function init() {
  clearNewGameElemHighlightTimeout();
  
  let customX, customY;
  let xArg, yArg;
  
  if (gridSelectElem.value == "Custom") {
    customX = Number(prompt("Desired board width:"));
    if (!Number.isInteger(customX) || customX < 2) {
      alert("Please enter a whole number of at least two.");
      return;
    } else {
      xArg = customX;
    }
    
    customY = Number(prompt("Desired board height:"));
    if (!Number.isInteger(customY) || customY < 2) {
      alert("Please enter a whole number of at least two.");
      return;
    } else {
      yArg = customY;
    }
  } else {
    xArg = JSON.parse(gridSelectElem.value).x;
    yArg = JSON.parse(gridSelectElem.value).y;
  }
  
  if (
    players[0].type != player1SelectElem.value
    || players[1].type != player2SelectElem.value
  ) {
    totalGames = 0;
    player1Score = 0;
    player2Score = 0;
  }
  
  players[0].type = player1SelectElem.value;
  players[1].type = player2SelectElem.value;
  
  if (players[0].type == "Human") {
    players[0].input = player1InputSelectElem.value;
  } else {
    players[0].input = null;
  }
  
  if (players[1].type == "Human") {
    players[1].input = player2InputSelectElem.value;
  } else {
    players[1].input = null;
  }
  
  boardObj = new Board(
    xArg,
    yArg,
    gridSelectElem.selectedIndex
  );
  turns = 0;
  state = 0;
  marker = markers[state].face;
  
  Array.from(boardElem.rows).forEach(row => row.remove());
  
  for (let y = 0; y < boardObj.height; y++) {
    let row = document.createElement("tr");
    
    for (let x = 0; x < boardObj.width; x++) {
      let cell = document.createElement("td");
      let index = x + y * boardObj.width;
      
      cell.setAttribute("data-x", x);
      cell.setAttribute("data-y", y);
      cell.setAttribute("data-index", index);
      cell.setAttribute("id", "cell" + index);
      row.appendChild(cell);
    }
    
    boardElem.appendChild(row);
  }
  
  if (boardObj.gridOption == 3) {
    pitCells = [
      ((boardObj.grid.length - 1) / 2) - (boardObj.width + 1),
      ((boardObj.grid.length - 1) / 2) - (boardObj.width),
      ((boardObj.grid.length - 1) / 2) - (boardObj.width - 1),
      ((boardObj.grid.length - 1) / 2) - 1,
      ((boardObj.grid.length - 1) / 2),
      ((boardObj.grid.length - 1) / 2) + 1,
      ((boardObj.grid.length - 1) / 2) + (boardObj.width - 1),
      ((boardObj.grid.length - 1) / 2) + (boardObj.width),
      ((boardObj.grid.length - 1) / 2) + (boardObj.width + 1)
    ].map(index => document.getElementById("cell" + index));
    
    pitCells.forEach(cell => boardObj.grid[+cell.dataset.index] = false);
    
    updatePit();
  }
  
  if (players[0].type == "CPU") {
    let index;
    
    do {
      index = Math.floor(Math.random() * boardObj.grid.length)
    } while (boardObj.grid[index] == false);
    
    move(index);
  }
  
  if (players[0].input == "Keyboard") {
    kbdIndex = 0;
    fillCellBackground(kbdIndex, selectColor);
    kbdInputOn();
  }
  
  if (players[0].input == "Mouse") {
    mouseInputOn();
    mouseOverOn();
  }
}

function about() {
  let aboutText = [
    "Congo Skulls",
    "A pointless diversion by Nicholas D. Horne",
    "A remake of Toggle Booleans' 1993 Windows 3.1 freeware classic Amazon "
    + "Skulls in JavaScript with some new features/amenities including local "
    + "multiplayer, custom grid size, keyboard controls, and undo (ctrl+z). ",
    "GNU GPLv3 licensed source code available at "
    + "https://github.com/ndhorne/congo-skulls-js"
  ];
  
  alert(
    aboutText.join("\n\n")
  );
}

function howToPlay() {
  let helpText =
    "Each piece played (with the exception of the first piece) must border "
    + "the last piece played and border that piece only. The first player to "
    + "play a piece bordering more than one piece (the last piece) loses the "
    + "game. Make the last valid move to win!"
  ;
  
  alert(helpText);
}

function start() {
  function ctrlZ(event) {
    if (event.ctrlKey && event.key.toLowerCase() == "z") {
      if (boardObj.moves.length > 0) {
        clearBorderingCellBackgrounds(boardObj.last);
        mouseOverOff(boardObj.last);
        mouseInputOff();
        kbdInputOff();
        
        undo();
        
        if (players[turns % players.length].input == "Keyboard") {
          clearCellBackground(kbdIndex);
          kbdIndex = (boardObj.last || 0);
          fillCellBackground(kbdIndex, selectColor);
          
          kbdInputOn();
        }
        
        if (players[turns % players.length].input == "Mouse") {
          mouseOverOn(boardObj.last);
          mouseInputOn();
        }
        
        if (boardObj.moves.length > 0) {
          highlightMoves(boardObj.last, nextMoveColor);
        }
      }
    }
  }
  
  happyFacesCheckbox.addEventListener("click", event => {
    if (happyFacesCheckbox.checked) {
      markers = pieces["happyFace"];
      gridSelectElem[3].text = "Pit of Daisies";
    } else {
      markers = pieces["skull"];
      gridSelectElem[3].text = "Pit of Death";
    }
    updateMarkers();
    updatePit();
  });
  
  newGameElem.addEventListener("click", event => {
    init();
    newGameElem.blur();
  });
  
  howToPlayElem.addEventListener("click", event => {
    howToPlay();
    howToPlayElem.blur();
  });
  
  aboutElem.addEventListener("click", event => {
    about();
    aboutElem.blur();
  });
  
  document.addEventListener("keydown", ctrlZ);
  
  player1SelectElem.selectedIndex = 1;
  player2SelectElem.selectedIndex = 0;
  gridSelectElem.selectedIndex = 0;
  happyFacesCheckbox.checked = false;
  player1InputSelectElem.selectedIndex = 1;
  player2InputSelectElem.selectedIndex = 0;
  
  init();
}

start();
