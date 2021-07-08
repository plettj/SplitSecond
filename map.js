// OBJECTS, LEVELS, & GRAPHIC HANDLING

// Miscellaneous functions
function clear(index, coor = false) { // clears contexts
    if (!coor) ctx[index].clearRect(0, 0, ctx[index].canvas.width, ctx[index].canvas.height);
    else ctx[index].clearRect(coor[0] - unit / 20, coor[1] - unit / 20, unit * 1.1, unit * 1.1);
}
function semisolid(x, y, l) { // finds whether a 0 is a semisolid support
    if (x >= width) return true;
    else if (l[y][x] !== 0) return false;
    let above = 0;
    for (i = 0; i < y; i++) {
        if (above !== 2) above = l[i][x];
        else if (l[i][x] == 1) above = 1;
    }
    return (above == 2);
}
function between([a, b], num) {
    return num >= Math.min(a, b) && num <= Math.max(a, b);
}

// OBJECTS

// Ghost object constructor
let Ghost = class {
    constructor () {
        this.time = time; // this ghost's native direction
        this.life = [frame, 1800] // lifetime = [startingFrame, endingFrame]
        this.coor1 = [Math.round(avatar.coor[0]), Math.round(avatar.coor[1])]; // life began at these pixels
        this.coor2 = [0, 0]; // life ended at these pixels
        this.instructions = []; // [x, y, blockFrame, dir, inAir, action]
        this.frame = 0; // location in instructions
        this.waiting = false; // whether it doesn't exist
    }
    learn () {
        this.instructions.push([Math.round(avatar.coor[0]), Math.round(avatar.coor[1]), avatar.bFrame, avatar.dir, avatar.inAir, avatar.action]);
    }
    draw () {
        if (this.frame < 0 || this.frame >= this.instructions.length) {
            if (this.frame < 0) this.frame = 0;
            else this.frame = this.instructions.length - 1;
        }
        var a = this.instructions[this.frame];
        ctx[4].drawImage(img[2], ((a[4]) ? 0 : stepCounter % 4) * 100, (a[3] + ((a[4] || a[5] == 1 || a[5] == 2) ? 2 : 0)) * 100, 100, 100, a[0], a[1], unit, unit);
    }
    newFrame () {
        if (!this.waiting) { // ghost is waiting for a call to action.
            if (between(this.life, frame)) { // ghost exists at this time.
                this.frame += time * this.time;
                this.draw();
            } else { // ghost does not exist.
                this.waiting = true;
            }
        } else { // ghost DEFINITELY doesn't exist.
            if (between(this.life, frame)) { // ghost should exist at this time.
                this.waiting = false;
                this.draw();
            }
        }
    }
    finish () {
        this.frame = this.instructions.length - 1;
        this.draw();
        this.life[1] = frame;
        this.coor2 = [avatar.coor[0], avatar.coor[1]];
        this.waiting = false;
    }
}

/*
function Ghost() {
    this.time = time; // this ghost's native direction
    this.life = [0, 1800] // lifetime = [startingFrame, endingFrame]
    this.coor1 = [0, 0]; // life began at these pixels
    this.coor2 = [0, 0]; // life ended at these pixels
    this.instructions = []; // [x, y, dir, blockFrame, inAir]
    this.frame = 0; // location in instructions
    this.waiting = false; // whether it doesn't exist
    this.init = function () {
        this.life[0] = frame;
        this.time = time;
        this.coor1 = [avatar.coor[0], avatar.coor[1]];
    }
    this.learn = function () {
        this.instructions.push([Math.round(avatar.coor[0]), Math.round(avatar.coor[1]), avatar.bFrame, avatar.dir, avatar.inAir]);
    }
    this.draw = function (draw = true) {
        if (this.frame < 0 || this.frame >= this.instructions.length) {
            if (this.frame < 0) this.frame = 0;
            else this.frame = this.instructions.length - 1;
        }
        var a = this.instructions[this.frame];
        if (!draw) clear(canvases.GCctx, [a[0], a[1]]);
        else canvases.GCctx.drawImage(avatar.img, step * 100, (a[2] + a[3] * 2) * 100, 100, 100, a[0], a[1], unit, unit);
    }
    this.newFrame = function () {
        if (!this.waiting) { // ghost is waiting for a call to action.
            if (between(this.life, frame)) { // ghost exists at this time.
                this.draw(false);
                this.frame += time * this.time;
                this.draw();
            } else { // ghost does not exist.
                this.draw(false);
                this.waiting = true;
            }
        } else { // ghost DEFINITELY doesn't exist.
            if (between(this.life, frame)) { // ghost should exist at this time.
                this.waiting = false;
                this.draw();
            }
        }
    }
    this.finish = function () {
        this.frame = this.instructions.length - 1;
        this.draw();
        this.life[1] = frame;
        this.coor2 = [avatar.coor[0], avatar.coor[1]];
        this.waiting = false;
    }
}
*/

// LEVELS

// Levels Object
let levels = {
    levels: [],
    ghosts: [],
    currentLevel: 0,
    addLevel: function (values/*here I'll add parameters as additional objects are created*/) {
        this.levels.push(values);
    },
    drawLevel: function (level) { // draw the specified level
        let l = this.levels[level];
        let semiShape = [0, []]; // [(1-open {=} 2-line {+}), [x's of no {=}]];
        for (let y = 0; y < height; y++) {
            let semiNext = [0, []]; // the going "semiShape" for the next row
            for (let x = 0; x < width; x++) {
                switch (l[y][x]) {
                    case 0:
                        if (semisolid(x, y, l)) { // semisolid above
                            let option = Math.floor(Math.random() * 4); // style option: 1-{=} 2-{+} 3-{-}
                            if (semisolid(x + 1, y, l)) { // RIGHT is available
                                if (semiShape[1].includes(x)) { // CAN'T do {=}
                                    if (option == 1) option = (Math.floor(Math.random() * 2)) * 2;
                                }
                            } else option = (Math.floor(Math.random() * 2)) * 3;
                            if (option == 1) semiNext[1].push(x);
                            if (semiShape[0]) option = option % 3;
                            ctx[1].drawImage(img[0], option * 100, 500 + semiShape[0] * 100, 100, 100, x * unit, y * unit, unit, unit);
                            semiShape[0] = option % 3; // % 3 turns option {-} into 0 (good!)
                            if (y < height - 1) if (l[y + 1][x] % 3 !== 0) ctx[1].drawImage(img[0], 400, 400, 100, 100, x * unit, y * unit, unit, unit);
                        }
                        break;
                    case 1: // normal block
                        let blocks = [0, 0, 0, 0]; // [right, left, up, down]; 1 means not there.
                        if (x < width - 1) if (l[y][x + 1] !== 1) blocks[0] = 1;
                        if (x > 0) if (l[y][x - 1] !== 1) blocks[1] = 1;
                        if (y > 0) if (l[y - 1][x] !== 1) blocks[2] = 1;
                        if (y < height - 1) if (l[y + 1][x] !== 1) blocks[3] = 1;
                        ctx[1].drawImage(img[0], (blocks[1] + 2 * blocks[0]) * 100, (blocks[2] + 2 * blocks[3]) * 100, 100, 100, x * unit, y * unit, unit, unit);
                        if (x > 0 && y > 0) if (!blocks[1] && !blocks[2] && l[y - 1][x - 1] !== 1) ctx[1].drawImage(img[0], 400, 0, 100, 100, x * unit, y * unit, unit, unit);
                        if (x < width - 1 && y > 0) if (!blocks[0] && !blocks[2] && l[y - 1][x + 1] !== 1) ctx[1].drawImage(img[0], 400, 100, 100, 100, x * unit, y * unit, unit, unit);
                        if (x < width - 1 && y < height - 1) if (!blocks[0] && !blocks[3] && l[y + 1][x + 1] !== 1) ctx[1].drawImage(img[0], 400, 200, 100, 100, x * unit, y * unit, unit, unit);
                        if (x > 0 && y < height - 1) if (!blocks[1] && !blocks[3] && l[y + 1][x - 1] !== 1) ctx[1].drawImage(img[0], 400, 300, 100, 100, x * unit, y * unit, unit, unit);
                        break;
                    case 2: // semisolid block
                        let blocks2 = [0, 0]; // [right, left]; 1 means not there.
                        if (x < width - 1) if (l[y][x + 1] !== 2) blocks2[0] = 1;
                        if (x > 0) if (l[y][x - 1] !== 2) blocks2[1] = 1;
                        ctx[1].drawImage(img[0], (blocks2[1] + 2 * blocks2[0]) * 100, 400, 100, 100, x * unit, y * unit, unit, unit);
                        break;
                    case 3: // avatar location
                        avatar.init([x * unit, y * unit]);
                        break;
                }
            }
            semiShape = semiNext;
        }
        // draw the buttons and spikes and walls and doors and stuff
    },
    startLevel: function (level) {
        time = 1;
        frame = 0;
        stepcounter = 0;
        step = 0;
        this.currentLevel = level;
        this.drawLevel(level);
        this.ghosts = [];
        nextGhost = new Ghost();
    }
}

// Level creation!
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
    [0, 2, 2, 0, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 2, 0, 1, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0],
    [3, 0, 0, 0, 0, 1, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
]);
