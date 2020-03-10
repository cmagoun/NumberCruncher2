
import { mapIndexKey, maxLos } from '../Constants';

export const doLos = (gm) => {
    const player = gm.player();
    if(!player) return new Map();

    const entities = gm.cm
        .entitiesWith(["persistvision", "sprite"]);

    const persisted = entities.filter(x => x.persistvision.seen === true);

    const drawList = new Map();
    persisted.forEach(p => drawList.set(p.id, p));

    const transparent = (x,y) => {
        const onSpace = gm.cm.entitiesIn("ix_pos", mapIndexKey({x,y}));
        if(onSpace.length === 0) return true;
        if(onSpace.some(os => os.blockslos)) return false;
        return true;
    }

    const reveal = (x,y) => {
        const onSpace = gm.cm.entitiesIn("ix_pos", mapIndexKey({x,y}));
        onSpace.forEach(os => {
            if(os.sprite) {
                drawList.set(os.id, os);
                if(os.persistvision && !os.persistvision.seen) os.edit("persistvision", {seen:true});
            }
        });
    }

    shadowcast(player.pos.vec.x, player.pos.vec.y, transparent, reveal);
    const result =  Array.from(drawList.values());
    //console.log("LOS calculated: " + persisted.length + "/" + result.length);
    return result;
}

/**
 * Taken from: https://gist.github.com/as-f/59bb06ced7e740e11ec7dda9d82717f6
 * Recursive shadowcasting algorithm.
 * This algorithm creates a field of view centered around (x, y).
 * Opaque tiles are treated as if they have beveled edges.
 * Transparent tiles are visible only if their center is visible, so the
 * algorithm is symmetric.
 * @param cx - x coordinate of center
 * @param cy - y coordinate of center
 * @param transparent - function that takes (x, y) as arguments and returns the transparency of that tile
 * @param reveal - callback function that reveals the tile at (x, y)
 */
const shadowcast = function(cx, cy, transparent, reveal) {
    'use strict';
    /**
     * Scan one row of one octant.
     * @param y - distance from the row scanned to the center
     * @param start - starting slope
     * @param end - ending slope
     * @param transform - describes the transfrom to apply on x and y; determines the octant
     */
    var scan = function(y, start, end, transform) {
        if (start >= end || y > maxLos) {    
            return;
        }
        var xmin = Math.round((y - 0.5) * start);
        var xmax = Math.ceil((y + 0.5) * end - 0.5);
        for (var x = xmin; x <= xmax; x++) {
            var realx = cx + transform.xx * x + transform.xy * y;
            var realy = cy + transform.yx * x + transform.yy * y;
            if (transparent(realx, realy)) {
                if (x >= y * start && x <= y * end) {
                    reveal(realx, realy);
                }
            } else {
                if (x >= (y - 0.5) * start && x - 0.5 <= y * end) {
                    reveal(realx, realy);
                }
                scan(y + 1, start, (x - 0.5) / y, transform);
                start = (x + 0.5) / y;
                if (start >= end) {
                    return;
                }
            }
        }
        scan(y + 1, start, end, transform);
    };
    // An array of transforms, each corresponding to one octant.
    var transforms = [
        { xx:  1, xy:  0, yx:  0, yy:  1 },
        { xx:  1, xy:  0, yx:  0, yy: -1 },
        { xx: -1, xy:  0, yx:  0, yy:  1 },
        { xx: -1, xy:  0, yx:  0, yy: -1 },
        { xx:  0, xy:  1, yx:  1, yy:  0 },
        { xx:  0, xy:  1, yx: -1, yy:  0 },
        { xx:  0, xy: -1, yx:  1, yy:  0 },
        { xx:  0, xy: -1, yx: -1, yy:  0 }
    ];
    reveal(cx, cy);
    // Scan each octant
    for (var i = 0; i < 8; i++) {
        scan(1, 0, 1, transforms[i]);
    }
};