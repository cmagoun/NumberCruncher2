export const traceVec = (v0, v1) => {
    return trace(v0.x, v0.y, v1.x, v1.y);
}

export const trace = (x0, y0, x1, y1) => {
    const result = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);

    let x = x0;
    let y = y0;

    let n = 1 + dx + dy;

    const signx = (x1 > x0) ? 1 : -1;
    const signy = (y1 > y0) ? 1 : -1;

    let error = dx - dy;
    
    dx *= 2;
    dy *= 2;

    while(n) {
        result.push({x,y});

        if(error > 0) {
            x += signx;
            error -= dy;
        } else {
            y += signy;
            error += dx;
        }

        n--;
    }

    return result;
}
