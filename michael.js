//import nodeObject from file.js
//If the node structure needs to be referenced
//Assuming yes, creating and returning new nodeObjects

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

//Function: bestNodeNotVisited(potentialNodes, visitedNodes)
//Given a list of potentialNodes and a list of visitedNodes (they have node objects), return the node that moves us to the smallest ‘residue’
function bestNodeNotVisited(potentialNodes, visitedNodes) {
  //Create a copy of potential Nodes list
  let copyPN = potentialNodes.slice(0);

  //For each Node in the visited node list
  visitedNodes.forEach(
    //Using each item of the list
    function(itemV) {
      //Find and hold the index of the item/node in copyPN
      let index = copyPN.findIndex(
        //That has a matching id to the item/node from the visited list
        function(itemP) {
          return itemV.id == itemP.id;
        }
      );

      //Remove that Node/Index from copyPN
      copyPN.splice(index, 1);
    }
  );

  let bestIndex = 0;
  let bestResidue = getResidue(copyPN[0]);

  //For every other index after 1 in copyPN
  for (let i = 1; i < copyPN.length; i++) {
    //Get the residue of Node
    testResidue = getResidue(copyPN[i]);

    //Check if test Residue is lower than current Best
    if (testResidue < bestResidue) {
      //If so, set as best and set bestIndex
      bestResidue = testResidue;
      bestIndex = i;
    }
  }

  //Returns nodeObject
  return copyPN[bestIndex];
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
        let potentialNode = [a, b, c];

        //Check if the id/array is valid
        if (isValidNode(currentNode, potentialNode)) {
          //If valid, create the nodeObject
          let newNode = new nodeObject();

          //Assign valid id/array
          newNode.id = potentialNode;

          //Push Node to list/array
          potentialNodes.push(newNode);
        }
      }
    }
  }
  //Returns a list of potential nodes given a current nodes
  return potentialNodes;
}
