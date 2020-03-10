export const blockslos = (gm) => {
    return {
        cname:"blockslos",
        onRemove: () => gm.requestFullLOSUpdate()
    }
}

//technically this is just interacts(Interaction.blocksmove, null)
//should we consolidate this?
export const blocksmove = (reason) => {
    return {
        cname: "blocksmove",
        onMoveSpace: (e, req, ans) => {
                return {result: reason || "wall", destination:undefined, entity:e}
            }
    };
}

export const canopen = (open) => {
    return {
        cname:"canopen",
        open
    };
}

export const interacts = (onMoveSpace, interaction) => {
    return {
        cname: "interacts",
        onMoveSpace,
        interaction
    }
}

export const orientation = (value) => {
    return {
        cname:"orientation",
        value
    }
}

export const persistvision = (seen) => {
    return {
        cname:"persistvision",
        seen
    }
}

export const pos = (x, y, gm) => {
    return {
        cname:"pos",
        vec: {x,y},
        onEdit: (eid) => {if(eid === "player") gm.requestFullLOSUpdate();},
        onRemove: () => gm.requestFullLOSUpdate()
    };
}

export const sprite = (glyph, x, y, bcolor, fcolor, z, border) => {
    return {
        cname: "sprite",
        glyph,
        draw: {x,y},
        bcolor: bcolor || "transparent",
        fcolor: fcolor || "white", 
        border: border || "",
        z: z || 0,
    };
}

export const tag = (tag) => {
    return {
        cname: "tag",
        value: tag
    }
}
