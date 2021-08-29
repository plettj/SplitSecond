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
function isS([x, y], nonSemi = false, hor = false, l = currentLevel) { // is solid???
    // nonSemi = true --> don't collide with semis.
    // hor = true --> do collide horizontally.
    let outside = false;
    if (x < 0 || x >= width || y < 0 || y >= height) {
        if (hor && (y < 0 || y >= height) && (x < 0 || x >= width)) return true;
        else if (hor && (x < 0 || x >= width)) return true;
        //else if (!hor && (x < 0 || x >= width)) 
        if (x < 0 || x >= width) x = (x < 0) ? 0 : width - 1;
        if (y < 0 || y >= height) y = (y < 0) ? 0 : height - 1;
        outside = true;
    }

    if (nonSemi) return (l[y][x] == 1 || (l[y][x] == 1.5 && !outside));
    else return (l[y][x] >= 1 && l[y][x] <= 2 && (l[y][x] != 1.5 || !outside));
}
function isGoalY([yt, yb]) { // checks if the character is in the goal y-values
    let yg = levels.exits[levels.currentLevel]; // y-goal
    if (yt < yg) return false;
    for (y = yg; y < height; y++) {
        if (currentLevel[y][width - 1] == 1) break;
        if (y == yb) return true;
    }
    return false;
}
function XOR(values) { // returns true if exactly one of the values is true
    if (values.reduce((a, x) => x ? a + 1 : a, 0) == 1) {
        for (i = 0; i < values.length; i++) {
            if (values[i]) return i;
        }
    } else return -1; // not exactly 1 of them is true
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function animationFrameCalc(f, dir, button = false) {
    f = f + (animationStepSpeed * ((button) ? GFuel : 1)) * (dir * 2 - 1);
    f = (f <= 0) ? 0 : ((f >= 2) ? 2 : f);
    return f;
}
function inRect([Xleft, Xright, Ytop, Ybottom], points) {
    let inside = false;
    points.forEach(function (coor) {
        if (coor[0] >= Xleft && coor[0] <= Xright && coor[1] >= Ytop && coor[1] <= Ybottom) inside = true;
    });
    return inside;
}

// LEVELS

let currentLevel = []; // The currently displayed and manipulated level.

// Levels Object
let levels = {
    levels: [],
    exits: [],
    ghosts: [],
    buttons: [],
    scores: [[0, 0], 0, [0, 0]], // [[lowest, highest (time)], swaps, [blocks, alreadyCounted]] - live recording of the current level's score.
    currentLevel: 0,
    addLevel: function (values, goals, exitY, buttons) {
        this.levels.push(values);
        this.exits.push(exitY);
        this.buttons.push(buttons);
        score.goals.push(goals);
    },
    drawLevel: function (level, simple = false) { // draw the specified level
        let c = (simple) ? ctx.length - 1 : 1; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier
        clear(c);            /*opskjdcjcv jvc99cxyde09idsu8dyuxs90 -- cat code! #Kip's 3rd birthday*/
        if (c !== ctx.length - 1) {clear(2); clear(6); clear(7);}
        let l = this.levels[level];
        let semiShape = [0, []]; // [(1-open {=} 2-line {+}), [x's of no {=}]];
        let doneGoal = false; // when a block stops the goal, it's done.
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
                        ctx[c].drawImage(img[0], (blocks[1] + 2 * blocks[0]) * 100, (blocks[2] + 2 * blocks[3]) * 100, 100, 100, Math.round(x * m), Math.round(y * m), m, m);
                        if (x > 0 && y > 0) if (!blocks[1] && !blocks[2] && l[y - 1][x - 1] !== 1) ctx[c].drawImage(img[0], 400, 0, 100, 100, Math.round(x * m), Math.round(y * m), m, m);
                        if (x < width - 1 && y > 0) if (!blocks[0] && !blocks[2] && l[y - 1][x + 1] !== 1) ctx[c].drawImage(img[0], 400, 100, 100, 100, Math.round(x * m), Math.round(y * m), m, m);
                        if (x < width - 1 && y < height - 1) if (!blocks[0] && !blocks[3] && l[y + 1][x + 1] !== 1) ctx[c].drawImage(img[0], 400, 200, 100, 100, Math.round(x * m), Math.round(y * m), m, m);
                        if (x > 0 && y < height - 1) if (!blocks[1] && !blocks[3] && l[y + 1][x - 1] !== 1) ctx[c].drawImage(img[0], 400, 300, 100, 100, Math.round(x * m), Math.round(y * m), m, m);
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
                if (x == width - 1 && y >= this.exits[level] && !doneGoal) {
                    if (l[y][x] == 1) {
                        doneGoal = true;
                        ctx[(c == ctx.length - 1) ? c : 7].drawImage(img[3], 1 * 100, 1 * 50, 100, 50, x * m, (y) * m, m, m / 2);
                    } else {
                        ctx[(c == ctx.length - 1) ? c : 7].drawImage(img[3], 0 * 100, 0 * 100, 100, 100, x * m, y * m, m, m);
                        if (y == this.exits[level]) ctx[(c == ctx.length - 1) ? c : 7].drawImage(img[3], 1 * 100, 0 * 50, 100, 50, x * m, (y - 1/2) * m, m, m / 2);
                    }
                }
            }
            semiShape = semiNext;
        }
        // draw the buttons and spikes and walls and doors and stuff
        this.buttons[level].forEach(function (button) {
            button.activate(true, simple);
        });
    },
    startLevel: function (level) {
        if (level >= this.levels.length) level = this.levels.length - 1;
        if (level == this.currentLevel) { // restarting
            this.buttons[level].forEach(function (button) {
                button.activate(false);
            });
        }
        time = 1;
        frame = 0;
        stepcounter = 0;
        step = 0;
        clear(5);
        this.currentLevel = level;
        this.scores = [[0, 0], 0, [0, 0]];
        this.drawLevel(level);
        currentLevel = this.levels[level].map(row => [...row]);
        this.ghosts = [];
        nextGhost = new Ghost();
        dom.updateInstruct();
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
        this.buttons[this.currentLevel].forEach(function (button) {
            button.activate(false);
        });
        
        dom.newLevel(true);
        // setTimeout for when to start the next level
        setTimeout(function () {levels.startLevel(levels.currentLevel + 1);}, 1000);
        setTimeout(dom.newLevel, 1700);
    },
    update: function () {
        // Check if anything should go from 1.5 to [what it was before]:
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (currentLevel[y][x] == 1.5) {
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
                    if (!there) currentLevel[y][x] = levels.levels[levels.currentLevel][y][x];
                }
            }
        }
        this.buttons[this.currentLevel].forEach(function (button) {
            button.update();
        });
    },
    updateTime: function () { // updates the score based on the total time
        this.scores[0][0] = (frame < this.scores[0][0]) ? frame : this.scores[0][0];
        this.scores[0][1] = (frame > this.scores[0][1]) ? frame : this.scores[0][1];
    }
}

// Score object
let score = {
    goals: [], // calibrated from the 2nd parameter of 'levels.addLevel()'.
    ranks: [], // array of the addition of 'goals'.
    scores: [], // [rank, [0, 0, 0], message] player's information per level.
    translate: ["gold", "silver", "bronze", ""], // translate rank (0-3) to text ("gold", etc)
    messages: [ // 0-Gold 1-Silver 2-Bronze
        [
            "You've achieved <span class='gold'>Gold</span>, wondrous warrior!",
            "You've achieved <span class='gold'>Gold</span>, fantastic fighter!",
            "You've achieved <span class='gold'>Gold</span>, super solver!",
            "Your rank is <span class='gold'>Gold</span>. Nothing left to achieve.",
            "Getting <span class='gold'>Gold</span> feels great, doesn't it?",
            "You've reached <span class='gold'>Gold</span> rank; nice work.",
            "Good luck with the rest of the levels!",
            "You're <span class='gold'>Gold</span>, my friend.",
            "Excellent job perfoming at a <span class='gold'>Gold</span>-medal level.",
            "Don't stop working hard to get that <span class='gold'>Gold</span> rank!",
            "Good job reaching the rank of <span class='gold'>Gold</span>.",
            "Your skill has taken you all the way to <span class='gold'>Gold</span>; well done."
        ],
        [
            "To reach <span class='gold'>Gold</span>, focussing on taking <span class='ital'>less in-game time</span> to solve this level might be best.",
            "If <span class='silver'>Silver</span> isn't enough for you, you may want to try doing <span class='ital'>less time-swaps</span> to improve your rank.",
            "If you're wondering how to achieve the <span class='gold'>Gold</span> rank, using <span class='ital'>less dino-blocks</span> might help you the most."
        ],
        [
            "You're at <span class='bronze'>Bronze</span>, but to get to <span class='silver'>Silver</span>, you should try to complete this level in <span class='ital'>less in-game time</span>.",
            "The best way to improve your rank to <span class='silver'>Silver</span> will be to try doing <span class='ital'>less time-swaps</span>.",
            "To reach <span class='silver'>Silver</span>, your best bet will be to try to use <span class='ital'>less dino-blocks</span>."
        ]
    ],
    init: function () {
        for (let i = 0; i < score.goals.length; i++) { // calibrate the 'goals'.
            score.goals[i][0] = this.calibrate(score.goals[i][0]);
            score.goals[i][1] = this.calibrate(score.goals[i][1]);
        }
        levels.levels.forEach((l) => {
            score.scores.push([3, [0, 0, 0], "This level has not been completed."]);
        });
        let t = this;
        t.goals.forEach((nums) => {
            t.ranks.push([nums[0].reduce((a, b) => a + b, 0), nums[1].reduce((a, b) => a + b, 0)]);
        });
        initializeLevels();
    },
    calculate: function (level, [seconds, swaps, blocks], complete=true) {
        let s = this.calibrate([seconds, swaps, blocks]);
        let total = s.reduce((a, b) => a + b, 0);
        let rank = (total <= this.ranks[level][0]) ? 0 : ((total <= this.ranks[level][1]) ? 1 : 2);
        let diff = [
            s[0] / (this.goals[level][(rank > 0) ? rank - 1 : 0][0] + 1),
            s[1] / (this.goals[level][(rank > 0) ? rank - 1 : 0][1] + 1),
            s[2] / (this.goals[level][(rank > 0) ? rank - 1 : 0][2] + 1)
        ];
        let biggest = diff.indexOf(Math.max(...diff));
        biggest = (biggest == -1) ? Math.floor(Math.random() * 3) : biggest;
        let previousBest = this.scores[level][1].reduce((a, b) => a + b, 0);
        if (previousBest >= total || previousBest == 0) {
            this.scores[level] = [rank, s, this.messages[rank][(rank > 0) ? biggest : Math.floor(Math.random() * (this.messages[0].length - 1))]];
            console.log("(" + (levels.currentLevel + 1) + ") Score: [" + seconds + ", " + swaps + ", " + blocks + "] -- Rank: " + rank);
            if (complete) this.unlock(level + 1);
            return [rank, this.messages[rank][biggest], s];
        } else return [rank, this.scores[level][1], s];
    },
    calibrate: function ([seconds, swaps, blocks]) {
        // The below code needs to be super calibrated!
        return [seconds * 31, swaps * 205, blocks * 115];
    },
    displayScore: function (values, alreadyCalibrated) {
        let value = (!alreadyCalibrated) ? this.calibrate(values).reduce((a, b) => a + b, 0) : values.reduce((a, b) => a + b, 0);
        // take 'value' and put it between 100 and 1000; 1000 is the max score.
        let newValue = Math.floor(1058.5 - ((value * 920) / (value + 920)));
        return newValue;
    },
    unlock: function (newLevel) {
        // unlock the level in the html.
        console.log("Unlocking Level " + (newLevel + 1));
        let td = document.querySelector("tr #td" + (newLevel + 1));
        td.classList.remove("locked");
        td.setAttribute("onclick", "dom.play(" + (newLevel + 1) + ");");
        // update the bar for the previous level
        let bar = document.querySelector("tr #td" + (newLevel) + " .bar");
        bar.classList.add(score.translate[this.scores[newLevel - 1][0]]);
    }
}

// LEVELS

// Level creation!
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [3, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 0, 0], [30, 1, 1]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        2, [6, 10], 0,
        [
            new Lazer([4, [7, 11]], "Swap", false)
        ]
    ),
    new Button(
        1, [3, 10], 1,
        [
            new Lazer([10, [6, 10]], "Kill", false)
        ]
    )
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0],
    [3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 0, 0], [25, 0, 0]],
0,
[
    new Button(
        1, [3, 10], 0,
        [
            new Spikes([[6, 10, 0], [7, 10, 1], [10, 8, 0], [14, 10, 1]], 1)
        ]
    )
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[10, 0, 0], [25, 0, 0]],
0,
[
    
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
],
[[10, 0, 0], [20, 0, 0]],
0,
[
    
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 1],
    [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [3, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 0, 1], [25, 0, 5]],
0,
[
    
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [3, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[8, 0, 0], [20, 5, 3]],
0,
[
    
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 2, 2, 1, 1],
    [3, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 1, 1], [40, 6, 3]],
0,
[
    
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 2, 2, 2, 1, 1, 1],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[8, 0, 0], [25, 2, 2]],
7,
[

]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
],
[[12, 3, 3], [30, 6, 4]],
0,
[
    
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1],
],
[[15, 0, 0], [30, 0, 0]],
0,
[
    
]
);

levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [3, 0, 2, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[20, 1, 1], [30, 5, 3]],
0,
[
    
]
);
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1],
    [0, 0, 0, 1, 2, 2, 2, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[8, 1, 1], [15, 4, 3]],
5,
[

]
);
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
],
[[20, 4, 4], [40, 9, 10]],
0,
[
    
]
);
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
],
[[25, 0, 0], [30, 2, 2]],
0,
[
    
]
);
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
],
[[400, 70, 55], [1000, 130, 85]],
10,
[
    
]
);
/*
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
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 0, 0], [30, 0, 0]],
0,
[
    
]
);
*/

let instructions = [
    [["W", "A", "S", "D"], "Run to the right"],
    [[], "Jump through semi-solid platforms"],
    [["R", "P"], "Restart, or pause"],
    [[], ""],//[[], "Don't fall off the map"],
    [["S"], "Create a dino-block"],
    [["E"], "Swap the direction of time!"],
    [["S", "E"], "Past-you could be a block"],
    [[], ""],//[[], "Use less blocks, swaps, and time to score better"],
    [[], ""],//[[], "Stacking multiple blocks can help"],
    [[], ""],//[[], "Good luck"],
    [[], ""],//[[], "Levels are getting more puzzly!"],
    [[], ""],//[[], "Use 🠔🠕🠖🠗 instead of WASD, if you prefer"],
    [[], ""],//[[], "All menus are navigable with just the keyboard [WASD and enter], by the way"],
    [[], ""],//[[], "This is the second-last level!"],
    [[], ""],//[[], "Please don't waste your time on this"],
];