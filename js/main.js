window.onload = function() {
  console.log("onload")
  let viewWidth = $("#view").width();
  console.log(viewWidth);
  let viewHeight = $("#view").height();
  console.log(viewHeight);
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 8;
    ctx.canvas.height = viewHeight - viewHeight / 8;
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 8;
    ctx.canvas.height = viewWidth - viewWidth / 8;
  }

  //Load and edit sprites
  var completeOne = false;
  var completeTwo = false;
  var completeThree = false;
  var completeFour = false;

  sprite = new Image();
  sprite.src = "img/playerSp.png";
  sprite.onload = function() {
    sprite = changeBrightness(1.2, sprite);
    completeOne = true;
    isComplete();
  };

  redsprite = new Image();
  redsprite.src = "img/playerSpHurt.png";
  sprite.onload = function() {
    redsprite = changeBrightness(1.2, sprite);
    completeThree = true;
  };

  closedsprite = new Image();
  closedsprite.src = "img/playerSp2.png";
  sprite.onload = function() {
    closedsprite = changeBrightness(1.2, sprite);
    completeFour = true;
  };

  finishSprite = new Image();
  finishSprite.src = "img/finSp.png";
  finishSprite.onload = function() {
    finishSprite = changeBrightness(1.1, finishSprite);
    completeTwo = true;
    isComplete();
  };

  var isComplete = () => {
    console.log("isComplete")
    if(completeOne === true && completeTwo === true && completeThree === true && completeFour === true)
       {
         console.log("Runs");
         setTimeout(function(){
           initialize();
         }, 500);         
       }
  };
  
};

var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");
var sprite;
var finishSprite;
var maze, draw, player;
var cellSize;
var difficulty;
// sprite.src = 'media/sprite.png';

window.onresize = function() {
  console.log("onresize")
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 100;
    ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 100;
    ctx.canvas.height = viewWidth - viewWidth / 100;
  }
  cellSize = mazeCanvas.width / difficulty;
  if (player != null) { // TODO check if remove condition 
    draw.redrawMaze(cellSize); // to eliminate init load problem
    player.redrawPlayer(cellSize);
  }
};

function rand(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function changeBrightness(factor, sprite) {
  console.log("changeBrightness");
  var virtCanvas = document.createElement("canvas");
  virtCanvas.width = 500;
  virtCanvas.height = 500;
  var context = virtCanvas.getContext("2d");
  context.drawImage(sprite, 0, 0, 500, 500);

  var imgData = context.getImageData(0, 0, 500, 500);

  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = imgData.data[i] * factor;
    imgData.data[i + 1] = imgData.data[i + 1] * factor;
    imgData.data[i + 2] = imgData.data[i + 2] * factor;
  }
  context.putImageData(imgData, 0, 0);

  var spriteOutput = new Image();
  spriteOutput.src = virtCanvas.toDataURL();
  virtCanvas.remove();
  return spriteOutput;
}

function displayVictoryMess(moves) {
  console.log("displayVictoryMess");
  document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps.";
  toggleVisablity("Message-Container");  
}

function toggleVisablity(id) {
  console.log("toggleVisablity");
  if (document.getElementById(id).style.visibility == "visible") {
    document.getElementById(id).style.visibility = "hidden";
  } else {
    document.getElementById(id).style.visibility = "visible";
  }
}

function CreateMaze(Width, Height) {
  console.log("CreateMaze");
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoord, endCoord;
  var dirs = ["n", "s", "e", "w"];
  var modDir = {
    n: {
      y: -1,
      x: 0,
      o: "s"
    },
    s: {
      y: 1,
      x: 0,
      o: "n"
    },
    e: {
      y: 0,
      x: 1,
      o: "w"
    },
    w: {
      y: 0,
      x: -1,
      o: "e"
    }
  };

  this.map = function() {
    return mazeMap;
  };
  this.startCoord = function() {
    return startCoord;
  };
  this.endCoord = function() {
    return endCoord;
  };

  function genMap() {
    console.log("genMap");
    mazeMap = new Array(height);
    for (y = 0; y < height; y++) {
      mazeMap[y] = new Array(width);
      for (x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          n: false,
          s: false,
          e: false,
          w: false,
          visited: false,
          priorPos: null
        };
      }
    }
  }

  function defineStartEnd() {
    console.log("defineStartEnd");
    switch (rand(4)) {
      case 0:
        startCoord = {
          x: 0,
          y: 0
        };
        endCoord = {
          x: height - 1,
          y: width - 1
        };
        break;
      case 1:
        startCoord = {
          x: 0,
          y: width - 1
        };
        endCoord = {
          x: height - 1,
          y: 0
        };
        break;
      case 2:
        startCoord = {
          x: height - 1,
          y: 0
        };
        endCoord = {
          x: 0,
          y: width - 1
        };
        break;
      case 3:
        startCoord = {
          x: height - 1,
          y: width - 1
        };
        endCoord = {
          x: 0,
          y: 0
        };
        break;
    }
  }

  function defineMaze() {
    console.log("defineMaze");
    var isComp = false;
    var move = false;
    var cellsVisited = 1;
    var numLoops = 0;
    var maxLoops = 0;
    var pos = {
      x: 0,
      y: 0
    };
    var numCells = width * height;
    while (!isComp) {
      move = false;
      mazeMap[pos.x][pos.y].visited = true;

      if (numLoops >= maxLoops) {
        shuffle(dirs);
        maxLoops = Math.round(rand(height / 8));
        numLoops = 0;
      }
      numLoops++;

      for (index = 0; index < dirs.length; index++) {
        var direction = dirs[index];
        var nx = pos.x + modDir[direction].x;
        var ny = pos.y + modDir[direction].y;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          //Check if the tile is already visited
          if (!mazeMap[nx][ny].visited) {
            //Carve through walls from this tile to next
            mazeMap[pos.x][pos.y][direction] = true;
            mazeMap[nx][ny][modDir[direction].o] = true;

            //Set Currentcell as next cells Prior visited
            mazeMap[nx][ny].priorPos = pos;
            //Update Cell position to newly visited location
            pos = {
              x: nx,
              y: ny
            };
            cellsVisited++;
            //Recursively call this method on the next tile
            move = true;
            break;
          }
        }
      }

      if (!move) {
        //  If it failed to find a direction,
        //  move the current position back to the prior cell and Recall the method.
        pos = mazeMap[pos.x][pos.y].priorPos;
      }
      if (numCells == cellsVisited) {
        isComp = true;
      }
    }
  }

  genMap();
  defineStartEnd();
  defineMaze();
}


function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
  console.log("DrawMaze");
  var map = Maze.map();
  var cellSize = cellsize;
  var drawEndMethod;
  ctx.lineWidth = cellSize / 40;

  this.redrawMaze = function(size) {
    console.log("redrawMaze");
    cellSize = size;
    ctx.lineWidth = cellSize / 40;
    drawMap();
    drawEndMethod();
  };

  function drawCell(xCord, yCord, cell) {
    console.log("drawCell");
    var x = xCord * cellSize;
    var y = yCord * cellSize;
    ctx.strokeStyle = "white";

    if (cell.n == false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if (cell.s === false) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.e === false) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.w === false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
  }

  function drawMap() {
    console.log("drawMap");
    for (x = 0; x < map.length; x++) {
      for (y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]);
      }
    }
  }

  function drawEndFlag() {
    console.log("drawEndFlag");
    var coord = Maze.endCoord();
    var gridSize = 4;
    var fraction = cellSize / gridSize - 2;
    var colorSwap = true;
    for (let y = 0; y < gridSize; y++) {
      if (gridSize % 2 == 0) {
        colorSwap = !colorSwap;
      }
      for (let x = 0; x < gridSize; x++) {
        ctx.beginPath();
        ctx.rect(
          coord.x * cellSize + x * fraction + 4.5,
          coord.y * cellSize + y * fraction + 4.5,
          fraction,
          fraction
        );
        if (colorSwap) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        }
        ctx.fill();
        colorSwap = !colorSwap;
      }
    }
  }

  function drawEndSprite() {
    console.log("drawEndSprite");
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    var coord = Maze.endCoord();
    ctx.drawImage(
      endSprite,
      2,
      2,
      endSprite.width,
      endSprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

  function clear() {
    console.log("clear");
    var canvasSize = cellSize * map.length;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  if (endSprite = null) {
    drawEndMethod = drawEndSprite;
  } else {
    drawEndMethod = drawEndFlag;
  }
  clear();
  drawMap();
  drawEndMethod();
}


function Player(maze, c, _cellsize, onComplete, sprite = null) {
  var ctx = c.getContext("2d");
  var drawSprite;
  var moves = 0;
  drawSprite = drawSpriteCircle;
  if (sprite != null) {
    drawSprite = drawSpriteImg;
  }
  drawRedSprite = drawRedSpriteImg;
  var player = this;
  var map = maze.map();
  var cellCoords = {
    x: maze.startCoord().x,
    y: maze.startCoord().y
  };
  var cellSize = _cellsize;
  var halfCellSize = cellSize / 2;
  var HP = 5;

  this.redrawPlayer = function(_cellsize) {
    console.log("redrawPlayer");
    cellSize = _cellsize;
    drawSpriteImg(cellCoords);
  };

  function drawSpriteCircle(coord) {
    console.log("drawSpriteCircle");
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.arc(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize,
      halfCellSize - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  function drawSpriteImg(coord) {
    console.log("drawSpriteImg");
    var offsetLeft = cellSize / 10;
    var offsetRight = cellSize / 10;
    ctx.drawImage(
      sprite,
      0,
      0,
      sprite.width - 1,
      sprite.height -1,
      coord.x * cellSize + (offsetLeft/2),
      coord.y * cellSize + (offsetLeft/2),
      cellSize - offsetRight,
      cellSize - offsetRight
    );
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  function drawRedSpriteImg(coord) {
    console.log("drawRedSpriteImg");
    var offsetLeft = cellSize / 10;
    var offsetRight = cellSize / 10;
    ctx.drawImage(
      redsprite,
      0,
      0,
      redsprite.width - 1,
      redsprite.height -1,
      coord.x * cellSize + (offsetLeft/2),
      coord.y * cellSize + (offsetLeft/2),
      cellSize - offsetRight,
      cellSize - offsetRight
    );
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  function removeSprite(coord) {
    console.log("removeSprite");
    var offsetLeft = cellSize / 20;
    var offsetRight = cellSize / 20;
    ctx.clearRect(
      coord.x * cellSize + (offsetLeft/2),
      coord.y * cellSize + (offsetLeft/2),
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

  function check(e) {
    console.log("check");
    var cell = map[cellCoords.x][cellCoords.y];
    moves++;
    switch (e.keyCode) {
      case 65:
      case 37: // west
        if (cell.w == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x - 1,
            y: cellCoords.y
          };
          drawSprite(cellCoords);
        }
        else {
          removeSprite(cellCoords);
          drawRedSprite(cellCoords);
          setTimeout(() => drawSprite(cellCoords), 100);
          console.log("HP fall triggered");
          HP = HP-1;
          console.log(HP);
        }
        HPCheck()
        break;
      case 87:
      case 38: // north
        if (cell.n == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y - 1
          };
          drawSprite(cellCoords);
        }
        else {
          removeSprite(cellCoords);
          drawRedSprite(cellCoords);
          console.log("HP fall triggered");
          setTimeout(() => drawSprite(cellCoords), 100);
          HP = HP-1;
          console.log(HP);
        }
        HPCheck()
        break;
      case 68:
      case 39: // east
        if (cell.e == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x + 1,
            y: cellCoords.y
          };
          drawSprite(cellCoords);
        }
        else {
          removeSprite(cellCoords);
          drawRedSprite(cellCoords);
          setTimeout(() => drawSprite(cellCoords), 100);
          console.log("HP fall triggered");
          HP = HP-1;
          console.log(HP);
        }
        HPCheck()
        break;
      case 83:
      case 40: // south
        if (cell.s == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y + 1
          };
          drawSprite(cellCoords);
        }
        else {
          removeSprite(cellCoords);
          drawRedSprite(cellCoords);
          setTimeout(() => drawSprite(cellCoords), 100);
          console.log("HP fall triggered");
          HP = HP-1;
          console.log(HP);
        }
        HPCheck()
        break;
    }

    function HPCheck() {
      if (HP == 0) {
        drawRedSprite(cellCoords);
        displayVictoryMess(0);
        player.unbindKeyDown();
      }
    }
  }

  this.bindKeyDown = function() {
    console.log("bindKeyDown");
    window.addEventListener("keydown", check, false);

    $("#view").swipe({
      swipe: function(
        event,
        direction,
        distance,
        duration,
        fingerCount,
        fingerData
      ) {
        console.log(direction);
        switch (direction) {
          case "up":
            check({
              keyCode: 38
            });
            break;
          case "down":
            check({
              keyCode: 40
            });
            break;
          case "left":
            check({
              keyCode: 37
            });
            break;
          case "right":
            check({
              keyCode: 39
            });
            break;
        }
      },
      threshold: 0
    });
  };

  this.unbindKeyDown = function() {
    console.log("unbindKeyDown");
    window.removeEventListener("keydown", check, false);
    $("#view").swipe("destroy");
  };

  drawSprite(maze.startCoord());

  this.bindKeyDown();
}


function initialize() {
  console.log("initialize");
  //document.getElementById("mazeCanvas").classList.add("border");
  if (player != undefined) {
    player.unbindKeyDown();
    player = null;
  }
  var e = document.getElementById("diffSelect");
  difficulty = e.options[e.selectedIndex].value;
  cellSize = mazeCanvas.width / difficulty;
  maze = new CreateMaze(difficulty, difficulty);
  draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
  player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);
  if (document.getElementById("mazeContainer").style.opacity < "100") {
    document.getElementById("mazeContainer").style.opacity = "100";
  }
}
