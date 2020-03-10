import { ComponentManager } from './ecs';

class BaseGameManager {
    constructor() {
        this.cm = new ComponentManager();
        this.subscribers = new Map();
        this.screens = new Map();
        this.gameState = 0; //bogus value
        this.animationCallbacks = new Map();
        this.logLength = 10;
        this.logNonce = 0;
        this.log = []; //array of id:strings that goes into the log;

        this.stateCallbacks = new Map();
        this.updateCallbacks = new Map();
    }

    addLogMessage(message) {
        const newLength = this.log.unshift({id:this.logNonce, msg:message});
        if(newLength > this.logLength) this.log.pop();
        this.logNonce++;
        this.update();
    }

    readLog() {
        return this.log;
    }

    registerForStateChanges(id, callback) {
        this.stateCallbacks.set(id, callback);
    }

    registerForUpdates(id, callback) {
        this.updateCallbacks.set(id, callback);
    }

    unregisterForStateChanges(id) {
        this.stateCallbacks.delete(id);
    }

    unregisterForUpdates(id) {
        this.updateCallbacks.delete(id);
    }

    //Shortcuts so that app components do not need to
    //touch the component manager
    entity(id) {
        //return new Entity(id, this.cm);
        return this.cm.entity(id);
    }

    entities() {
        return this.cm.allEntities();
    }

    entitiesIn(index, key, cnames) {
        return this.cm.entitiesIn(index, key, cnames);
    }

    entitiesWith(cnames) {
        return this.cm.entitiesWith(cnames);
    }

    createEntity(id) {
        return this.cm.createEntity(id);
    }

    // isDirty() {
    //     return this.cm.isDirty();
    // }

    updateGameState(newState, payload) {
        this.gameState = newState;
        this.stateCallbacks.forEach(callback => {
            if(callback) callback(newState, payload);
        });
    }

    update() {
        this.updateCallbacks.forEach(callback => {
            if(callback) callback();
        });
    }
}

export {BaseGameManager};