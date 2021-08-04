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
function isS([x, y], nonSemi = false, hor = false) { // is solid?
    let outside = false;
    if (x < 0 || x >= width || y < 0 || y >= height) {
        if (hor && (y < 0 || y >= height) && (x < 0 || x >= width)) return true;
        else if (hor && (x < 0 || x >= width)) return true;
        //else if (!hor && (x < 0 || x >= width)) 
        if (x < 0 || x >= width) x = (x < 0) ? 0 : width - 1;
        if (y < 0 || y >= height) y = (y < 0) ? 0 : height - 1;
        outside = true;
    }
    let l = levels.levels[levels.currentLevel];
    if (nonSemi) return (l[y][x] == 1 || (l[y][x] == 1.5 && !outside));
    else return (l[y][x] >= 1 && l[y][x] <= 2 && (l[y][x] != 1.5 || !outside));
}
function XOR(values) { // returns true if exactly one of the values is true
    if (values.reduce((a, x) => x ? a + 1 : a, 0) == 1) {
        for (i = 0; i < values.length; i++) {
            if (values[i]) return i;
        }
    } else return -1; // not exactly 1 of them is true
}

// LEVELS

// Levels Object
let levels = {
    levels: [],
    ghosts: [],
    scores: [[0, 0], 0, [0, 0]], // [[lowest, highest (time)], swaps, [blocks, alreadyCounted]] - live recording of the current level's score.
    currentLevel: 0,
    addLevel: function (values/*here I'll add parameters as additional objects are created*/) {
        this.levels.push(values);
    },
    drawLevel: function (level, simple = false) { // draw the specified level
        let c = (simple) ? ctx.length - 1 : 1; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier
        clear(c);
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
                            ctx[c].drawImage(img[0], option * 100, 500 + semiShape[0] * 100, 100, 100, x * m, y * m, m, m);
                            semiShape[0] = option % 3; // % 3 turns option {-} into 0 (good!)
                            if (y < height - 1) if (l[y + 1][x] % 3 !== 0) ctx[c].drawImage(img[0], 400, 400, 100, 100, x * m, y * m, m, m); // feet
                        }
                        break;
                    case 1: // normal block
                        let blocks = [0, 0, 0, 0]; // [right, left, up, down]; 1 means not there.
                        if (x < width - 1) if (l[y][x + 1] !== 1) blocks[0] = 1;
                        if (x > 0) if (l[y][x - 1] !== 1) blocks[1] = 1;
                        if (y > 0) if (l[y - 1][x] !== 1) blocks[2] = 1;
                        if (y < height - 1) if (l[y + 1][x] !== 1) blocks[3] = 1;
                        ctx[c].drawImage(img[0], (blocks[1] + 2 * blocks[0]) * 100, (blocks[2] + 2 * blocks[3]) * 100, 100, 100, x * m, y * m, m, m);
                        if (x > 0 && y > 0) if (!blocks[1] && !blocks[2] && l[y - 1][x - 1] !== 1) ctx[c].drawImage(img[0], 400, 0, 100, 100, x * m, y * m, m, m);
                        if (x < width - 1 && y > 0) if (!blocks[0] && !blocks[2] && l[y - 1][x + 1] !== 1) ctx[c].drawImage(img[0], 400, 100, 100, 100, x * m, y * m, m, m);
                        if (x < width - 1 && y < height - 1) if (!blocks[0] && !blocks[3] && l[y + 1][x + 1] !== 1) ctx[c].drawImage(img[0], 400, 200, 100, 100, x * m, y * m, m, m);
                        if (x > 0 && y < height - 1) if (!blocks[1] && !blocks[3] && l[y + 1][x - 1] !== 1) ctx[c].drawImage(img[0], 400, 300, 100, 100, x * m, y * m, m, m);
                        break;
                    case 2: // semisolid block
                        let blocks2 = [0, 0]; // [right, left]; 1 means not there.
                        if (x < width - 1) if (l[y][x + 1] !== 2) blocks2[0] = 1;
                        if (x > 0) if (l[y][x - 1] !== 2) blocks2[1] = 1;
                        ctx[c].drawImage(img[0], (blocks2[1] + 2 * blocks2[0]) * 100, 400, 100, 100, x * m, y * m, m, m);
                        if (y < height - 1) if (l[y + 1][x] % 3 !== 0) ctx[c].drawImage(img[0], 400, 400, 100, 100, x * m, y * m, m, m); // feet
                        break;
                    case 3: // avatar location
                        if (!simple) avatar.init([x * unit, y * unit]);
                        else ctx[c].drawImage(img[2], 1 * 100, 1 * 100, 100, 100, Math.round(x * m), Math.round(y * m), m, m);
                        break;
                }
            }
            semiShape = semiNext;
        }
        // draw the buttons and spikes and walls and doors and stuff
    },
    startLevel: function (level) {
        if (level >= this.levels.length) level = this.levels.length - 1;
        time = 1;
        frame = 0;
        stepcounter = 0;
        step = 0;
        clear(5);
        this.currentLevel = level;
        this.scores = [[0, 0], 0, [0, 0]];
        this.drawLevel(level);
        this.ghosts = [];
        nextGhost = new Ghost();
    },
    endLevel: function () {
        // run the closing animation
        let info = score.calculate(this.currentLevel, [Math.floor(Math.abs(this.scores[0][1] - this.scores[0][0]) / 60), this.scores[1], this.scores[2][0]]);
        
        //console.log("Total Time: " + Math.abs(this.scores[0][1] - this.scores[0][0]) + ", Time-Swaps: " + this.scores[1] + ", Dino-Blocks: " + this.scores[2][0] + ", Rank: " + info[0] + ".");
        //console.log(info);
        /*
        console.log("Ty " + info[2][0] + ", Sy " + info[2][1] + ", By " + info[2][2]);
        console.log("Tg " + score.goals[this.currentLevel][0][0] + ", Sg " + score.goals[this.currentLevel][0][1] + ", Bg " + score.goals[this.currentLevel][0][2]);
        */
        //console.log("Score: [" + info[2][0] + ", " + info[2][1] + ", " + info[2][2] + "]");
        //console.log("Gold: [" + score.goals[this.currentLevel][0][0] + ", " + score.goals[this.currentLevel][0][1] + ", " + score.goals[this.currentLevel][0][2] + "]");
        //console.log("RANK: " + info[0]);
        dom.newLevel(true);
        // setTimeout for when to start the next level
        setTimeout(function () {levels.startLevel(levels.currentLevel + 1);}, 1000);
        setTimeout(dom.newLevel, 1700);
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
    },
    updateTime: function () { // updates the score based on the total time
        this.scores[0][0] = (frame < this.scores[0][0]) ? frame : this.scores[0][0];
        this.scores[0][1] = (frame > this.scores[0][1]) ? frame : this.scores[0][1];
    }
}

// Score object
let score = {
    goals: [
        [[1, 0, 0], [3, 0, 0]],
        [[4, 0, 0], [9, 0, 0]],
        [[2, 0, 0], [8, 0, 0]],
        [[2, 1, 1], [13, 1, 1]],
        [[4, 0, 0], [15, 1, 1]],
        [[3, 1, 1], [16, 2, 2]],
        [[7, 1, 1], [20, 1, 1]],
        [[15, 4, 4], [30, 7, 5]],
        [[4, 4, 4], [20, 7, 7]],
        [[26, 6, 9], [50, 12, 11]],
        [[40, 12, 13], [100, 20, 18]],
        [[30, 0, 0], [60, 2, 2]],
        [[400, 70, 55], [1000, 130, 85]]
    ],
    ranks: [], // array of the addition of 'goals'
    scores: [], // same format as 'goals', but it's this player's information.
    messages: [ // 0-Gold 1-Silver 2-Bronze
        [
            "If you hope to improve your score, focussing on taking <strong>less in-game time</strong> may be the best choice.",
            "To improve your score any further, it might be best to focus on doing <strong>less time-swaps</strong>.",
            "You've achieved <span class='gold'>Gold</span>, but if you hope to improve this score further, you may want to use <strong>less dino-blocks</strong>."
        ],
        [
            "To reach <span class='gold'>Gold</span>, focussing on taking <strong>less in-game time</strong> to solve this level might be best.",
            "If <span class='silver'>Silver</span> isn't enough for you, you may want to try doing <strong>less time-swaps</strong> to improve your rank.",
            "If you're wondering how to achieve the <span class='gold'>Gold</span> rank, using <strong>less dino-blocks</strong> might help you the most."
        ],
        [
            "You're at <span class='bronze'>Bronze</span>, but to get to <span class='silver'>Silver</span>, you should try to complete this level in <strong>less in-game time</strong>.",
            "The best way to improve your rank to <span class='silver'>Silver</span> will be to try doing <strong>less time-swaps</strong>.",
            "To reach <span class='silver'>Silver</span>, your best bet will be to try to use <strong>less dino-blocks</strong>."
        ]
    ],
    init: function () {
        for (let i = 0; i < score.goals.length; i++) { // calibrate the 'goals'
            score.goals[i][0] = this.calibrate(score.goals[i][0]);
            score.goals[i][1] = this.calibrate(score.goals[i][1]);
        }
        levels.levels.forEach((l) => {
            score.scores.push([2, [0, 0, 0]]);
        });
        let t = this;
        t.goals.forEach((nums) => {
            t.ranks.push([nums[0].reduce((a, b) => a + b, 0), nums[1].reduce((a, b) => a + b, 0)]);
        });
        console.log(t.goals);
    },
    calculate: function (level, [seconds, swaps, blocks]) {
        // The below code needs to be super calibrated!
        let s = this.calibrate([seconds, swaps, blocks]);
        let total = s.reduce((a, b) => a + b, 0);
        // The below code can be adjusted if the ranks feel improperly assigned
        let rank = (total <= this.ranks[level][0]) ? 0 : ((total <= this.ranks[level][1]) ? 1 : 2);
        // The below code can be adjusted if certain things become more important
        let diff = [
            s[0] / this.goals[level][(rank > 0) ? rank - 1 : 0][0],
            s[1] / this.goals[level][(rank > 0) ? rank - 1 : 0][1],
            s[2] / this.goals[level][(rank > 0) ? rank - 1 : 0][2]
        ];
        let biggest = diff.indexOf(Math.max(...diff));
        this.scores[level] = [rank, s];
        console.log("(" + (levels.currentLevel + 1) + ") Score: [" + seconds + ", " + swaps + ", " + blocks + "] -- Rank: " + rank);
        return [rank, this.messages[rank][biggest], s];
    },
    calibrate: function ([seconds, swaps, blocks]) {
        return [seconds * 25, swaps * 160, blocks * 80];
    }
}

// LEVELS

// Level creation!
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 1, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 2, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [0, 1, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
    [3, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 1, 1, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [3, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 1, 2, 2, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1, 1],
    [0, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2, 1],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [0, 1, 0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1, 1],
    [0, 1, 0, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 1],
    [0, 1, 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 1],
    [3, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
levels.addLevel([
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [3, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
