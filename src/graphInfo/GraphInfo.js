import Graph from "../graphLogic/Graph";
import TreeNode from "../graphLogic/TreeNode";
import Weight from "../graphLogic/Weight";
import KeyMaster from "../keyLogic/KeyMaster";

import setV2d from "../myUtils/setV2d";

class GraphInfo {
  constructor() {
    // graph to hold actual nodes
    // keyMaster distribute random keys to nodes
    // weight is holds the optional weight of an edge
    this.graph = new Graph();
    this.keyMaster = new KeyMaster();
    this.weight = new Weight();
    // these fields are specific the tree function that would position the graph as a tree
    this.treeRoots = null;
    this.treeRootsData = null;
  }
  getNumOfNodes = () => {
    return this.keyMaster.getNumOfNodes();
  };
  getAdjacencyList = () => {
    return this.graph.getAdjacencyList();
  };
  getTreeRoots = () => {
    // if we didnt run build tree before run it now
    // if ran it once, no need to run it again when the graph has not changed
    if (!this.treeRoots)
      this.treeRoots = TreeNode.completeBuildTree(
        this.getNumOfNodes(),
        this.getAdjacencyList()
      );
    return this.treeRoots;
  };
  getTreeRootsData = () => {
    const treeRoots = this.getTreeRoots();
    // validate data maake sure that there is no negative coordinates
    // treeRootsData carry some additional info about each root
    // validateData is a bad name bcs data is being modified
    if (!this.treeRootsData)
      this.treeRootsData = TreeNode.validateData(
        TreeNode.completeTreeNodeData(treeRoots)
      );
    return this.treeRootsData;
  };
  completeTreeRootsDFS = (roots = this.getTreeRoots()) => {
    if (!roots.length) return [];
    // run dfs on all roots, and return the result orderly
    // used later to run an animation
    let paths = [];
    for (const root of roots) {
      let path = [];
      this.treeRootDFS(root, path);
      paths.push(path);
    }
    return paths;
  };
  treeRootDFS = (root, path) => {
    // recursive dfs on single root
    // push nodes twice to use them later for animations

    const idx = root.idx;
    path.push(idx);

    for (const next of root.children) {
      this.treeRootDFS(next, path);
      path.push(next.idx);
    }
  };
  completeTreeRootsBFS = (treeRootsData = this.getTreeRootsData()) => {
    // compute tree of all components using treeRootBFS (that does so for single component) using
    if (!treeRootsData.length) return [];

    let paths = [];
    for (const data of treeRootsData) {
      const { mp, X, Y } = data;
      paths.push(this.treeRootBFS(mp, Y));
    }
    return paths;
  };
  treeRootBFS = (mp, Y) => {
    // we just push nodes to required level
    // setV2d(Y + 1, 0);
    let nodesAtLevelI = setV2d(Y + 1, 0, "array");
    for (const [key, val] of mp) {
      nodesAtLevelI[val.y].push(key);
    }
    return nodesAtLevelI;
  };
  completeDFS = () => {
    return this.graph.completeDFS(this.getNumOfNodes());
  };
  completeBFS = () => {
    return this.graph.completeBFS(this.getNumOfNodes());
  };
  getBFSPath = () => {
    const nodesAtLevelI = this.graph.BFS();
    // console.log(nodesAtLevelI);

    return nodesAtLevelI;
  };
  isCyclic = () => {
    return this.graph.isCyclic();
  };
  getDFSPath = () => {
    let path = [];
    this.graph.DFS(path);
    return path;
  };
}
export default GraphInfo;
