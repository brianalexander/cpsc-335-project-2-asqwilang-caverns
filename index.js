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

function isDifferent(currentNode, nextNode) {
  let currentId = currentNode.id;

  //iterate through next cave and current cve node evaluating matches
  for (let i = 0; i < currentId.length; i++) {
    if (currentId[i] !== nextNode[i]) return false;
  }

  return true;
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
  //   return (
  //     followsSingleSameAndZeroMaxRule(currentNode, nextNode) &&
  //     // isDifferent(currentNode, nextNode) &&
  //     followsSingleSumRule(currentNode, nextNode) &&
  //     followsLimitRule(nextNode)
  //   );
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

//Function: getPotentialNodes(nodeObject)
function getPotentialNodes(currentNode, x = 16, y = 8, z = 7) {
  //Use some sort of combinatorial generator to make a list of valid nodes (using the function isValidNode)

  //Create empty list/array
  let potentialNodes = [];

  //Nested Loop generating arrays with 3 indexes
  for (let a = 0; a <= x; a++) {
    for (let b = 0; b <= y; b++) {
      for (let c = 0; c <= z; c++) {
        //Create a potential node id/array
        let potentialRoomId = [a, b, c];

        //Check if the id/array is valid
        // console.log("testing node", currentNode.id, potentialRoomId);
        if (isValidNode(currentNode, potentialRoomId)) {
          console.log("potential found!");

          //If valid, create the nodeObject
          let validNode = new Node(potentialRoomId, currentNode);

          //Push Node to list/array
          potentialNodes.push(validNode);
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
  constructor(id, parent) {
    this.parent = parent;
    this.id = id;
    this.visitedNodes = [];
    this.shouldDraw = false;
    this.residue = getResidue(this);

    // If this is the ROOT node, populate potential nodes
    // at instantiation
    if (this.parent === null) {
      this.potentialNodes = getPotentialNodes(this);
    }
  }

  hasNext() {
    return this.potentialNodes.length > 0;
  }

  next() {
    let bestNode = this.potentialNodes.shift();

    // populate potential nodes ONLY when node is visited
    bestNode.potentialNodes = getPotentialNodes(bestNode);

    this.visitedNodes.push(bestNode);
    return bestNode;
  }
}

class Edge {
  constructor(fromNode, toNode) {
    this.fromNode = fromNode;
    this.toNode = toNode;
  }
}

// create root node and set it to be drawn here
let currentNode = new Node([16, 0, 0], null);
// drawNode(currentNode);

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
    // drawNode(currentNode);
    // drawEdge(previousNode, currentNode);
    console.log("Moving to new node", currentNode.id);
  } else {
    if (currentNode.parent === null) {
      // we have returned to the root node and it has
      // no more paths to take.  we should finish
      console.log("Finished");
      return;
    }
    //move back to the parent node and restart the loop
    currentNode = currentNode.parent;
    console.log("Moving to parent node", currentNode.id);
    return;
  }
}, 1000);

function stopMainLoop() {
  clearInterval(mainLoop);
}
