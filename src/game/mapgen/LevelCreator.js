import * as Components from '../itemdefs/Components';
import * as Vector from '../../utilities/vector';
import * as Wall from '../itemdefs/Wall';

export const createLevel = (w, h, lvl, gm) => {
    createBoundary(w, h, gm);
}

export const createBoundary = (w, h, gm) => {
    for(let x = 0; x < w; x++) {
        for(let y = 0; y < h; y++) {
            if(x === 0 || y === 0 || x === w-1 || y === h-1) Wall.createBoundary(x, y, gm);
        }
    }
}