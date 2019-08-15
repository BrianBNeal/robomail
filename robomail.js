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

class VillageState {
  //village state includes the current place and collection of parcels
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  //function to move along a road and update state
  move(destination) {
    //checks to see if there is a road going from current location to destination
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

//function that picks a random index from an array
const randomPick = (array) => {
  let choice = Math.floor((Math.random() * array.length));
  return array[choice];
}

//robot that operates by going in a random direction using randomPick
//robots return the direction they've chosen to move
const randomRobot = (state) => {
  return { direction: randomPick(roadGraph[state.place]) };
}

//method for randomly creating parcels for state to test the application
VillageState.random = (parcelCount = 5) => {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    //pick a random location as the parcel's address
    let address = randomPick(Object.keys(roadGraph));
    let place;
    //pick a random place as the parcel's destination, but not the same place it's coming from
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({ place, address });
  }
  console.log(parcels);
  return new VillageState("Post Office", parcels);
};

//testing out the random robot's delivery using random parcels
// runRobot(VillageState.random(), randomRobot);

/**
 * ==========
 * MAIL ROUTE
 * ==========
 */

const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House", "Town Hall", "Daria's House", "Ernie's House", "Grete's House", "Shop", "Grete's House", "Farm", "Marketplace", "Post Office"
];

const routeRobot = (state, memory) => {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
}

// runRobot(VillageState.random(), routeRobot, []);

/**
 * ============
 * PATH FINDING
 * ============
 */

//params are the map, starting location, and destination
const findRoute = (graph, from, to) => {

  //where you currently are and where you've been along the way
  let work = [{ at: from, route: [] }];

  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      //if you're at the destination then add it to the route and return the route
      if (place == to) return route.concat(place);
      //if you haven't already been where you are, add it to the route and keep going
      if (!work.some(w => w.at == place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
}

//robot that uses route finding to find the shortest route
const goalOrientedRobot = ({ place, parcels }, route) => {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return { direction: route[0], memory: route.slice(1) };
}

runRobot(VillageState.random(), goalOrientedRobot, []);