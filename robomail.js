//array of all roads, each one being a string that includes the point at each end with a hyphen in the middle
const roads = [
  "Alice's House-Bob's House", "Alice's House-Cabin",
  "Alice's House-Post Office", "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop", "Marketplace-Farm",
  "Marketplace-Post Office", "Marketplace-Shop",
  "Marketplace-Town Hall", "Shop-Town Hall"
];

// function that loops through all the roads and maps where each location connects
const buildGraph = (edges) => {

  //graph object that will be used as a hashtable
  let graph = Object.create(null);

  //function to track where each location connects to by storing arrays of possible destinations under the key name of the current location
  const addEdge = (from, to) => {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }

  //split each road along the hyphen and then addEdge from both ends of the road, do it for all roads
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

console.log(roadGraph);

class VillageState {
  //village state includes the current place and collection of parcels
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    //checks to see if there is a road going from here to there
    if (!roadGraph[this.place].includes(destination)) {
      //if not a valid move, return previous state
      return this;
    } else {
      /**
       *  if a valid move, carry parcels to the new location (the .map) and remove any parcels that should be delivered (the .filter)
       * then return a new state where the destination is now the current location
       *  */
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return { place: destination, address: p.address };
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

//function to operate any delivery robot
const runRobot = (state, robot, memory) => {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns.`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}

//function that picks a random direction to go in
const randomPick = (array) => {
  let choice = Math.floor((Math.random() * array.length));
  return array[choice];
}

//robot that operates by going in a random direction (randomPick)
const randomRobot = (state) => {
  return { direction: randomPick(roadGraph[state.place]) };
}

VillageState.random = (parcelCount = 5) => {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({ place, address });
  }
  return new VillageState("Post Office", parcels);
};