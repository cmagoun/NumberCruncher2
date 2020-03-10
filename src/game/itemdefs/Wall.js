import * as Components from './Components';

export const createBoundary = (x, y, gm) => {
    return gm.createEntity(`wall/${x}/${y}`)
    .add(Components.sprite("", x, y, "darkgray", "white", "black", 50))
    .add(Components.pos(x, y, gm))
    .add(Components.tag("wall"))
    .add(Components.blockslos(gm))
    .add(Components.persistvision(false))
    .add(Components.blocksmove("boundary"));
}

export const create = (x, y, gm) => {
    return gm.createEntity(`wall/${x}/${y}`)
        .add(Components.sprite("", x, y, "darkgray", "white", "black", 50))
        .add(Components.pos(x, y, gm))
        .add(Components.tag("wall"))
        .add(Components.blockslos(gm))
        .add(Components.persistvision(false))
        .add(Components.blocksmove());
}
