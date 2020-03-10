import * as Vector from '../utilities/vector';
import _ from 'lodash';

export const tileSize = 20;
export const arenaHeight = 50;
export const arenaWidth = 80;
export const defaultSlideTime = 150;
export const arenaY = 0;
export const maxLos = 20;

export const mapIndexKey = (vec) => `${vec.x},${vec.y}`; 

export const remove = (list, toRemove) => {
    toRemove.forEach(r => {
        const index = list.indexOf(r);
        if(index > -1) list.splice(index, 1);
    });
}

export const onSpace = (entity, vec) => {
    return Vector.equals(entity.pos.vec)(vec);
}

export const randomValue = (list) => {
    const num = Vector.getRandomInt(0, list.length-1);
    return list[num];
}


export const isWithin = (entity, space, distance) => {
    return Math.abs(entity.pos.vec.x - space.x) <= distance && 
            Math.abs(entity.pos.vec.y - space.y) <= distance;
}

export const calculateBeam = (start, dir, gm) => { 
    let current = start;
    let wallFound = false;
    const result = [];

    //to avoid the small gaps between diagonal beam tiles
    const dirVector = Vector.isDiagonal(dir) 
        ? Vector.multiply(dir, .5)
        : dir;

    while(!wallFound) {
        current = Vector.add(current)(dirVector);

        const wall = gm
            .entitiesWith(["tag", "pos"])
            .filter(e =>
                onSpace(e, current) &&
                (e.tag.value === "wall" || e.tag.value === "boundary"))[0];
        
        if(wall) {wallFound = true;} else {result.push(current);}
    }

    return result;
}

export const getColor = (entity, colorStrOrFunc) => {
    if(colorStrOrFunc === undefined) return "transparent";

    return _.isFunction(colorStrOrFunc) 
        ? colorStrOrFunc(entity)
        : colorStrOrFunc;
}

export const getGlyph = (glyphStrOrFunc) => {
    return _.isFunction(glyphStrOrFunc)
     ? glyphStrOrFunc()
     : glyphStrOrFunc;
}

export const getSpriteName = (entity, spriteNameOrFunc, showAlt) => {
    if(spriteNameOrFunc === undefined) return "";

    return _.isFunction(spriteNameOrFunc)
        ? spriteNameOrFunc(entity, showAlt)
        : spriteNameOrFunc;
}

export const isInWall = (entity, gm) => {
    const wall = gm
        .entitiesWith(["tag", "pos"])
        .filter(e =>
            onSpace(e, entity.pos.vec) &&
            e.tag.value === "wall")[0];

    return wall;  
}

export const findOppositeBoundary = (boundary, gm) => {
    const space = boundary.pos.vec;
    
    let x = space.x === 0
        ? arenaWidth-1
        : space.x === arenaWidth-1
            ? 0
            : space.x;

    let y = space.y === 0
        ? arenaHeight-1
        : space.y === arenaHeight-1
            ? 0
            : space.y;

    return gm.allBoundaries()
        .filter(b => Vector.equals(b.pos.vec)({x,y}))[0];
}

export const inRectangle = (pos, x, y, w, h) => {
    if(pos === undefined) return false;

    return pos.x >= x && pos.x < x+w &&
        pos.y >= y && pos.y < y+h;
}

export const onBoard = (x, y) => {
    return x >= 0 && x < arenaWidth && y >= 0 && y < arenaHeight;
}

export const afz = (num) => {
    return num > 0
        ? Math.ceil(num)
        : Math.floor(num);
}