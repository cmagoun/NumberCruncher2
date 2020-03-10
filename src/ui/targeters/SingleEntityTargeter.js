import React, { Component } from 'react';
import withContext from '../../ecs/withContext';
import {tileSize, onSpace, arenaY} from '../../game/Constants';
import * as Animate from '../../game/systems/Animate';

class SingleEntityTargeter extends Component {
    constructor(props) {
        super(props);
        this.mouseUp = this.handleMouseUp.bind(this);
        this.keyUp = this.handleKeyUp.bind(this);
        this.possibleTargets = props.possibleTargets;
        this.animations = [];
    }

    render() {
        return <div style={{display:"none"}}></div>
    }

    componentDidMount() {
        document.addEventListener("mouseup", this.mouseUp);
        window.addEventListener("keyup", this.keyUp);
        this.animations = this.possibleTargets.map(pt => Animate.flash(pt, null, this.props.flashColor, 500));
    }

    componentWillUnmount() {
        document.removeEventListener("mouseup", this.mouseUp);
        window.removeEventListener("keyup", this.keyUp);
        this.animations.forEach(a => Animate.stop(a));
    }

    handleKeyUp(evt) {
        if(!this.props.events) return 
        const key = evt.key;
        if(key === "Escape") this.props.gm.cancelInteraction();
    }

    handleMouseUp(evt) {
        if(!this.props.events) return;
        const co = this.props.gm.cameraOrigin;
        
        const x = Math.floor((evt.clientX)/tileSize) + co.x;
        const y = Math.floor((evt.clientY-arenaY)/tileSize) + co.y;


        const hits = this.possibleTargets.filter(e => onSpace(e, {x,y}));

        if(hits.length > 0) {
            this.props.gm.fireReadyInteraction({...this.props.info, targets:hits});
        }
    }
}

export default withContext(SingleEntityTargeter);