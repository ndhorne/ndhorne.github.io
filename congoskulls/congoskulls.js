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
let gridSelectElem = document.getElementById("gridSelect");
let player1SelectElem = document.getElementById("player1Select");
let player2SelectElem = document.getElementById("player2Select");
let happyFacesCheckbox = document.getElementById("happyFacesToggle");

let players = [
  {
    name: "Player 1",
    type: player1SelectElem.value
  },
  {
    name: "Player 2",
    type: player2SelectElem.value
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
      classes: null
    },
    {
      face: String.fromCodePoint(0x1F480),
      classes: ["rotate90", "rotate270"]
    }
  ],
  happyFace: [
    {
      face: String.fromCodePoint(0x1F603),
      classes: null
    },
    {
      face: String.fromCodePoint(0x1F61D),
      classes: null
    },
    {
      face: String.fromCodePoint(0x1F612),
      classes: null
    }
  ]
}

let boardObj, pitCells, turns, state;
let totalGames = 0, player1Score = 0, player2Score = 0;
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
    || state != 0
  ) {
    highlightNewGameElem(500, "darkorange");
  }
}

player1SelectElem.addEventListener("change", event => {
  newOptionSelectedAdministrivia();
});

player2SelectElem.addEventListener("change", event => {
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

function move(event) {
  let x = Number(event.target.dataset.x);
  let y = Number(event.target.dataset.y);
  let width = boardObj.width;
  let index = x + y * width;
  let timeout;
  
  if (boardObj.grid[index] == false) {
    pitDialog();
    return;
  }
  
  function setMark() {
    boardObj.grid[index] = true;
    event.target.innerHTML = marker;
    boardObj.moves.push(index);
    boardObj.last = index;
    turns++;
  }
  
  let borderingPieces = getBorderingPieces(index);
  
  if (boardObj.last == undefined) {
    setMark();
  } else if (!borderingPieces.includes(boardObj.last)) {
    return;
  } else if (boardObj.grid[index] == undefined) {
    setMark();
  } else {
    return;
  }
  
  if (borderingPieces.length > 1) {
    timeout = players[(turns - 1) % players.length].type == "CPU" ? 500 : 0;
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
    
    Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
      cell.removeEventListener("click", move);
    });
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
        
        document.getElementById("cell" + nextMove).click();
      }
    }, timeout);
  }
}

function updateMarkers() {
  marker = markers[state].face;
  
  Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
    let x = Number(cell.dataset.x);
    let y = Number(cell.dataset.y);
    let width = boardObj.width;
    let index = x + y * width;
    
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
      cell.setAttribute("data-x", x);
      cell.setAttribute("data-y", y);
      cell.setAttribute("id", "cell" + (x + y * boardObj.width));
      row.appendChild(cell);
    }
    
    boardElem.appendChild(row);
  }
  
  Array.from(document.getElementsByTagName("td")).forEach(function(cell) {
    cell.addEventListener("click", move);
  });
  
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
    
    pitCells.forEach(cell => {
      boardObj.grid[
        Number(cell.dataset.x) + Number(cell.dataset.y) * boardObj.width
      ] = false;
    });
    
    updatePit();
  }
  
  if (players[0].type == "CPU") {
    let index;
    
    do {
      index = Math.floor(Math.random() * boardObj.grid.length)
    } while (boardObj.grid[index] == false);
    
    document.getElementById("cell" + index).click();
  }
}

function about() {
  let aboutText = [
    "Congo Skulls",
    "A pointless diversion by Nicholas D. Horne",
    "A remake of Toggle Booleans' 1993 Windows 3.1 freeware classic Amazon "
    + "Skulls in JavaScript with some new features/amenities including local "
    + "multiplayer, custom grid size, and undo (ctrl+z). Each piece played "
    + "(with the exception of the first piece) must border the last piece "
    + "played and border that piece only. The first player to play a piece "
    + "bordering more than one piece (the last piece) loses the game. Make "
    + "the last valid move to win!",
    "GNU GPLv3 licensed source code available at "
    + "https://github.com/ndhorne/congo-skulls-js"
  ];
  
  alert(
    aboutText.join("\n\n")
  );
}

function start() {
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
  
  aboutElem.addEventListener("click", event => about());
  newGameElem.addEventListener("click", event => init());

  document.addEventListener("keydown", event => {
    if (event.ctrlKey && event.key.toLowerCase() == "z") {
      undo();
    }
  });
  
  player1SelectElem.selectedIndex = 1;
  player2SelectElem.selectedIndex = 0;
  gridSelectElem.selectedIndex = 0;
  happyFacesCheckbox.checked = false;
  
  init();
}

start();
