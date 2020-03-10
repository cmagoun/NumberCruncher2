import includes from 'lodash/fp/includes';

const movementKeys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'PageUp', 'PageDown', 'Home', 'End'];
const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const letterKeys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

export const directionKey = (key) => {
    switch(key) {
        case '8':
        case 'ArrowUp':
            return {x:0, y:-1};
        case '6':
        case 'ArrowRight':
           return {x:1, y:0};
        case '2':
        case 'ArrowDown':
            return {x:0, y:1};
        case '4':
        case 'ArrowLeft':
            return {x:-1, y:0};
        case '7':
        case 'Home':
            return {x:-1, y:-1};
        case '9':
        case 'PageUp':
            return {x:1, y:-1};
        case '3':
        case 'PageDown':
            return {x:1, y:1};
        case '1':
        case 'End':
            return {x:-1, y:1};
        default:
            return {x:0, y:0};
    }
}

export const isMovementKey = (key) => {
    return includes(key)(movementKeys);
}

export const isNumberKey = (key) => {
    return includes(key)(numberKeys);
}

export const isLetterKey = (key) => {
    return includes(key)(letterKeys);
}