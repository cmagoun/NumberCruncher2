import anime from 'animejs';
import {colorToRGBString} from '../../utilities/color';

export const flash = (entity, foreground, background, duration) => {
    const orig = {foreground: entity.sprite.fcolor, background: entity.sprite.bcolor};
    let flash = {};
    if(foreground) flash.foreground = colorToRGBString(entity.sprite.fcolor);
    if(background) flash.background = colorToRGBString(entity.sprite.bcolor);

    return anime({
        targets:flash,
        foreground: colorToRGBString(foreground || "black"),
        background: colorToRGBString(background || "black"),
        easing: 'linear',
        duration: duration || 250,
        update: () => entity.edit("sprite", {fcolor: flash.foreground, bcolor: flash.background}),
        complete: () => entity.edit("sprite", {fcolor:orig.foreground, bcolor: orig.background}),
        loop: true
    });
}

export const slide = (mover, from, to, duration) => {
    const draw = {...from};
    
    return anime({
        targets: draw,
        x: to.x,
        y: to.y,
        easing: 'easeInOutQuad',
        duration: duration || 250,
        update: () => mover.edit("sprite", {draw}),
        complete: () => mover.edit("sprite", {draw:{...to}})
    });
}

export const stop = (animation) => {
    animation.pause();
    if(animation.complete) animation.complete();
    animation.animations = [];
}