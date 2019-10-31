import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../Algorithms/Dijkstra';

import './PathfindingVisualizer.css';
import {bellmanFord, getNodesInShortestPathOrderBF} from "../Algorithms/BellmanFord";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
    constructor(props) {
        super(props);
        this.wPressed = this.wPressed.bind(this);
        this.state = {
            grid: [],
            mouseIsPressed: false,
            startIsPressed: false,
            endIsPressed: false,
            wKeyIsPressed: false,
            previousStart: {row: START_NODE_ROW, col: START_NODE_COL},
            previousEnd: {row: FINISH_NODE_ROW, col: FINISH_NODE_COL},
            isAlgoDone: false,
            isAnimation: false,
        };
    }

    componentDidMount() {
        const grid = getInitialGrid();
        this.setState({grid});
        document.addEventListener("keydown", this.wPressed, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.wPressed, false);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let finishDijkstra = ((this.state.endIsPressed || this.state.startIsPressed) && this.state.isAlgoDone
            && (prevState.previousEnd !== this.state.previousEnd || prevState.previousStart !== this.state.previousStart));
        if (finishDijkstra) this.visualizeDijkstra(false);
    }

    wPressed(event) {
        if (event.keyCode === 87) {
            this.setState({wKeyIsPressed: !this.state.wKeyIsPressed})
        }
    }

    handleMouseDown(row, col, isStart, isEnd) {
        if (!this.state.isAnimation) {
            if (isStart) {
                this.setState({startIsPressed: true, mouseIsPressed: true, previousStart: {row, col}});
            } else if (isEnd) {
                this.setState({endIsPressed: true, mouseIsPressed: true, previousEnd: {row, col}});
            } else {
                let newGrid;
                if (this.state.wKeyIsPressed) {
                    newGrid = getNewGridWithWeightToggled(this.state.grid, row, col);
                } else {
                    newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
                }
                this.setState({grid: newGrid, mouseIsPressed: true});
            }
        }
    }

    handleMouseEnter(row, col) {
        if (!this.state.mouseIsPressed) return;
        if (!this.state.startIsPressed && !this.state.endIsPressed) {
            let newGrid;
            if (this.state.wKeyIsPressed) {
                newGrid = getNewGridWithWeightToggled(this.state.grid, row, col);
            } else {
                newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
            }
            this.setState({grid: newGrid});
        } else {
            // Avoid case where endNode = StartNode = wall
            const currentNode = this.state.grid[row][col];
            if (!currentNode.isWall) {
                if (this.state.startIsPressed && !currentNode.isFinish) {
                    const newGrid = getNewGridWithStartNodeUpdated(this.state.grid, this.state.previousStart, row, col);
                    this.setState({grid: newGrid, previousStart: {row, col}});
                } else if (!currentNode.isStart && this.state.endIsPressed) {
                    const newGrid = getNewGridWithEndNodeUpdated(this.state.grid, this.state.previousEnd, row, col);
                    this.setState({grid: newGrid, previousEnd: {row, col}});
                }
            }
        }
    }

    handleMouseUp() {
        this.setState({mouseIsPressed: false, startIsPressed: false, endIsPressed: false});
    }

    //Todo: this function should be merged w/ animateDijkstra
    /// display Algorithm without time out or animation, instant display
    displayDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
        // We don't want the animation to cover the end Node (hence - 1)
        const visitedNodesInOrderLength = visitedNodesInOrder.length - 1;
        // We start at 1 so the animation do not cover the start Node
        for (let i = 1; i <= visitedNodesInOrderLength; i++) {
            if (i === visitedNodesInOrderLength) {
                for (let i = 1; i < nodesInShortestPathOrder.length - 1; i++) {
                    const node = nodesInShortestPathOrder[i];
                    document.getElementById(`node-${node.row}-${node.col}`).className =
                        'node node-shortest-path-na';
                }
                return;
            }
            const node = visitedNodesInOrder[i];
            document.getElementById(`node-${node.row}-${node.col}`).className =
                'node node-visited-na';
        }
    }

    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
        this.setState({isAnimation: true});
        //todo: length - 1 does not work -> impossible case gives us a grid
        // not totally explored (last nod not visually explored)
        // use bool isEnd instead

        // We don't want the animation to cover the end Node (hence - 1)
        const visitedNodesInOrderLength = visitedNodesInOrder.length - 1;
        // We start at 1 so the animation do not cover the start Node
        for (let i = 1; i <= visitedNodesInOrderLength; i++) {
            if (i === visitedNodesInOrderLength) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, 10 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                //TODO: look to get rid off that document.getElementById maybe add to condition in Node.js
                document.getElementById(`node-${node.row}-${node.col}`).className =
                    'node node-visited';
            }, 10 * i);
        }
    }

    animateShortestPath(nodesInShortestPathOrder) {
        // We start at one so the animation does not cover start node
        // same for end Node (length - 1)
        for (let i = 1; i < nodesInShortestPathOrder.length - 1; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).className =
                    'node node-shortest-path';
            }, 50 * i);
        }
        // End of the animation, Algorithm is done
        this.setState({
            isAlgoDone: true,
            isAnimation: false,
        })
    }

    visualizeDijkstra(animate = true) {
        const {grid, previousStart, previousEnd} = this.state;
        const startNode = grid[previousStart.row][previousStart.col];
        const finishNode = grid[previousEnd.row][previousEnd.col];
        const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
        if (animate)
            this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
        else {
            //TODO: refactor

            // let grid = getInitialGrid();
            // const previousStart = this.state.previousStart;
            // const previousEnd = this.state.previousEnd;
            // grid = getNewGridWithStartNodeUpdated(grid, {
            //     row: START_NODE_ROW,
            //     col: START_NODE_COL
            // }, previousStart.row, previousStart.col);
            // grid = getNewGridWithEndNodeUpdated(grid, {
            //     row: FINISH_NODE_ROW,
            //     col: FINISH_NODE_COL
            // }, previousEnd.row, previousEnd.col);
            const grid = resetNodesVisited(this.state.grid);
            this.setState({grid});
            this.displayDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
        }

    }

    animateBellmanFord(visitedNodesInOrder, nodesInShortestPathOrder) {
        this.setState({isAnimation: true});
        // No animation on start and finish node
        visitedNodesInOrder = visitedNodesInOrder.filter( node => (!node.isStart && !node.isFinish));
        // We don't want the animation to cover the end Node (hence - 1)
        const visitedNodesInOrderLength = visitedNodesInOrder.length - 1;
        for (let i = 0; i <= visitedNodesInOrderLength; i++) {
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                // Change background back to white
                if (i>0) {
                    const previousNode = visitedNodesInOrder[i-1];
                    document.getElementById(`node-${previousNode.row}-${previousNode.col}`).classList.remove('node-visited-na');
                }
                // display shortest path and change background back to white to the last node
                if (i === visitedNodesInOrderLength) {
                    const previousNode = visitedNodesInOrder[i-1];
                    document.getElementById(`node-${previousNode.row}-${previousNode.col}`).classList.remove('node-visited-na');
                    setTimeout(() => {
                        this.animateShortestPath(nodesInShortestPathOrder);
                    }, 10);
                    return;
                }
                //TODO: look to get rid off that document.getElementById maybe add to condition in Node.js
                document.getElementById(`node-${node.row}-${node.col}`).className += ' node-visited-na';
            }, 2*i);
        }
    }

    visualizeBellmanFord() {
        const {grid, previousStart, previousEnd} = this.state;
        const startNode = grid[previousStart.row][previousStart.col];
        const finishNode = grid[previousEnd.row][previousEnd.col];
        const visitedNodesInOrder = bellmanFord(grid, startNode, finishNode);
        const nodesInShortestPathOrder = getNodesInShortestPathOrderBF(finishNode);
        this.animateBellmanFord(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    render() {
        const {grid, mouseIsPressed, wKeyIsPressed} = this.state;
        return (
            <>
                <button onClick={() => this.visualizeDijkstra()}>
                    Visualize Dijkstra's Algorithm
                </button>
                <button onClick={() => this.visualizeBellmanFord()}>
                    Visualize Bellman Ford's Algorithm
                </button>
                <span className={!wKeyIsPressed ? 'hidden' : ''}>Weight</span>
                <div className="grid">
                    {grid.map((row, rowIdx) => {
                        return (
                            <div key={rowIdx}>
                                {row.map((node, nodeIdx) => {
                                    const {row, col, isFinish, isStart, isWall, isWeight} = node;
                                    return (
                                        <Node
                                            key={nodeIdx}
                                            col={col}
                                            isFinish={isFinish}
                                            isStart={isStart}
                                            isWall={isWall}
                                            isWeight={isWeight}
                                            mouseIsPressed={mouseIsPressed}
                                            onMouseDown={() => this.handleMouseDown(row, col, isStart, isFinish)}
                                            onMouseEnter={() => this.handleMouseEnter(row, col)}
                                            onMouseUp={() => this.handleMouseUp()}
                                            row={row}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }
}
const getInitialGrid = () => {
    const grid = [];
    for (let row = 0; row < 20; row++) {
        const currentRow = [];
        for (let col = 0; col < 50; col++) {
            currentRow.push(createNode(col, row));
        }
        grid.push(currentRow);
    }
    return grid;
};
const createNode = (col, row) => {
    return {
        col,
        row,
        isStart: row === START_NODE_ROW && col === START_NODE_COL,
        isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
        distance: Infinity,
        isVisited: false,
        isWall: false,
        isWeight: false,
        previousNode: null,
    };
};
const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    newGrid[row][col] = {
        ...node,
        isWall: !node.isWall,
        isWeight: false,
    };
    return newGrid;
};
const getNewGridWithWeightToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    newGrid[row][col] = {
        ...node,
        isWeight: !node.isWeight,
        isWall: false,
    };
    return newGrid;
};
const getNewGridWithStartNodeUpdated = (grid, pStart, row, col) => {
    const newGrid = grid.slice();
    const previousStart = newGrid[pStart.row][pStart.col];
    const newStart = newGrid[row][col];

    newGrid[pStart.row][pStart.col] = {
        ...previousStart,
        isStart: false,
    };

    newGrid[row][col] = {
        ...newStart,
        isStart: true,
    };
    return newGrid;
};
const getNewGridWithEndNodeUpdated = (grid, pEnd, row, col) => {
    const newGrid = grid.slice();
    const previousEnd = newGrid[pEnd.row][pEnd.col];
    const newEnd = newGrid[row][col];

    newGrid[pEnd.row][pEnd.col] = {
        ...previousEnd,
        isFinish: false,
    };

    newGrid[row][col] = {
        ...newEnd,
        isFinish: true,
    };
    return newGrid;
};
// We are resetting the grid entirely which is not optimal
const resetNodesVisited = (grid) => {
    let newGrid = [];
    for (let row = 0; row < 20; row++) {
        const currentRow = [];
        for (let col = 0; col < 50; col++) {
            let node = {
                ...grid[row][col],
                isVisited: false,
                previousNode: null,
                distance: Infinity,
            };
            currentRow.push(node);
            //Todo: take care of this document.getElementById!
            document.getElementById(`node-${node.row}-${node.col}`).classList.remove(
                "node-visited", "node-visited-na", "node-shortest-path-na", "node-shortest-path");

        }
        newGrid.push(currentRow);
    }
    return newGrid;
};



