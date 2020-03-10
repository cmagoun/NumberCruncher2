import React, {Component } from 'react';
import withContext from '../ecs/withContext';
import {states} from '../game/NumberCruncher';

const styles = {
    container: {        
        display:"flow",
        flowDirection: "column",
    },
    title: {
        fontSize: "x-large"
    },
    intro: {
        margin:"auto",
        padding: "5px",
        textAlign: "center",
        border: "2px solid white",
        width: "40%",
        height: "100px",
        marginTop: "200px"
    },
    whitespace: {
        width: "10px",
        height: "10px"
    },
    button: {
        width: "200px"
    }
}

class Intro extends Component {
    render() {
        return <div style={styles.container}>
            <div style={styles.intro}>
                <div style={styles.title}>Number Cruncher</div>
                <div style={styles.whitespace}/>
                <div>Some instructions here...</div>
                <div>and here...</div>
                <div>and here...</div>

                <div style={styles.whitespace}/>
                <div>
                    <button style={styles.button} onClick={this.startgame.bind(this)}>Start Game</button>
                </div>
            </div>

        </div>
    }

    startgame() {
        this.props.gm.updateGameState(states.INIT);
    }
}

export default withContext(Intro);