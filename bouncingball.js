/*
Copyright 2019, 2020 Nicholas D. Horne

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

class Vec {
  constructor(x, y) {
      this.x = x;
      this.y = y;
  }
  
  plus(vector) {
    return new Vec(this.x + vector.x, this.y + vector.y);
  }
  
  minus(vector) {
    return new Vec(this.x - vector.x, this.y - vector.y);
  }
  
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
  
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

let canvas = document.querySelector("canvas");
let cx = canvas.getContext("2d");

let canvasWidth = 400;
let canvasHeight = 400;

let boxPos = new Vec(25, 25);
let boxDimensions = new Vec(canvasWidth - 50, canvasHeight - 50);

let speed = randomSpeed();
let radius = randomRadius();

let borderLeft, borderRight, borderTop, borderBottom;
setBorders();

let ballPos = new Vec(
  randomInt(borderLeft, borderRight),
  randomInt(borderTop, borderBottom)
);

let lastTime = null;

function randomInt(min, max, randomSign) {
  let randInt = Math.floor(Math.random() * (max - min + 1)) + min;
  
  if (randomSign) {
    randInt *= Math.random() >= .5 ? 1 : -1;
  }
  
  return randInt;
}

function randomColor() {
  let colors = ["blue", "mediumblue", "darkblue", "midnightblue",
    "royalblue", "slateblue", "darkslateblue", "steelblue", "darkcyan",
    "green", "darkgreen", "grey", "dimgrey", "slategrey",
    "lightslategray", "darkslategrey", "purple", "mediumpurple",
    "rebeccapurple", "red", "firebrick", "darkred", "navy", "indigo",
    "teal"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomSpeed() {
  return new Vec(randomInt(100, 200, true), randomInt(100, 200, true));
}

function randomRadius() {
  return randomInt(30, 100);
}

function setBorders(left, right, top, bottom) {
  borderLeft = left ? left : boxPos.x + radius + cx.lineWidth;
  borderRight = right ? right :
    boxPos.x + boxDimensions.x - radius - cx.lineWidth;
  borderTop = top ? top : boxPos.y + radius + cx.lineWidth;
  borderBottom = bottom ? bottom :
    boxPos.y + boxDimensions.y - radius - cx.lineWidth;
}

function frame(time) {
  if (lastTime != null) {
    updateAnimation(Math.min(100, time - lastTime) / 1000);
  }
  lastTime = time;
  requestAnimationFrame(frame);
}

function updateAnimation(step) {
  cx.clearRect(0, 0, canvasWidth, canvasHeight);
  cx.strokeRect(boxPos.x, boxPos.y, boxDimensions.x, boxDimensions.y);
  cx.beginPath();
  cx.arc(ballPos.x, ballPos.y, radius, 0, 7);
  cx.fill();
  
  ballPos = ballPos.plus(speed.times(step));
  if (ballPos.x < borderLeft && Math.sign(speed.x) == -1 ||
      ballPos.x > borderRight && Math.sign(speed.x) == 1) {
    speed.x = -speed.x;
  }
  if (ballPos.y < borderTop && Math.sign(speed.y) == -1 ||
      ballPos.y > borderBottom && Math.sign(speed.y) == 1) {
    speed.y = -speed.y;
  }
}

function clickHandler(event) {
  //current ball position at time of click event
  let currentBallPos = {
    x: ballPos.x,
    y: ballPos.y
  };
  
  let rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  
  for (let degrees = 270; degrees <= 450; degrees++) {
    let radians = degrees * Math.PI / 180;
    
    let yTop = currentBallPos.y - radius * Math.sin(radians);
    let yBottom = currentBallPos.y + radius * Math.sin(radians);
    let xLeft = currentBallPos.x - radius * Math.cos(radians);
    let xRight = currentBallPos.x + radius * Math.cos(radians);
    
    if (y >= yTop && y <= yBottom && x >= xLeft && x <= xRight) {
      let leftSpace = ballPos.x - (boxPos.x + cx.lineWidth);
      let rightSpace = (boxPos.x + boxDimensions.x) -
        (ballPos.x + cx.lineWidth);
      let topSpace = ballPos.y - (boxPos.y + cx.lineWidth);
      let bottomSpace = (boxPos.y + boxDimensions.y) -
        (ballPos.y + cx.lineWidth);
      let minSpace = Math.min(leftSpace, rightSpace, topSpace,
        bottomSpace);
      
      let speedVec = randomSpeed();
      speed = new Vec(
        Math.abs(speedVec.x) * Math.sign(speed.x),
        Math.abs(speedVec.y) * Math.sign(speed.y)
      );
      
      cx.fillStyle = randomColor();
      radius = Math.min(minSpace, randomRadius());
      setBorders();
      
      break;
    }
  }
  
  event.preventDefault();
}

canvas.addEventListener("pointerdown", clickHandler, true);

canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.title = "Interactive HTML5 Canvas JavaScript Animation " +
  "Demonstration (click on circle)";

canvas.style.width = canvasWidth + "px";
canvas.style.height = canvasHeight + "px";
canvas.style.display = "block";
canvas.style.marginLeft = "auto";
canvas.style.marginRight = "auto";

cx.strokeStyle = "black";
cx.fillStyle = randomColor();

requestAnimationFrame(frame);
