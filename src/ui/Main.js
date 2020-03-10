import React, { Component } from 'react';
import withContext from '../ecs/withContext';
import Intro from './Intro';
import { states } from '../game/NumberCruncher';
import Playfield from './Playfield';


class Main extends Component {
    constructor(props) {
        super(props);
        
        this.state = {components:[<Intro/>]}
        this.updateScreen = this.handleUpdateScreen.bind(this);
    }

    render() {
        const length = this.state.components.length;
        return <div>
            {this.state.components
                .map((c,i) => React.cloneElement(c, {key:i, events:i===length-1}))}
        </div>
    }

    componentDidMount() {
        this.props.gm.registerForStateChanges("main", this.updateScreen);
    }

    componentWillUnmount() {
        this.props.gm.unregisterForStateChanges("main");
    }

    handleUpdateScreen(state, payload) {
        const gameState = state;

        switch(gameState) {
            case states.INTRO:
                this.setState({components:[<Intro/>]});
                break;

            case states.NEW_LEVEL:
                this.setState({components:[<Playfield/>]});
                break;

            // case states.INTERACTION_UI:
            //     this.setState({components:[<Playfield/>, payload]});
            //     break;

            default:
                if(this.state.components.length > 1) {
                    this.setState({components:[<Playfield/>]});
                }
                break;
        }
    
        //     case states.LOSTEST:
        //         this.setState({components: [<TestArena/>, <LosTest/>]});
        //         break;

        //     case states.PATHTEST:
        //         this.setState({components: [<TestArena/>, <PathTest/>]});
        //         break;

                
        //     case states.NEWGAME:
        //         this.setState({components:[<Playfield/>]});
        //         break;
            
        //     case states.GAME_OVER:
        //         this.setState({components:[<GameOver/>]});
        //         break;

        //     case states.TARGETING:
        //         const components = [<Playfield/>, evt.detail.payload]
        //         this.setState({components});
        //         break;

        //     default:
        //         if(this.state.components.length > 1) {
        //             this.setState({components:[<Playfield/>]});
        //         }
        //         break;
        }
    }


export default withContext(Main);