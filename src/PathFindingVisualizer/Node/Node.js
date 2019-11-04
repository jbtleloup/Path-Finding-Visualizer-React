import React, {Component} from 'react';

import './Node.css';

export default class Node extends Component {
    render() {
        const {
            col,
            isFinish,
            isStart,
            isWall,
            isWeight,
            onMouseDown,
            onMouseEnter,
            onMouseUp,
            row,
        } = this.props;
        const icon = isFinish
            ? <i className="fas fa-flag-checkered"/>
            : isStart
                ? <i className="fas fa-truck-loading"/>
                : isWeight
                    ? <i className="fas fa-traffic-light"/>
                    : '';
        const wallClassName = isWall ? 'node-wall' : '';


        // <i className="fas fa-flag-checkered"></i>
        // <i className="fas fa-truck"></i>
        // <i className="fas fa-truck-loading"></i>

        return (
            <div
                id={`node-${row}-${col}`}
                className={`node ${wallClassName}`}
                onMouseDown={() => onMouseDown(row, col)}
                onMouseEnter={() => onMouseEnter(row, col)}
                onMouseUp={() => onMouseUp()}>{icon}</div>
        );
    }
}