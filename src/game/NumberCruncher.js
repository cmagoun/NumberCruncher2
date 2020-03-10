import {BaseGameManager} from "../ecs/GameManager";
import * as Keyboard from '../utilities/keyboard';
import * as Vector from '../utilities/vector';
import * as Move from './systems/Move';
import * as LevelCreator from './mapgen/LevelCreator';
import { mapIndexKey, arenaWidth, arenaHeight } from "./Constants";

export const states = {
    INTRO: 0,
    INIT: 1,
    NEW_LEVEL: 2,
    TURN_START:3,
    TURN_OVER:4,
    INTERACTION_UI: 98,
    WAITING_FOR_INPUT: 99,
};

class NumberCruncher extends BaseGameManager {
    constructor() {
        super();
        this.needLOSUpdate = true;
        this.needUpdate = false;
        this.drawList = [];
        this.turn = 0;
        this.level = 1;
        this.readyInteraction = {};
        this.cm.createIndex("ix_pos", "pos", pos => mapIndexKey(pos.vec));
        this.loop = this.turnLoop.bind(this);

        this.cameraOrigin = {x:0, y:0};

        this.config = {
            drawWidth: arenaWidth,
            drawHeight: arenaHeight
        }
    }

    // centerOnPoint(x, y) {
    //     this.cameraOrigin = {
    //         x: x - this.config.drawWidth/2,
    //         y: y - this.config.drawHeight/2
    //     };
    //     this.needUpdate = true;
    // }

    // centerOnEntity(id) {
    //     const entity = this.entity(id);
    //     this.centerOnPoint(
    //         entity.pos.vec.x,
    //         entity.pos.vec.y
    //     );
    // }

    continueTurn() {
        this.updateGameState(states.WAITING_FOR_INPUT);
    }
    
    // lineOfSight() {
    //     if(this.needLOSUpdate || this.drawList.length === 0) this.drawList = doLos(this);
    //     this.needLOSUpdate = false;
    //     return this.drawList;
    // }

    // requestFullLOSUpdate() {
    //     this.needLOSUpdate = true; 
    // }


    cancelInteraction() {
        this.readyInteraction = {};
        this.updateGameState(states.WAITING_FOR_INPUT);
    }

    fireReadyInteraction(props) {
        const end = this.readyInteraction.endsTurn;

        this.readyInteraction.fire(props, this);
        this.readyInteraction = {};
        if(end) {
            this.turnDone();
        } else {
            this.continueTurn();
        }
    }

    player() {
        return this.cm.entity("player");
    }

    playerInput(key) {
        const player = this.player();


        if(Keyboard.isMovementKey(key) && this.gameState === states.WAITING_FOR_INPUT) {
            const dir = Keyboard.directionKey(key);
            const moveTo = Vector.add(dir)(player.pos.vec);
            Move.request(player.id, moveTo, this);
        }
    }


    setReadyInteraction(interaction) {
        this.readyInteraction = interaction;
    }

    start() {
        this.gameState = states.INTRO;
        requestAnimationFrame(this.loop);
    }

    taggedAs(tag) {
        return this.cm
            .entitiesWith("tag")
            .filter(e => e.tag.value === tag);
    }

    turnDone() {
        //player moves over and over
        this.updateGameState(states.TURN_OVER);
    }

    turnLoop() {
        switch(this.gameState) {
            case states.INTRO:
            case states.INTERACTION_UI:
            case states.WAITING_FOR_INPUT:
                break;

            case states.INIT:
                this.turn = 0;
                this.updateGameState(states.NEW_LEVEL);
                break;

            case states.NEW_LEVEL:
                this.level++;
                LevelCreator.createLevel(arenaWidth, arenaHeight, this.level, this);
                this.updateGameState(states.TURN_START);
                break;

            case states.TURN_START:
                this.updateGameState(states.WAITING_FOR_INPUT)
                break;

            case states.TURN_OVER:
                this.turn++;
                this.updateGameState(states.TURN_START);
                break;


        }

        if(this.cm.performQueuedChanges() || this.needUpdate) {
            this.update();
        }

        this.needUpdate = false;

        requestAnimationFrame(this.loop);
    }


    toBlockLos() {
        return this.cm.entitiesWith(["blockslos", "pos"]);
    }

    toDraw() {
        return this.cm.entitiesWith(["sprite", "pos"]);
    }

}

export default NumberCruncher;