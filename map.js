// FUNCTIONS, LEVELS, & GRAPHIC HANDLING

// FUNCTIONS

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
function isS([x, y], nonSemi = false) { // is solid?
    if (x < 0 || x >= width || y < 0 || y >= height) return (nonSemi && !(y < 0 || y >= height));
    else {
        let l = levels.levels[levels.currentLevel];
        if (nonSemi) return (l[y][x] == 1 || l[y][x] == 1.5);
        else return (l[y][x] >= 1 && l[y][x] <= 2);
    }
}

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
        clear(1);
        let l = this.levels[level];
        let semiShape = [0, []]; // [(1-open {=} 2-line {+}), [x's of no {=}]];
        for (let y = 0; y < height; y++) {
            let semiNext = [0, []]; // the going "semiShape" for the next row
            for (let x = 0; x < width; x++) {
                switch (l[y][x]) {
                    case 0:
                    case 1.5:
                        if (l[y][x] == 1.5) l[y][x] = 0; // mistakenly kept as 1.5
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
    },
    endLevel: function ([x, y]) {
        // run the closing animation
        fade("in");
        // setTimeout for when to start the next level
        setTimeout(function () {levels.startLevel(levels.currentLevel + 1);}, 2100);
        setTimeout(fade, 2200);
    },
    update: function () {
        // Check if anything should go from 1.5 to 0:
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                switch(this.levels[this.currentLevel][y][x]) {
                    case 1.5:
                        // run through the ghosts; is there anyone standing here now?
                        let there = false;
                        for (let i in this.ghosts) {
                            let g = this.ghosts[i];
                            if (!g.waiting) {
                                if (Math.floor(g.instructions[g.frame][0] / unit) == x && Math.floor(g.instructions[g.frame][1] / unit) == y && g.instructions[g.frame][6][0] == 2) {
                                    there = true;
                                }
                            }
                        }
                        if (!there) this.levels[this.currentLevel][y][x] = 0;
                        break;
                }
            }
        }
    }
}

// Level creation!
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [3, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [3, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 2, 2, 2, 2, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [0, 0, 2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [0, 0, 2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
    [3, 0, 2, 2, 2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
