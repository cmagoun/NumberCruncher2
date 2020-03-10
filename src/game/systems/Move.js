import {ask} from './Ask';
import * as Animate from './Animate';
import { mapIndexKey, defaultSlideTime } from '../Constants';
import * as Interaction from './Interaction';

const checkMoveSpace = ["blocksmove", "interacts"];
const checkMover = [];
const askMoveSpace = ask(checkMoveSpace, comp => comp.onMoveSpace);
const askMover = ask(checkMover, comp => comp.onMover);

export const request = (id, moveTo, gm) => {
    const mover = gm.entity(id);

    const onSpace = gm.entitiesIn("ix_pos", mapIndexKey(moveTo));
    if(onSpace.length === 0) doMove(mover, moveTo, gm);

    const request = {onSpace, mover, moveTo};
    //do we need to break out result and reason into separate fields?
    let answer = {result:"move", destination:moveTo, entity:undefined};
    answer = askMoveSpace(onSpace, request, answer, gm);
    answer = askMover(mover, request, answer, gm);

    switch(answer.result) {
        case "move":
            doMove(mover, answer.destination, gm);
            break;

        // case "interact":   
        //     const props = {
        //         pos: moveTo,
        //         actor: mover,
        //         entity: answer.entity
        //     };

        //     Interaction.start(answer.entity.interacts.interaction, props, gm);
        //     //answer.entity.interacts.onInteract(mover, moveTo, answer.entity, gm);
        //     break;

        default:
            break; 
    }
}

export const doMove = (mover, to, gm) => {
    Animate.slide(mover, mover.sprite.draw, to, defaultSlideTime);
    mover.edit("pos", {vec: {x:to.x, y:to.y}});
    gm.turnDone(); 
}