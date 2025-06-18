
window.onload = function() {

  let availableHeight = $("#view").height();
  let availableWidth = $("#view").width();

  let canvasSize = Math.min(availableHeight, availableWidth) * 0.80;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  //Load and edit sprites
  var completeOne = false;
  var completeTwo = false;

  sprite = new Image();
  sprite.onload = function() {
    sprite = changeBrightness(1.2, sprite);
    completeOne = true;
    isComplete();
  };

  finishSprite = new Image();
  finishSprite.onload = function() {
    finishSprite = changeBrightness(1.1, finishSprite);
    completeTwo = true;
    isComplete();
  };

  var isComplete = () => {
    if(completeOne === true && completeTwo === true)
       {
         setTimeout(function(){
           initialize();
         }, 500);         
       }
  };
  
};

document.getElementById('diffSelect').addEventListener('change', function() {
    this.classList.remove('easy', 'medium', 'hard', 'extreme');
    
    const selectedOption = this.options[this.selectedIndex];
    this.classList.add(selectedOption.className);
    
    this.style.color = this.value === "15" || this.value === "10" ? "#000" : "#fff";
});

document.getElementById('diffSelect').dispatchEvent(new Event('change'));

var mazeCanvas = document.getElementById("mazeCanvas");
var ctx = mazeCanvas.getContext("2d");

var virtualCanvas = document.createElement("canvas");
virtualCanvas.width = 100;
virtualCanvas.height = 100;

var sprite;
var finishSprite;
var spriteOutput = new Image();
var maze, draw, player;
var cellSize;
var difficulty;

window.onresize = function() {
  let availableHeight = $("#view").height();
  let availableWidth = $("#view").width();
  
  let canvasSize = Math.min(availableHeight, availableWidth) * 0.80;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;
  
  cellSize = mazeCanvas.width / difficulty;
  if (player != null) {
    draw.redrawMaze(cellSize);
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
  var context = virtualCanvas.getContext("2d");
  context.clearRect(0, 0, virtualCanvas.width, virtualCanvas.height);
  context.drawImage(sprite, 0, 0, 500, 500);

  var imgData = context.getImageData(0, 0, 500, 500);

  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = imgData.data[i] * factor;
    imgData.data[i + 1] = imgData.data[i + 1] * factor;
    imgData.data[i + 2] = imgData.data[i + 2] * factor;
  }
  context.putImageData(imgData, 0, 0);

  spriteOutput.src = virtualCanvas.toDataURL();
  return spriteOutput;
}

function displayVictoryMessage(moves) {
  document.getElementById("victory-moves").innerHTML = "You won after " + moves + " steps.";
  toggleVisibility("Victory-Message-Container");  
}

function displayLossMessage(moves) {
  document.getElementById("loss-moves").innerHTML = "You moved " + moves + " steps before death.";
  toggleVisibility("Loss-Message-Container");  
}

function displayVictoryMessage(moves) {
  const optimalSteps = findOptimalPath(maze, maze.startCoord(), maze.endCoord());
  const efficiency = optimalSteps > 0 ? Math.round((optimalSteps / moves) * 100) : 0;
  
  document.getElementById("victory-moves").innerHTML = `
    You won after ${moves} steps.<br>
    The computer would've won in ${optimalSteps} steps (efficiency: ${efficiency}%).<br>
    ${moves <= optimalSteps ? "Great job!" : ""}
  `;
  
  toggleVisibility("Victory-Message-Container");  
}

function displayLossMessage(moves) {
  const optimalSteps = findOptimalPath(maze, maze.startCoord(), maze.endCoord());
  
  document.getElementById("loss-moves").innerHTML = `
    You took ${moves} steps<br>
    Optimal path was ${optimalSteps} steps<br>
    ${optimalSteps > 0 ? "Can you find the shorter path?" : "Maze was impossible!"}
  `;
  
  toggleVisibility("Loss-Message-Container");
}

function toggleVisibility(id) {
  if (document.getElementById(id).style.visibility == "visible") {
    document.getElementById(id).style.visibility = "hidden";
  } else {
    document.getElementById(id).style.visibility = "visible";
  }
}

function CreateMaze(Width, Height) {
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoord, endCoord;
  var dirs = ["north", "south", "east", "west"];
  var modDir = {
    north: { y: -1, x: 0, o: "south" },
    south: { y: 1, x: 0, o: "north" },
    east: { y: 0, x: 1, o: "west" },
    west: { y: 0, x: -1, o: "east" }
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
    mazeMap = new Array(height);
    for (y = 0; y < height; y++) {
      mazeMap[y] = new Array(width);
      for (x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          north: false,
          south: false,
          east: false,
          west: false,
          visited: false,
          priorPos: null
        };
      }
    }
  }

  function defineStartEnd() {
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
  var map = Maze.map();
  var cellSize = cellsize;
  var drawEndMethod;
  ctx.lineWidth = cellSize / 40;

  this.redrawMaze = function(size) {
    cellSize = size;
    ctx.lineWidth = cellSize / 40;
    drawMap();
    drawEndMethod();
  };

  function drawCell(xCord, yCord, cell) {
    var x = xCord * cellSize;
    var y = yCord * cellSize;
    ctx.strokeStyle = "white";

    if (cell.north == false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if (cell.south === false) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.east === false) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.west === false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
  }

  function drawMap() {
    for (x = 0; x < map.length; x++) {
      for (y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]);
      }
    }
  }

  function drawEndFlag() {
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
    var canvasSize = cellSize * map.length;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  if (endSprite == null) {
    drawEndMethod = drawEndSprite;
  } else {
    drawEndMethod = drawEndFlag;
  }
  clear();
  drawMap();
  drawEndMethod();
}


function Player(maze, c, _cellsize, onComplete, sprite) {
  var ctx = c.getContext("2d");
  var drawSprite;
  var moves = 0;
  drawSprite = drawPlayer;

  var player = this;
  var map = maze.map();
  var cellCoords = {
    x: maze.startCoord().x,
    y: maze.startCoord().y
  };
  var cellSize = _cellsize;
  var halfCellSize = cellSize / 2;
  var HP = 5;
  document.getElementById("health").value = 5;


  this.redrawPlayer = function(_cellsize) {
    cellSize = _cellsize;
    drawPlayer(cellCoords, "f2d648");
  };

  function drawPlayer(coord, playerColour = "f2d648") {
    var offsetLeft = cellSize / 10;
    var offsetRight = cellSize / 10;

    // an arc which goes from 36 degrees to 324 degrees
    ctx.beginPath();
    ctx.arc(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize, 
      halfCellSize - 2,
      0.2 * Math.PI,
      1.8 * Math.PI);
    // snacman's mouth
    ctx.lineTo(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize);
    ctx.closePath();
    // fill snacman's head with colour
    ctx.fillStyle = playerColour;
    ctx.fill();

    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  function removeSprite(coord) {
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
    var cell = map[cellCoords.x][cellCoords.y];
    moves++;
    switch (e.keyCode) {
      case 65:
      case 37: // west
        if (cell.west == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x - 1,
            y: cellCoords.y
          };
          drawSprite(cellCoords, "#f2d648");
        }
        else {
          removeSprite(cellCoords);
          drawSprite(cellCoords, "red");
          setTimeout(() => drawSprite(cellCoords, "#f2d648"), 100);
          HP = HP-1;
          document.getElementById("health").value -= 1;
        }
        HPCheck()
        break;
      case 87:
      case 38: // north
        if (cell.north == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y - 1
          };
          drawSprite(cellCoords, "#f2d648");
        }
        else {
          removeSprite(cellCoords);
          drawSprite(cellCoords, "red");
          setTimeout(() => drawSprite(cellCoords, "#f2d648"), 100);
          HP = HP-1;
          document.getElementById("health").value -= 1;
        }
        HPCheck()
        break;
      case 68:
      case 39: // east
        if (cell.east == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x + 1,
            y: cellCoords.y
          };
          drawSprite(cellCoords, "#f2d648");
        }
        else {
          removeSprite(cellCoords);
          drawSprite(cellCoords, "red");
          setTimeout(() => drawSprite(cellCoords, "#f2d648"), 100);
          HP = HP-1;
          document.getElementById("health").value -= 1;
        }
        HPCheck()
        break;
      case 83:
      case 40: // south
        if (cell.south == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y + 1
          };
          drawSprite(cellCoords, "#f2d648");
        }
        else {
          removeSprite(cellCoords);
          drawSprite(cellCoords, "red");
          setTimeout(() => drawSprite(cellCoords, "#f2d648"), 100);
          HP = HP-1;
          document.getElementById("health").value -= 1;
        }
        HPCheck()
        break;
    }

    function HPCheck() {
      if (HP == 0) {
        drawPlayer(cellCoords, "red");
        displayLossMessage(moves);
        player.unbindKeyDown();
      }
    }
  }

  this.bindKeyDown = function() {
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
    window.removeEventListener("keydown", check, false);
    $("#view").swipe("destroy");
  };

  drawSprite(maze.startCoord());

  this.bindKeyDown();
}


function initialize() {
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
  player = new Player(maze, mazeCanvas, cellSize, displayVictoryMessage, sprite);
  if (document.getElementById("mazeContainer").style.opacity < "100") {
    document.getElementById("mazeContainer").style.opacity = "100";
  }
}

function findOptimalPath(maze, start, end) {
  const grid = maze.map();
  const startNode = { x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null };
  const endNode = { x: end.x, y: end.y };
  
  const openSet = [startNode];
  const closedSet = [];
  const directions = [
    { x: 0, y: -1, dir: "north" },  // North
    { x: 1, y: 0, dir: "east" },    // East
    { x: 0, y: 1, dir: "south" },   // South
    { x: -1, y: 0, dir: "west" }    // West
  ];

  while (openSet.length > 0) {
    // Get node with lowest f cost
    openSet.sort((a, b) => a.f - b.f);
    const currentNode = openSet.shift();

    // Check if we've reached the end
    if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
      return reconstructPath(currentNode).length - 1; // Return number of steps
    }

    closedSet.push(currentNode);

    // Check neighbors
    for (const dir of directions) {
      const neighborX = currentNode.x + dir.x;
      const neighborY = currentNode.y + dir.y;

      // Skip if out of bounds
      if (neighborX < 0 || neighborX >= grid.length || 
          neighborY < 0 || neighborY >= grid[0].length) {
        continue;
      }

      // Skip if wall exists (unless it's the end node)
      if (!(neighborX === endNode.x && neighborY === endNode.y) && 
          !grid[currentNode.x][currentNode.y][dir.dir]) {
        continue;
      }

      // Skip if already evaluated
      if (closedSet.some(node => node.x === neighborX && node.y === neighborY)) {
        continue;
      }

      // Calculate scores
      const gScore = currentNode.g + 1;
      const hScore = heuristic(neighborX, neighborY, endNode.x, endNode.y);
      const fScore = gScore + hScore;

      // Check if this path is better
      const existingNode = openSet.find(n => n.x === neighborX && n.y === neighborY);
      if (!existingNode || gScore < existingNode.g) {
        const neighbor = {
          x: neighborX,
          y: neighborY,
          g: gScore,
          h: hScore,
          f: fScore,
          parent: currentNode
        };
        
        if (!existingNode) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return -1;
}

function heuristic(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function reconstructPath(node) {
  const path = [];
  let current = node;
  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  return path;
}
