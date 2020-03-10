import * as Components from './Components';

export const create = (x, y, gm) => {
    return gm.createEntity("player")
        .add(Components.sprite("@", x, y, "transparent", "white", 100))
        .add(Components.pos(x, y, gm));
} 

export const placeAt = (x, y, gm) => {
    const player = gm.entity("player");

    if(player.pos) {
        player.edit("pos", {vec:{x,y}});
        player.edit("sprite", {draw:{x,y}});    
    } else {
        create(x, y, gm);
    }

    gm.centerOnPoint(x, y);
}