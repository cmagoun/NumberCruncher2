import {states} from '../NumberCruncher';

export const blocksmove = (blockReason) => (e, req, answer) => {
    return {result:blockReason, destination: req.to, entity:e}
};

export const interacts = (e, req, answer) => {
    return {result:"interact", destination: req.to, entity:e}
};

export const start = (interaction, props, gm) => {
    if(interaction.ui !== undefined) {
        gm.setReadyInteraction(interaction);
        gm.updateGameState(states.INTERACTION_UI, interaction.ui(props, gm));
    } else {
        //fire the interaction without any UI
        interaction.fire({...props}, gm);
        if(interaction.endsTurn) {
            gm.turnDone();
        } else {
            gm.continueTurn();
        }
    }
}