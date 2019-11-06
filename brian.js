function followsLimitRule(nextNode) { 
  //Check if follows limit rule and return true if so
  ( nextNode[0] <= 16) && (nextNode[1] <= 8) && (nextNode[2] <= 7)
}
​
​
function  followsSumRule (currentNode, nextNode ){
  let sumCurrent = sum(currentNode.id)
  let sumNext = sum(nextNode)

  return (sumCurrent == sumNext)
}
​
function followsSingleSameAndZeroMaxRule(currentNode, nextNode, limits){
  let matcheIndices = [];
  let currentId = currentNode.id;
  
  //iterate through next cave and current cave node evaluating matches
  for (let i = 0; i < currentId.length; i++){
      if(currentId[i] == nextNode[i]) {
          matcheIndices.push(i);
      }
  }
  if (matches == 1){
      return true;
  } else{
      return false;
  }
}
​
function isDifferent(currentNode, nextNode){
  let matches = 0;
  let arr = currentNode.id;
  
  //iterate through next cave and current cve node evaluating matches
  for (let i = 0; i < captureEvents.length; i++){
      if (arr[i] == nextNode[i])
          matches++;
  }
  if (matches == 3 ){
      return false;
  } else{
      return true;
  } 
}
​
function isValidnode(currentNode, nextNode){
  return followsSingleSameRule(currentNode, nextNode) && 
  isDifferent(currentNode, nextNode) && 
  followsSumRule(currentNode, nextNode ) && 
  followsLimitRule(nextNode)
}
​

//Given the nodeObject, calculates and returns it's "Residue"
//ID: {a,b,c}, Residue = (|a-b|) + (|a-c|) + (|b-c|)
function getResidue(nodeObject) {
  //Get id/array of nodeObject
  let arr = nodeObject.id;

  //Calculate and return Residue
  return (
    Math.abs(arr[0] - arr[1]) +
    Math.abs(arr[0] - arr[2]) +
    Math.abs(arr[1] - arr[2])
  );
}

//Function: getPotentialNodes(nodeObject)
function getPotentialNodes(currentNode) {
  //Use some sort of combinatorial generator to make a list of valid nodes (using the function isValidNode)

  //Create empty list/array
  let potentialNodes = [];

  //Nested Loop generating arrays with 3 indexes
  for (let a = 0; a <= 16; a++) {
    for (let b = 0; b <= 8; b++) {
      for (let c = 0; c <= 7; c++) {
        //Create a potential node id/array
        let potentialRoomId = [a, b, c];

        //Check if the id/array is valid
        if (isValidNode(currentNode, potentialRoomId)) {
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
    this.residue = getResidue(id);
    this.potentialNodes = getPotentialNodes(id);
    this.visitedNodes = [];
    this.shouldDraw = false;
  }

  hasNext() {
    return this.potentialNodes.length > 0;
  }

  next() {
    let bestNode = this.potentialNodes.shift();

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
drawNode(currentNode);

let previousNode;
// infinite loop
for (;;) {
  // save the previous node
  previousNode = currentNode;
  // if there is a node to travel to...
  if (currentNode.hasNext()) {
    // we have gotten a NEW node
    // we should draw to the screen here
    currentNode = currentNode.next();
    drawNode(currentNode);
    drawEdge(previousNode, currentNode);
  } else {
    if (currentNode.parent === null) {
      // we have returned to the root node and it has
      // no more paths to take.  we should finish
      break;
    }
    //move back to the parent node and restart the loop
    currentNode = currentNode.parent;
    continue;
  }
}
