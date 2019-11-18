var canvas = document.createElement("canvas");
canvas.id = "globalCanvas";
document.body.appendChild(canvas);

var canv = document.getElementById("globalCanvas");
var cont = canv.getContext("2d");
cont.fillStyle = "black";
canv.width = 40 * 40;
canv.height = 40 * 40;
cont.fillRect(0, 0, canv.width, canv.height);

function draw_disk(cont, bNode) {
  // globalCompositeOperation values
  cont.strokeStyle = "#ff0000";
  cont.save();
  cont.beginPath();
  cont.arc(bNode.X, bNode.Y, 15, 0, 2 * Math.PI);
  cont.strokeText(bNode.id, bNode.X + 15, bNode.Y + 15); // if we want the text to be in the circle we need to set visiblitiy so we can see through the circle
  cont.closePath();
  //cont.strokeStyle = ((2 * rstate.color) % 0x8FFFFF).toString(16);
  cont.lineWidth = 0.5;
  //cont.fillStyle = "#" + rstate.color.toString(16);
  cont.fillStyle = "#0000ff";
  cont.fill();
  cont.stroke();
  cont.restore();
}

function draw_location(cont, bNode) {
  // globalCompositeOperation values
  cont.strokeStyle = "#00ff00";
  cont.save();
  cont.beginPath();
  cont.arc(bNode.X, bNode.Y, 15, 0, 2 * Math.PI);
  cont.strokeText(bNode.id, bNode.X + 15, bNode.Y + 15); // if we want the text to be in the circle we need to set visiblitiy so we can see through the circle
  cont.closePath();
  //cont.strokeStyle = ((2 * rstate.color) % 0x8FFFFF).toString(16);
  cont.lineWidth = 0.5;
  //cont.fillStyle = "#" + rstate.color.toString(16);
  cont.fillStyle = "#0000ff";
  cont.fill();
  cont.stroke();
  cont.restore();
}

function draw_edge(cont, curNode, prevNode) {
  cont.beginPath();
  cont.moveTo(prevNode.X, prevNode.Y);
  cont.quadraticCurveTo(
    Math.abs(curNode.level - prevNode.level + 1) * 80,
    curNode.Y,
    curNode.X,
    curNode.Y
  );
  cont.strokeStyle = "#0000ff";
  cont.stroke();
}

function draw_causeway(cont, curNode, prevNode) {
  cont.beginPath();
  cont.moveTo(prevNode.X, prevNode.Y);
  cont.quadraticCurveTo(
    Math.abs(curNode.level - prevNode.level + 1) * 80,
    curNode.Y,
    curNode.X,
    curNode.Y
  );
  cont.strokeStyle = "#0000ff";
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
      nextNode[unmatchedIndices[1]] !== 0 &&
        nextNode[unmatchedIndices[1]] !== limits[unmatchedIndices[1]]
    ) {
      return true;
    } else if (
      (nextNode[unmatchedIndices[1]] === 0 ||
        nextNode[unmatchedIndices[1]] === limits[unmatchedIndices[1]]) &&
      nextNode[unmatchedIndices[0]] !== 0 &&
        nextNode[unmatchedIndices[0]] !== limits[unmatchedIndices[0]]
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

//Using the starting room sum and id limits, generates a room id with the best residue
function getBestResidue(sum, a, b, c) {
  //Fields/IDs
  var f1,
    f2,
    f3 = 0;
  //First field
  f1 = a;
  //Set to lowest given ID limit
  if (f1 > b) {
    f1 = b;
  }
  if (f1 > c) {
    f1 = c;
  }

  var remainder = sum - f1;

  //Second field
  f2 = Math.floor(remainder / 2);
  //Third field
  f3 = remainder - f2;

  return getResidue({ id: [f1, f2, f3] });
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

          if (!allNodes[a][b][c].visited) {
            //Push Node to list/array
            potentialNodes.push(allNodes[a][b][c]);

            draw_causeway(cont, currentNode, allNodes[a][b][c]);
          } else {
            //Just draw an edge to it
            // draw_causeway(cont, currentNode, allNodes[a][b][c]);
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
    let nextNode = this.potentialNodes.shift();
    this.visitedNodes.push(nextNode);

    // update Colors
    this.color = "black";
    nextNode.color = "green";

    // drawEdge(previousNode, currentNode);

    // on first visit
    if (nextNode.visited === false) {
      nextNode.visited = true;
      nextNode.level = this.level + 1;

      // handle first visit to level
      if (arrayGrid[nextNode.level] === undefined) {
        arrayGrid[nextNode.level] = 0;
      }
      //   add node to level
      ++arrayGrid[nextNode.level];

      //   set X and Y based on position from left
      nextNode.X = arrayGrid[nextNode.level] * 50;
      nextNode.Y = nextNode.level * 50;

      // populate potential nodes ONLY when node is visited
      nextNode.potentialNodes = getPotentialNodes(nextNode, allNodes);

      // drawNode(nextNode);
      draw_disk(cont, nextNode);
    }

    nextNode.parent.push(this);

    return nextNode;
  }
}

const allNodes = createAllNodes(16, 8, 7);
const bestResidue = getBestResidue(16, 16, 8, 7);
console.log("allNodes", allNodes);

// create root node and set it to be drawn here
let currentNode = allNodes[16][0][0];
currentNode.setRoot();
console.log("Root Node", currentNode);
console.log("Root set", currentNode.id);
//Set as Node with the best residue so far
let bestResidueNode = currentNode;

// maybe in order to show the step of the placing down a circle we
// place one that has the stroke of yellow
// then before we place the new node we place the old spot with a new stroke of blue
// 1) root stroke w/ yellow
// 2) before the next node we replace the root location w/ stroke blue

draw_location(cont, currentNode);

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
<<<<<<< HEAD
    console.log("Moving > NEXT", currentNode.id, currentNode.parent);
=======
    //Check if current node has a lower residue than the lowest occurence so far
    if (currentNode.residue < bestResidueNode.residue) {
      bestResidueNode = currentNode;
    }
    //If new current node has min residue, we are done
    if (currentNode.residue === bestResidue) {
      stopMainLoop();
    }
    //Redraw location/currentNode and previousNode
    draw_location(cont, currentNode);
    draw_edge(cont, currentNode, previousNode);
    draw_disk(cont, previousNode);
    console.log(
      "Moving > NEXT",
      currentNode.id,
      currentNode.residue,
      currentNode
    );
>>>>>>> edits
  } else {
    if (currentNode.isRoot) {
      // we have returned to the root node and it has
      // no more paths to take.  we should finish
      console.log("Finished");
      clearInterval(mainLoop);
      //Jump to the node that had the lowest residue
      draw_location(cont, bestResidueNode);
      draw_disk(cont, currentNode);
    } else {
      //move back to the parent node and restart the loop
      currentNode = currentNode.parent.pop();
      console.log("Moving > PARENT", currentNode.id, currentNode.parent);
    }
  }
}, 1000);

function stopMainLoop() {
  clearInterval(mainLoop);
}
