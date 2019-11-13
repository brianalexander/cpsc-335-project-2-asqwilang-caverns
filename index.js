var canvas = document.createElement('canvas');
canvas.id = 'globalCanvas';
document.body.appendChild(canvas);

var canv = document.getElementById('globalCanvas');
var cont = canv.getContext('2d');
cont.fillStyle = 'black'
canv.width = 40 * 40;
canv.height = 40 * 40;
cont.fillRect(0, 0, canv.width, canv.height);

function draw_disk(cont, bNode)
{
  // globalCompositeOperation values
    cont.save( );
    cont.beginPath( );
    cont.arc(bNode.X, bNode.Y, 15, 0, 2 * Math.PI);
    cont.strokeText(bNode.id, bNode.X + 15, bNode.Y + 15);  // if we want the text to be in the circle we need to set visiblitiy so we can see through the circle
    cont.closePath();
    //cont.strokeStyle = ((2 * rstate.color) % 0x8FFFFF).toString(16);
    cont.lineWidth = 0.5;
    //cont.fillStyle = "#" + rstate.color.toString(16);
    cont.fillStyle = '#0000ff'
    cont.fill( );
    cont.stroke( );
    cont.restore( );
}

function draw_edge(cont, curNode, prevNode)
{
    cont.beginPath();
    cont.moveTo(prevNode.X, prevNode.Y);
    cont.lineTo(curNode.X, curNode.Y);
    cont.strokeStyle = '#0000ff';
    cont.stroke();
}

const arrayGrid = [];

function arraySum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function followsLimitRule(nextNode, x = 16, y = 8, z = 7) {
  //Check if follows limit rule and return true if so
  return nextNode[0] <= x && nextNode[1] <= y && nextNode[2] <= z;
}

function followsSumRule(currentNode, nextNode) {
  const sumCurrent = arraySum(currentNode.id);
  const sumNext = arraySum(nextNode);

  return sumCurrent === sumNext;
}

function followsSingleSameAndZeroMaxRule(
  currentNode,
  nextNode,
  limits = [16, 8, 7]
) {
  let unmatchedIndices = [];
  let currentId = currentNode.id;

  //iterate through next cave and current cave node evaluating matches
  for (let i = 0; i < currentId.length; i++) {
    if (currentId[i] !== nextNode[i]) {
      unmatchedIndices.push(i);
    }
  }

  // check that 2 items were changed...
  if (unmatchedIndices.length == 2) {
    //check if one item was set to zero or it's limit
    if (
      (nextNode[unmatchedIndices[0]] === 0 ||
        nextNode[unmatchedIndices[0]] === limits[unmatchedIndices[0]]) &&
      (nextNode[unmatchedIndices[1]] !== 0 &&
        nextNode[unmatchedIndices[1]] !== limits[unmatchedIndices[1]])
    ) {
      return true;
    } else if (
      (nextNode[unmatchedIndices[1]] === 0 ||
        nextNode[unmatchedIndices[1]] === limits[unmatchedIndices[1]]) &&
      (nextNode[unmatchedIndices[0]] !== 0 &&
        nextNode[unmatchedIndices[0]] !== limits[unmatchedIndices[0]])
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function isValidNode(currentNode, nextNode) {
  if (!followsSingleSameAndZeroMaxRule(currentNode, nextNode)) {
    // console.log("Failed single-same or zero-max rule");
    return false;
  }

  if (!followsSumRule(currentNode, nextNode)) {
    // console.log("failed sum-rule");
    return false;
  }

  if (!followsLimitRule(nextNode)) {
    // console.log("failed limit rule");
    return false;
  }

  return true;
}

//Given the nodeObject, calculates and returns it's "Residue"
//ID: {a,b,c}, Residue = (|a-b|) + (|a-c|) + (|b-c|)
function getResidue(nodeObject) {
  //Calculate and return Residue
  return (
    Math.abs(nodeObject.id[0] - nodeObject.id[1]) +
    Math.abs(nodeObject.id[0] - nodeObject.id[2]) +
    Math.abs(nodeObject.id[1] - nodeObject.id[2])
  );
}

function createAllNodes(x = 16, y = 8, z = 7) {
  let potentialNodes = [];

  //Nested Loop generating arrays with 3 indexes
  for (let a = 0; a <= x; a++) {
    potentialNodes.push([]);
    for (let b = 0; b <= y; b++) {
      potentialNodes[a].push([]);
      for (let c = 0; c <= z; c++) {
        //If valid, create the nodeObject
        let validNode = new Node([a, b, c]);

        //Push Node to list/array
        potentialNodes[a][b].push(validNode);
      }
    }
  }

  return potentialNodes;
}

//Function: getPotentialNodes(nodeObject)
function getPotentialNodes(currentNode, allNodes, x = 16, y = 8, z = 7) {
  //Use some sort of combinatorial generator to make a list of valid nodes (using the function isValidNode)

  //Create empty list/array
  let potentialNodes = [];

  //Nested Loop generating arrays with 3 indexes
  for (let a = 0; a <= x; a++) {
    for (let b = 0; b <= y; b++) {
      for (let c = 0; c <= z; c++) {
        //Check if the id/array is valid
        // console.log("testing node", currentNode.id, potentialRoomId);
        if (isValidNode(currentNode, [a, b, c])) {
          //If valid, create the nodeObject

          if(!allNodes[a][b][c].visited) {
            //Push Node to list/array
            potentialNodes.push(allNodes[a][b][c]);
          }
          else{
            //Just draw an edge to it
            draw_edge(cont, currentNode, allNodes[a][b][c]);
          }
        }
      }
    }
  }

  //Return a SORTED list of potential nodes given a current nodes
  potentialNodes.sort((nodeA, nodeB) => {
    return nodeA.residue - nodeB.residue;
  });

  return potentialNodes;
}

class Node {
  constructor(id, parent = []) {
    this.parent = parent;
    this.id = id;
    this.visited = false;
    this.visitedNodes = [];
    this.shouldDraw = false;
    this.residue = getResidue(this);

    // If this is the ROOT node, populate potential nodes
    // at instantiation
  }

  setRoot() {
    this.isRoot = true;
    this.level = 0;
    this.potentialNodes = getPotentialNodes(this, allNodes);
    this.X = canv.width / 2;
    this.Y = 50;
    this.color = "green";
    // drawNode
  }

  hasNext() {
    return this.potentialNodes.length > 0;
  }

  next() {
    let bestNode = this.potentialNodes.shift();
    this.visitedNodes.push(bestNode);

    // update Colors
    this.color = "black";
    bestNode.color = "green";

    // drawEdge(previousNode, currentNode);

    // on first visit
    if (bestNode.visited === false) {
      bestNode.visited = true;
      bestNode.level = this.level + 1;

      // handle first visit to level
      if (arrayGrid[bestNode.level] === undefined) {
        arrayGrid[bestNode.level] = 0;
      }
      //   add node to level
      ++arrayGrid[bestNode.level];

      //   set X and Y based on position from left
      bestNode.X = arrayGrid[bestNode.level] * 50;
      bestNode.Y = bestNode.level * 50;

      // populate potential nodes ONLY when node is visited
      bestNode.potentialNodes = getPotentialNodes(bestNode, allNodes);

      // drawNode(bestNode);
      draw_disk(cont, bestNode);
    }

    bestNode.parent.push(this);

    return bestNode;
  }
}

class Edge {
  constructor(fromNode, toNode) {
    this.fromNode = fromNode;
    this.toNode = toNode;
  }
}

const allNodes = createAllNodes(16, 8, 7);
console.log("allNodes", allNodes);

// create root node and set it to be drawn here
let currentNode = allNodes[16][0][0];
currentNode.setRoot();
console.log("Root Node", currentNode);
console.log("Root set", currentNode.id);
// drawNode(currentNode);

// maybe in order to show the step of the placing down a circle we
// place one that has the stroke of yellow
// then before we place the new node we place the old spot with a new stroke of blue
// 1) root stroke w/ yellow
// 2) before the next node we replace the root location w/ stroke blue






cont.strokeStyle = "#ff0000";
cont.stroke();
draw_disk(cont, currentNode);

let previousNode;
// infinite loop

const mainLoop = setInterval(() => {
  // save the previous node
  previousNode = currentNode;
  // if there is a node to travel to...
  if (currentNode.hasNext()) {
    // we have gotten a NEW node
    // we should draw to the screen here
    currentNode = currentNode.next();
    cont.strokeStyle = "#ff0000";
    cont.stroke();
    draw_edge(cont, currentNode, previousNode);
    console.log("Moving > NEXT", currentNode.id, currentNode.residue, currentNode);
  } else {
    if (currentNode.isRoot) {
      // we have returned to the root node and it has
      // no more paths to take.  we should finish
      console.log("Finished");
      clearInterval(mainLoop);
    } else {
      //move back to the parent node and restart the loop
      currentNode = currentNode.parent.pop();
      console.log("Moving > PARENT", currentNode.id, currentNode.residue);
    }
  }
}, 1000);

function stopMainLoop() {
  clearInterval(mainLoop);
}
