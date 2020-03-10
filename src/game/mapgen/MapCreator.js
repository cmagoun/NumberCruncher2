import * as Components from '../itemdefs/Components';
import * as Vector from '../../utilities/vector';

const spaceKey = (x, y) => `${x},${y}`;
const spaceVec = (vec) => `${vec.x},${vec.y}`;

export const initMap = (width, height, initfn, gm) => {
    for(let x = 0; x < width; x++) {
        for(let y = 0; y < height; y++) {
            initfn(x, y, gm);
        }
    }
}

//this allows us to do set pieces
//spaces is Map() that shows if this space is walkable
export const readMap = (map, spaces, gm) => {
    const creator = new Map();
    map.legend.forEach(item => creator.set(item.key, item));

    map.map.forEach((srow, y) => {
        for(let x = 0; x < srow.length; x++) {
            const key = srow.charAt(x);
            if(key !== "" && key !== " " && creator.has(key)) {
                emptySpace(x, y, gm);

                const cell = creator.get(key);                
                if(cell.create) cell.create(x, y, gm);

                spaces.set(spaceKey(x,y), 1);     
            }
        }
    });
}

//components
export const facing = (value) => {
    return {
        cname: "facing",
        value
    };
}

export const nokill = () => {
    return {cname:"nokill"};
}

const done = () => {
    return {
        cname: "done",
    };
}

//entities
export const makeDigger = (x, y, fac, index, gm) => {
    const glyph = (index, gm) => () => {
        const e = gm.entity(`digger_${index}`);
        if(e.facing.value === "n") return "^";
        if(e.facing.value === "s") return "V";
        if(e.facing.value === "e") return ">";
        return "<";
    }

    return gm.createEntity(`digger_${index}`)
        .add(Components.sprite(glyph(index,gm), x, y, "green", "white"))
        .add(Components.pos(x, y, gm))
        .add(facing(fac))
        .add(Components.tag("digger"));
}

//dig commands
const dig = (digger, spaces, gm) => {
    //generally, we are going to follow this procedure each iteration:
    //1. digger extends the hallway some distance straight ahead
    //2. digger chooses a random feature to place at the end of his dig
    //   for instance, he could "turn right", or "place room", or "intersection"
    //   at the end of his dig
    const distance = Vector.getRandomInt(3, 10);

    for(let i = 0; i < distance - 1; i++) {
        if(!digger.done) goStraight(digger, spaces, gm);
    }

    const dieRoll = Vector.getRandomInt(1,2);

    switch(dieRoll) {
        case 1:
            turn("r", digger, spaces, gm);
            return;
        case 2:
            turn("l", digger, spaces, gm);
            return;
        case 3:
            digRoom(digger, spaces, gm);
            return;
    }
}

export const digMap = (iterations, spaces, gm) => {
    while(iterations > 0) {
        const diggers = gm.taggedAs("digger");

        diggers.forEach(digger => dig(digger, spaces, gm));
        diggers.forEach(d => {
            if(d.done) d.destroy();
        });
        
        iterations--;
    }
}

export const digRoom = (digger, spaces, gm) => {
    let dimx = Vector.getRandomInt(4, 10);
    let dimy = Vector.getRandomInt(4, 10);
    let rec = null;
    let isOverlapping = false;
    let result = false;

    const pos = digger.pos.vec;

    while(dimx > 4 && dimy > 4 && (!rec || !result)) {
        let offsetx = Vector.getRandomInt(0, dimx-1);
        let offsety = Vector.getRandomInt(0, dimy-1);
    
        let rec = digger.facing.value === "n" || digger.facing.value === "s"
            ? roomRectangle(digger.pos.vec, digger.facing.value, dimx, dimy, offsetx)
            : roomRectangle(digger.pos.vec, digger.facing.value, dimx, dimy, offsety);
    
        isOverlapping = false;
        rec.forEach(r => {
             if(spaces.has(spaceVec(r)) && 
                (r.x !== pos.x || r.y !== pos.y)) isOverlapping = true;
        });

        if(isOverlapping) {
            //make the room smaller and try again
            dimx--;
            dimy--;
        } else {
            //create the room
            rec.forEach(r => {
                emptySpace(r.x, r.y, gm);
                spaces.set(spaceVec(r), 1);
            });

            result = true;
        }
    }

    return result;
}

export const goStraight = (digger, spaces, gm) => {
    const facing = digger.facing.value;
    const moveTo = Vector.add(digger.pos.vec)(Vector.direction(facing));
    const key = spaceVec(moveTo);

    //we have tunneled into an existing tunnel, and we are done
    if(spaces.has(key) && !digger.nokill) {
        digger.add(done());
        return;
    }

    emptySpace(moveTo.x, moveTo.y, gm);
         
    spaces.set(key, 1); 

    digger.edit("pos", {vec:moveTo});
    digger.edit("sprite", {draw:moveTo});
    
}

export const turn = (rl, digger, spaces, gm) => {
    const facing = newFacing(digger.facing.value, rl);
    digger.edit("facing", {value:facing});
}

//helpers for dig commands
const emptySpace = (x, y, gm) => {
    //empty the space
    const onSpace = gm.entitiesIn("ix_pos", spaceKey(x, y));
    onSpace.forEach(os => {
        if(os.destroy) os.destroy();
    });
}

const newFacing = (oldFacing, rl) => {
    switch(oldFacing) {
        case "n":
        case "north":
            return rl === "r" ? "e" : "w";

        case "s":
        case "south":
            return rl === "r" ? "w" : "e";

        case "e":
        case "east":
            return rl === "r" ? "s" : "n";

        case "w":
        case "west":
            return rl === "r" ? "n" : "s";
    }
}

const roomRectangle = (vec, facing, width, height, offset) => {
    let rec = [];
    let startx;
    let starty;
    let endx;
    let endy;

    switch(facing) {
        case "n":
            startx = vec.x - offset;
            endx = startx + width;
            starty = vec.y - height;
            endy = vec.y - 1;
            break;
        case "s":
            startx = vec.x - offset;
            endx = startx + width;
            starty = vec.y + 1;
            endy = vec.y + height;
            break;
        case "e":
            startx = vec.x + 1;
            endx = vec.x + width;
            starty = vec.y - offset;
            endy = starty + height;
            break;
        case "w":
            startx = vec.x - width;
            endx = vec.x - 1;
            starty = vec.y - offset;
            endy = starty + height;
            break;
    }

    for(let x = startx; x <= endx; x++) {
        for(let y = starty; y <= endy; y++) {
            rec.push({x,y});
        }
    }

    return rec;
}


