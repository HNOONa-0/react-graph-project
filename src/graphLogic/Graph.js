import { Fill, maxNodes } from "../myData/limits";
import setV2d from "../myUtils/setV2d";

class Graph {
  constructor() {
    // init data fields as necessary
    this.graphMap = setV2d(maxNodes + 10, maxNodes + 10, "array", "0");
    this.edgeStack = setV2d(maxNodes + 10, maxNodes + 10, "array", "array");
    // adjacency list is of type set
    this.adjacencyList = setV2d(maxNodes + 10, 0, "set");
  }
  getAdjacencyList = () => {
    return this.adjacencyList;
  };
  getEdgeStack = () => {
    return this.edgeStack;
  };
  getGraphMap = () => {
    return this.graphMap;
  };
  addEdge = (a, b, isDirected) => {
    // m < M
    // this is a way to add edges orderly, we need to do this later for optimization
    const m = Math.min(a, b);
    const M = Math.max(a, b);
    const isForward = a === m && b === M;
    // add to our adjacency list
    this.graphMap[a][b] = 1;
    this.adjacencyList[a].add(b);

    // if its undirected also write opposite edge
    if (!isDirected) {
      this.graphMap[b][a] = 1;
      this.adjacencyList[b].add(a);
    }
    // this step is to optimize graph reconstruction
    // if we delete some edges from the end
    this.edgeStack[m][M].push({ isDirected, isForward });
  };
  undoEdge = (a, b) => {
    // a < b
    if (this.edgeStack[a][b].empty()) return;
    // remove edge from the stack
    this.edgeStack[a][b].pop();
    if (this.edgeStack[a][b].empty()) {
      this.graphMap[a][b] = 0;
      this.adjacencyList[a].delete(b);

      this.graphMap[b][a] = 0;
      this.adjacencyList[b].delete(a);
      return;
    }
    // was the recorded stack forward
    // we need to be careful bcs depending on what order we recorded
    // we need to update accordingly
    const { isDirected, isForward } = this.edgeStack[a][b].top();

    if (!isDirected) {
      this.graphMap[a][b] = 1;
      this.adjacencyList[a].add(b);
      this.graphMap[b][a] = 1;
      this.adjacencyList[b].add(a);
    } else if (isForward) {
      this.graphMap[a][b] = 1;
      this.adjacencyList[a].add(b);
      this.graphMap[b][a] = 0;
      this.adjacencyList[b].delete(a);
    } else {
      this.graphMap[a][b] = 0;
      this.adjacencyList[a].delete(b);
      this.graphMap[b][a] = 1;
      this.adjacencyList[b].add(a);
    }
  };
  // some of these functions may not be used/needed
  completeBFS = (n) => {
    // run bfs on all components of the graph
    if (!n) return [];

    let paths = [];
    let visited = setV2d(maxNodes + 10, 0, "false");

    for (let i = 1; i < n; i++) {
      if (visited[i]) continue;
      paths.push(this.BFS(i, visited));
    }
    return paths;
  };
  completeDFS = (n) => {
    // run dfs on all components of the graph
    if (!n) return [];
    let paths = [];
    let visited = setV2d(maxNodes + 10, 0, "false");

    for (let i = 1; i < n; i++) {
      if (visited[i]) continue;

      let path = [];
      this.DFS(path, visited, 0, i);
      paths.push(path);
    }
    return paths;
  };
  DFS = (
    path = undefined,
    visited = setV2d(maxNodes + 10, 0, "false"),
    from = 0,
    cur = 1
  ) => {
    // run dfs on single component of the graph
    if (visited[cur]) return;

    visited[cur] = true;
    if (path) path.push(cur);

    for (const next of this.adjacencyList[cur]) {
      if (next === from) continue;

      this.DFS(path, visited, cur, next);

      if (path) path.push(next);
    }
  };
  BFS = (cur = 1, visited = setV2d(maxNodes + 10, 0, "false")) => {
    // run bfs on single component of the graph
    let nodesAtIthLevel = [[cur]];
    visited[cur] = true;

    for (let i = 0; i < nodesAtIthLevel.length; i++) {
      for (let j = 0; j < nodesAtIthLevel[i].length; j++) {
        for (const next of this.adjacencyList[nodesAtIthLevel[i][j]]) {
          if (visited[next]) continue;
          visited[next] = true;

          if (nodesAtIthLevel.length <= i + 1)
            nodesAtIthLevel.push(new Array());
          nodesAtIthLevel[i + 1].push(next);
        }
      }
    }
    return nodesAtIthLevel;
  };
  isCyclic = (
    visited = setV2d(maxNodes + 10, 0, "false"),
    from = 0,
    cur = 1
  ) => {
    // naive way of checking for a cycle inside our graph
    if (visited[cur]) return true;

    // mark as visited
    visited[cur] = 1;

    // for all verticies connected cur current vertix
    let r = false;
    for (const next of this.adjacencyList[cur]) {
      if (next === from) continue;

      r = this.isCyclic(visited, cur, next);
      if (r) break;

      visited[next] = 0;
    }
    return r;
  };
  isSingleParent = (n = 0) => {
    // does each node has exactly one parent
    let mp = new Map();
    for (let i = 1; i < n; i++) mp.set(i, 0);

    const maxEdges = 1;

    for (let i = 1; i < n; i++) {
      // map to indicate how many parents for this node exists
      for (const w of this.adjacencyList[i]) {
        let score = mp.get(w);
        if (score + 1 > maxEdges) {
          // console.log(w);
          return false;
        }
        mp.set(w, score + 1);
      }
    }
    return true;
  };
  isSingleComponent = (n = 0) => {
    // does the graph consists only of a single component
    // if so, a dfs should visit all components
    let visited = setV2d(maxNodes + 10, 0, "false");
    this.DFS(undefined, visited);

    for (let i = 1; i < n; i++) if (!visited[i]) return false;
    return true;
  };
}
export default Graph;
