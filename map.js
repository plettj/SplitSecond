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
function isS([x, y], nonSemi = false, hor = false, l = levels.currentLevelMap, block = false) { // is solid???
    // nonSemi = true --> don't collide with semis.
    // hor = true --> do collide horizontally.
    // block = true --> don't collide with 1.5s
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
    else return (l[y][x] >= 1 && l[y][x] <= 2 && (l[y][x] != 1.5 || !outside) && !block);
}
function isGoalY([yt, yb]) { // checks if the character is in the goal y-values
    let yg = levels.exits[levels.currentLevel]; // y-goal
    if (yt < yg) return false;
    for (y = yg; y < height; y++) {
        if (levels.currentLevelMap[y][width - 1] == 1) break;
        if (y == yb) return true;
    }
    return false;
}
function XOR(values) { // returns index if exactly one of the values is true
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
    f = (f <= 0) ? 0 : ((f >= 2) ? 2 : Math.round(f * 100) / 100);
    return f;
}
function inRect([Xleft, Xright, Ytop, Ybottom], points) {
    let inside = false;
    points.forEach(function (coor) {
        if (coor[0] >= Xleft && coor[0] <= Xright && coor[1] >= Ytop && coor[1] <= Ybottom) inside = true;
    });
    return inside;
}
function save() {
    saved["autoStart"] = autoStart;
    saved["statisticTwo"] = statisticTwo;
    if (statisticTwo) GFuel = 1;
    else GFuel = 3;
    tempScoreRecord = [];
    if (!allUnlocked) {
        saved["powers"] = [powers[0], powers[1]];
        for (let l = 1; l <= levels.levels.length; l++) {
            if (score.scores[l - 1][1][0] + score.scores[l - 1][1][1] + score.scores[l - 1][1][2] > 0) {
                if (l !== levels.levels.length) {if (score.scores[l][1][0] + score.scores[l][1][1] + score.scores[l][1][2] <= 0) {
                    //console.log("Best level is now: ", l);
                    saved["bestLevel"] = l;
                }} else {
                    //console.log("Saved that you beat the final level!");
                }
                tempScoreRecord.push(score.scores[l - 1]);
            }
        }
    }
    saved["scores"] = tempScoreRecord;
    localStorage.setItem('saved', JSON.stringify(saved));
}

// LEVELS

//let currentLevel = []; // The currently displayed and manipulated level.

// Levels Object
let levels = {
    levels: [],
    exits: [],
    ghosts: [],
    buttons: [],
    powers: [],
    scores: [[0, 0], 0, [0, 0]], // [[lowest, highest (time)], swaps, [blocks, alreadyCounted]] - live recording of the current level's score.
    currentLevel: -1,
    currentLevelMap: [],
    addLevel: function (values, goals, exitY, buttons, swaps, blocks) {
        this.levels.push(values);
        this.exits.push(exitY);
        this.buttons.push(buttons);
        this.powers.push([swaps, blocks]);
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
                    case 1.5:
                        l[y][x] = 0; // mistakenly kept as 1.5
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
                            ctx[c].drawImage(img[0], option * 100, 500 + semiShape[0] * 100, 100, 100, x * m, y * m, m, m);
                            semiShape[0] = option % 3; // % 3 turns option {-} into 0 (good!)
                            if (y < height - 1) {
                                if (l[y + 1][x] % 3 !== 0) {
                                    ctx[c].drawImage(img[0], 400, 400, 100, 100, x * m, y * m, m, m); // feet
                                }
                            }
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
                    case 4: // swap-item location
                    case 5: // block-item location
                        if (!powers[l[y][x] - 4]) ctx[c].drawImage(img[3], (l[y][x] - 2) * 100, 100, 100, 100, x * m, y * m, m, m);
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
        // draw the buttons and spikes and walls and doors and stuff!!
        this.buttons[level].forEach(function (button) {
            button.activate(true, simple);
        });
    },
    startLevel: function (level) {
        if (level == this.currentLevel) { // restarting
            this.buttons[level].forEach(function (button) {
                button.activate(false);
            });
        } else if (level < this.levels.length) {
            // No idea if the below code is something that helps with the lag AT ALL
            for (let i = 0; i < this.currentLevelMap.length; i++) {
                delete this.currentLevelMap[i];
            }
            delete this.currentLevelMap;
            this.currentLevelMap = this.levels[level].map(row => [...row]);
        } else {
            this.startLevel(level - 1);
        }
        if (level >= this.levels.length) level = this.levels.length - 1;
        time = 1;
        frame = 0;
        stepcounter = 0;
        step = 0;
        clear(5);
        clear(4);
        this.currentLevel = level;
        delete this.scores;
        this.scores = [[0, 0], 0, [0, 0]];
        updatePower();
        this.drawLevel(level);
        for (let i = 0; i < this.ghosts.length; i++) {
            delete this.ghosts[i];
        }
        delete this.ghosts;
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

        document.body.querySelector("#LevelsMenu .content .back").style.display = "block";
        
        if (autoStart) {
            dom.newLevel(true);
            // setTimeout for when to start the next level
            setTimeout(function () {levels.startLevel(levels.currentLevel + 1);}, 1000);
            setTimeout(dom.newLevel, 1700);
        } else {
            setTimeout(function () {
                dom.newLevel(false);
                dom.newMenu(0);
                dom.newMenu();
                setTimeout(function () {
                    levels.currentLevel = -1;
                    document.body.querySelector("#LevelsMenu .content .back").style.display = "none";
                }, 50);
            }, 150);
        }

        dom.updateTotalScore(score.calcTotal());
    },
    update: function () {
        // Check if anything should go from 1.5 to [what it was before]:
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (this.currentLevelMap[y][x] == 1.5) {
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
                    if (!there) this.currentLevelMap[y][x] = this.levels[this.currentLevel][y][x];
                }
            }
        }
        this.buttons[this.currentLevel].forEach(function (button) {
            button.update();
        });
    },
    updateTime: function (start) { // updates the score based on the total time
        if (start) {
            let okToWait = true;
            this.buttons[this.currentLevel].forEach(function (button) {
                if (button.memory[0][1] !== 1) {
                    button.first = Math.floor(frame / GFuel);
                } else {
                    button.first = 0;
                    okToWait = false;
                }
            });
            if (okToWait) {
                this.scores[0][0] = frame;
                this.scores[0][0] = frame;
            }
        } else {
            this.scores[0][0] = (frame < this.scores[0][0]) ? frame : this.scores[0][0];
            this.scores[0][1] = (frame > this.scores[0][1]) ? frame : this.scores[0][1];
        }
    }
}

// Score object
let score = {
    goals: [], // calibrated from the 2nd parameter of 'levels.addLevel()'.
    ranks: [], // array of the addition of 'goals'.
    scores: [], // [rank, [0, 0, 0], message] player's information per level.
    myBest: [
        [2, 0, 0],
        [2, 0, 0],
        [2, 0, 0],
        [1, 0, 0],
        [2, 0, 0], // LEVEL 5 (not index)
        [2, 0, 0],
        [1, 1, 0],
        [2, 1, 0],
        [2, 0, 0],
        [4, 0, 0], // LEVEL 10
        [2, 1, 1],
        [2, 1, 1],
        [2, 1, 0],
        [3, 1, 1],
        [3, 0, 0], // LEVEL 15
        [3, 2, 2],
        [3, 0, 1],
        [2, 4, 4],
        [3, 0, 1],
        [2, 1, 1], // LEVEL 20 (index 19)
        [2, 1, 0],
        [4, 0, 2],
        [2, 1, 0],
        [2, 1, 0], // 24
        [3, 2, 3], // 25
        [2, 3, 3], // 26
        [4, 3, 2], // 27
        [2, 2, 1], // 28
        [6, 0, 2], // 29
        [2, 1, 0], // 30
        [6, 1, 0], // 31
        [4, 3, 4], // 32
        [4, 1, 2], // 33
        [7, 2, 1], // 34
        [11, 3, 0], // 35
        [11, 0, 0], // 36
        [99, 99, 99]
    ],
    totalScore: 0, // total calibrated score.
    translate: ["gold", "silver", "bronze", "uselessClass"], // translate rank (0-3) to text ("gold", etc).
    messages: [ // 0-Gold 1-Silver 2-Bronze.
        [
            "You achieved <span class='gold'>Gold</span>, wondrous warrior!",
            "You've achieved <span class='gold'>Gold</span>, fantastic fighter!",
            "You accomplished <span class='gold'>Gold</span>, super solver!",
            "Your rank is <span class='gold'>Gold</span>. Nothing left to achieve.",
            "Getting <span class='gold'>Gold</span> feels great, doesn't it?",
            "Impressive work. Getting <span class='gold'>Gold</span> is not for the faint of heart.",
            "You've reached <span class='gold'>Gold</span> rank; nice work.",
            "Good luck with the rest of the levels!",
            "Never let anyone tell you that you can't succeed, buddy.",
            "You're <span class='gold'>Gold</span>, my friend.",
            "Excellent job perfoming at a <span class='gold'>Gold</span>-medal level.",
            "Don't stop working hard to get that <span class='gold'>Gold</span> rank!",
            "Good job reaching the rank of <span class='gold'>Gold</span>.",
            "Your skill has taken you all the way to <span class='gold'>Gold</span>; well done.",
            "Great work; getting <span class='gold'>Gold</span> is certainly not easy.",
            "Exceptional job. You have done what you came here to do. You got <span class='gold'>Gold</span>.",
            "Nothing <span class='gold'>Gold</span> can stay. That is, nothing but your legendary rank on this level.",
            "Your forefathers would be proud of your <span class='gold'>Gold</span>-level achievement.",
            "Noiiiiice. <br>('Cause you got <span class='gold'>Gold</span>.)",
            "Pretty fantastic, what you've done. That is, getting <span class='gold'>Gold</span>.",
            "Nice work getting <span class='gold'>Gold</span> on this level.",
            "Your wisdom is beyond all human understanding, and it led you to the esteemed <span class='gold'>Gold</span> rank.",
            "It was your destiny to reach <span class='gold'>Gold</span>, my friend.",
            "You've done better than Chuck Norris: you've done <span class='gold'>Gold</span>.",
            "Ya done it, my friend. Ya got the medallion of the <span class='gold'>Gold</span> alloy.",
            "Amazing! I'm proud of you for getting <span class='gold'>Gold</span> on this level.",
            "I'm not sure how, but you managed to get a <span class='gold'>Gold</span> medal on this level. Congrats.",
            "You're really crushing these levels! <span class='gold'>Gold</span> after <span class='gold'>Gold</span> after <span class='gold'>Gold</span>."
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
            if (i < saved["scores"].length) {
                score.scores.push(saved["scores"][i]);
            } else {
                score.scores.push([3, [0, 0, 0], "This level has not been completed."]);
            }
        }
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
        console.log("(Level " + (levels.currentLevel + 1) + ") Score: [" + seconds + ", " + swaps + ", " + blocks + "] -- Rank: " + rank);
        if (previousBest >= total || previousBest == 0) {
            this.scores[level] = [rank, s, this.messages[rank][(rank > 0) ? biggest : Math.floor(Math.random() * (this.messages[0].length - 1))]];
            if (complete) this.unlock(level + 1);
            save();
            return [rank, this.messages[rank][biggest], s];
        } else return [rank, this.scores[level][1], s];
    },
    calibrate: function ([seconds, swaps, blocks], sum = false) {
        // The below code needs to be super calibrated!
        let calibratedScore = [seconds * 11, swaps * 79, blocks * 47];
        if (!sum) return calibratedScore;
        else return calibratedScore.reduce((a, b) => a + b, 0);
    },
    unCalibrate: function ([seconds, swaps, blocks]) {
        return [Math.round(seconds / 11), Math.round(swaps / 79), Math.round(blocks / 47)];
    },
    displayScore: function (values, alreadyCalibrated, level) {
        let value = (!alreadyCalibrated) ? this.calibrate(values).reduce((a, b) => a + b, 0) : values.reduce((a, b) => a + b, 0);
        let bestScore = this.calibrate(this.myBest[level]).reduce((a, b) => a + b, 0);
        if (value <= bestScore) return 1000;
        let ratio = (value + 100) / (bestScore + 100);
        let newValue = Math.floor(1000 / ratio);
        //console.log(Math.floor(ratio * 1000) / 1000 + " --> " + newValue);

        return newValue;
    },
    unlock: function (newLevel) {
        // unlock the level in the html.
        //console.log("Unlocking Level " + (newLevel + 1));
        if (newLevel >= levels.levels.length) {
            //console.log("You've beat the final level!!");
            if (newLevel == levels.levels.length) {
                let bar = document.querySelector("tr #td" + (newLevel) + " .bar");
                //console.log("And you got " + score.translate[this.scores[newLevel - 1][0]] + ".    (noice)");
                bar.classList.add(score.translate[this.scores[newLevel - 1][0]]);
                save();
            }
            return;
        }
        let td = document.querySelector("tr #td" + (newLevel + 1));
        td.classList.remove("locked");
        td.setAttribute("onclick", "dom.play(" + (newLevel + 1) + ");");
        // update the bar for the previous level
        let bar = document.querySelector("tr #td" + (newLevel) + " .bar");
        //console.log(score.translate[this.scores[newLevel - 1][0]]);
        bar.classList.add(score.translate[this.scores[newLevel - 1][0]]);
    },
    calcTotal: function () {
        let curr = 0;
        for (let l = 0; l < this.scores.length; l++) {
            let calibrated = score.displayScore(this.scores[l][1], true, l);
            if (this.scores[l][1].reduce((a, b) => a + b, 0) > 0) curr += calibrated;
        }
        this.totalScore = curr;
        return curr;
    }
}

// LEVELS

// Level creation!
/*
((template below))

// DIFFICULTY: 6 / 10
// MY PERSONAL BEST ON BELOW: [9, 9, 9]
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
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[15, 0, 0], [25, 0, 0]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[],
0, 0 // swaps, blocks
); // ^ LEVEL index ##
*/

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
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [3, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
],
[[8, 0, 0], [25, 0, 0]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[],
0, 0 // swaps, blocks
); // ^ LEVEL index 0
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
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[6, 0, 0], [16, 0, 0]],
0,
[],
0, 0 // swaps, blocks
);  // ^ LEVEL index 1
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
[[8, 0, 0], [20, 0, 0]],
0,
[],
0, 0
); // ^ LEVEL index 2
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 2, 2, 2, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[6, 0, 0], [20, 0, 0]],
0,
[
    new Button(
        2, [6, 10], 0,
        [
            new Lazer([7, [6, 9]], "Swap", false)
        ],
        true
    ),
    new Button(
        3, [0, 0], 0,
        [
            new Spikes([[13, 10, 1], [14, 10, 1]], 0)
        ],
        true
    )
],
0, 0
); // ^ LEVEL index 3
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[12, 0, 0], [30, 0, 0]],
0,
[
    new Button(
        2, [0, 0], 0,
        [
            new Lazer([10, [4, 8]], "Swap", false)
        ],
        true
    ),
    new Button(
        0, [3, 10], 0,
        [
            new Walls([[12, 7, 1]])
        ]
    ),
],
0, 0
); // ^ LEVEL index 4
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
],
[[4, 0, 0], [15, 0, 0]],
0,
[],
0, 0
); // ^ LEVEL index 5
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 0, 0, 2, 2, 1, 1, 2, 2, 0, 0, 0, 1, 0, 0],
    [3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[8, 1, 0], [20, 4, 0]],
8,
[
    new Button(
        0, [5, 8], 0,
        [
            new Walls([[13, 10, 1]])
        ]
    ),
    new Button(
        1, [0, 0], 0,
        [
            new Spikes([[12, 6, 1], [13, 6, 1]], 1)
        ],
        true
    )
],
5, 0
); // ^ LEVEL index 6
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
],
[[10, 1, 0], [20, 3, 0]],
4,
[
    new Button(
        1, [1, 6], 1,
        [
            new Lazer([13, [3, 7]], "Kill", false)
        ]
    ),
],
4, 0
); // ^ LEVEL index 7
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1],
],
[[3, 0, 0], [15, 0, 0]],
0,
[],
0, 0
); // ^ LEVEL index 8
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
[[8, 0, 0], [25, 0, 1]],
0,
[],
1, 3
); // ^ LEVEL index 9
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
[[10, 1, 1], [20, 3, 3]],
0,
[
    new Button(
        1, [13, 8], 0,
        [
            new Spikes([[10, 10, 1], [11, 10, 1]], 1)
        ]
    )
],
3, 3
); // ^ LEVEL index 10
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 2, 2, 2, 1, 1, 1, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
],
[[5, 1, 1], [20, 3, 2]],
0,
[
    new Button(
        0, [0, 0], 0,
        [
            new Lazer([11, [-1, 5]], "Kill", false)
        ],
        true
    ),
],
3, 3
); // ^ LEVEL index 11
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [3, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
],
[[5, 1, 0], [15, 2, 1]],
0,
[
    new Button(
        3, [2, 8], 0,
        [
            new Blocks([[7, 5, 0], [8, 5, 0], [13, 2, 1], [13, 3, 1]])
        ]
    )
],
3, 0
); // ^ LEVEL index 12
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 1, 0, 1, 0, 0, 0, 1, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1]
],
[[8, 1, 1], [15, 3, 3]],
6,
[],
3, 3
); // ^ LEVEL index 13
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 2, 2, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 2, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
],
[[10, 2, 0], [25, 4, 0]],
0,
[
    new Button(
        1, [2, 9], 1,
        [
            new Lazer([8, [4, 8]], "Kill", true),
            new Lazer([9, [-1, 3]], "Kill", false),
            new Spikes([[12, 5, 1], [13, 5, 1], [14, 5, 1]], 1)
        ]
    ),
    new Button(
        3, [7, 3], 0,
        [
            new Spikes([[5, 7, 1], [6, 7, 1], [7, 7, 1]], 0)
        ]
    )
],
5, 0
); // ^ LEVEL index 14
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
],
[[12, 3, 3], [30, 6, 4]],
0,
[],
3, 3
); // ^ LEVEL index 15
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 0, 1], [30, 0, 2]],
0,
[
    new Button(
        2, [2, 5], 0,
        [
            new Lazer([7, [3, 9]], "Swap", true),
            new Lazer([3, [-1, 5]], "Swap", false),
        ]
    ),
],
0, 2
); // ^ LEVEL index 16
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 0, 0, 1, 1],
    [0, 0, 1, 1, 2, 0, 0, 0, 1, 1, 0, 0, 2, 0, 1, 1],
    [0, 0, 1, 1, 0, 2, 0, 0, 1, 1, 0, 0, 0, 2, 1, 1],
    [3, 0, 1, 1, 0, 0, 2, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[7, 4, 4], [25, 8, 8]],
0,
[],
8, 8
); // ^ LEVEL index 17
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[10, 0, 1], [25, 0, 2]],
0,
[
    new Button(
        2, [2, 5], 0,
        [
            new Lazer([7, [3, 11]], "Swap", true),
            new Lazer([3, [-1, 5]], "Swap", false),
        ]
    ),
],
0, 2
); // ^ LEVEL index 18
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
],
[[5, 1, 1], [10, 2, 2]],
0,
[],
3, 3
); // ^ LEVEL index 19
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
],
[[5, 1, 0], [12, 1, 0]],
0,
[
    new Button(
        3, [2, 7], 0,
        [
            new Blocks([[5, 6, 0], [6, 6, 0], [9, 5, 1], [10, 5, 1]])
        ]
    ) 
],
2, 0
);  // ^ LEVEL index 20
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 0, 2], [40, 0, 3]],
0,
[
    new Button(
        2, [2, 5], 0,
        [
            new Lazer([7, [3, 11]], "Swap", true),
            new Lazer([3, [-1, 5]], "Swap", false),
        ]
    ),
],
0, 3
); // ^ LEVEL index 21
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
],
[[5, 1, 0], [11, 1, 0]],
0,
[
    new Button(
        3, [1, 8], 0,
        [
            new Blocks([[4, 7, 1], [5, 7, 1], [7, 6, 0], [8, 6, 0], [10, 5, 1], [11, 5, 1]])
        ]
    ) 
],
2, 0
);  // ^ LEVEL index 22
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
],
[[7, 1, 0], [12, 1, 0]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        1, [0, 8], 1,
        [
            new Spikes([[2, 10, 1], [3, 10, 1], [4, 10, 1], [5, 10, 1], [6, 10, 1], [7, 10, 1], [8, 10, 1], [9, 10, 1], [10, 10, 1], [11, 10, 1], [12, 10, 1], [13, 10, 1]], 1)
        ]
    ),
],
1, 0 // swaps, blocks
); // ^ LEVEL index 23
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 2, 0, 2, 2, 0, 0],
    [3, 0, 0, 2, 2, 2, 2, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0]
],
[[6, 2, 3], [12, 3, 3]], // [Gold, Silver] --> [seconds, swaps, blocks]
8, // [goal-y]
[],
3, 3 // swaps, blocks
); // ^ LEVEL index 24
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
],
[[9, 3, 3], [16, 3, 3]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        3, [0, 0], 1,
        [
            new Spikes([[1, 6, 1], [2, 7, 1], [3, 8, 1], [4, 9, 1], [5, 10, 1]], 0)
        ],
        true
    ),
],
3, 3 // swaps, blocks
); // ^ LEVEL index 25
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 0, 2, 2, 2, 2, 0],
    [0, 0, 1, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 1, 1],
    [3, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[12, 3, 2], [20, 4, 3]], // [Gold, Silver] --> [seconds, swaps, blocks]
5, // [goal-y]
[
    new Button(
        0, [1, 7], 0,
        [
            new Walls([[2, 5, 1]])
        ]
    ),
],
4, 3 // swaps, blocks
); // ^ LEVEL index 26
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[14, 2, 1], [22, 3, 2]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        3, [1, 7], 0,
        [
            new Spikes([[13, 6, 1]], 0),
            new Blocks([[5, 7, 0], [5, 8, 0], [7, 4, 0], [8, 4, 0], [10, 7, 1], [10, 8, 1]])
        ]
    ),
],
3, 2 // swaps, blocks
); // ^ LEVEL index 27
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
],
[[23, 0, 2], [40, 0, 2]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        2, [3, 4], 0,
        [
            new Lazer([10, [-1, 11]], "Swap", true),
            new Lazer([9, [-1, 12]], "Swap", false),
        ]
    ),
],
0, 3 // swaps, blocks
); // ^ LEVEL index 28 (6 on paper)
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 2, 2, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
],
[[3, 1, 0], [12, 1, 0]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        1, [1, 8], 1,
        [
            new Lazer([10, [-1, 11]], "Kill", false),
            new Lazer([11, [-1, 11]], "Kill", true),
            new Lazer([12, [-1, 11]], "Kill", false)
        ],
    ),
],
1, 0 // swaps, blocks
); // ^ LEVEL index 29
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[25, 2, 0], [45, 2, 0]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        0, [2, 4], 1,
        [
            new Walls([[6, 4, 1], [6, 6, 0]]),
        ]
    ),
    new Button(
        1, [12, 8], 1,
        [
            new Spikes([[5, 6, 1]], 1),
        ]
    ),
    new Button(
        2, [0, 4], 0,
        [
            new Lazer([9, [5, 7]], "Swap", true),
        ]
    ),
    new Button(
        3, [3, 8], 0,
        [
            new Spikes([[10, 6, 0]], 0),
            new Blocks([[13, 7, 0]])
        ]
    ),
],
2, 0 // swaps, blocks
); // ^ LEVEL index 30
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 2, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0]
],
[[16, 3, 4], [30, 3, 5]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        1, [0, 0], 0,
        [
            new Lazer([11, [-1, 6]], "Kill", false),
            new Lazer([4, [-1, 6]], "Kill", false)
        ],
        true
    ),
],
3, 5 // swaps, blocks
); // ^ LEVEL index 31
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
],
[[15, 1, 2], [30, 1, 3]],
0,
[
    new Button(
        1, [2, 8], 0,
        [
            new Spikes([[5, 9, 1]], 1)
        ]
    ),
    new Button(
        2, [3, 10], 0,
        [
            new Lazer([10, [6, 10]], "Swap", true),
        ]
    )
],
1, 3
); // ^ LEVEL index 32
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2],
    [0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 1, 1, 2, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[20, 2, 1], [25, 3, 2]], // [Gold, Silver] --> [seconds, swaps, blocks]
9, // [goal-y]
[
    new Button(
        1, [9, 5], 1,
        [
            new Lazer([11, [4, 12]], "Kill", false)
        ]
    ),
    new Button(
        1, [4, 5], 1,
        [
            new Lazer([4, [-1, 8]], "Kill", true)
        ]
    ),
    new Button(
        0, [15, 3], 0,
        [
            new Walls([[7, 6, 1], [8, 6, 1]]),
        ]
    ),
],
3, 2 // swaps, blocks
); // ^ LEVEL index 33
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    [3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[30, 3, 0], [75, 3, 0]], // [Gold, Silver] --> [seconds, swaps, blocks]
6, // [goal-y]
[
    new Button(
        1, [1, 7], 1,
        [
            new Spikes([[8, 3, 0], [6, 3, 0]], 1),
            new Lazer([2, [6, 8]], "Kill", false),
            new Lazer([2, [4, 6]], "Kill", false),
            new Lazer([12, [6, 8]], "Kill", false),
            new Lazer([10, [3, 5]], "Kill", false),
        ]
    ),
    new Button(
        0, [3, 8], 1,
        [
            new Walls([[4, 8, 1], [4, 4, 1], [10, 8, 1]])
        ]
    ),
    new Button(
        2, [11, 5], 1,
        [
            //new Lazer([11, [3, 5]], "Swap", false),
            new Lazer([7, [8, 10]], "Swap", true)
        ]
    ),
    new Button(
        3, [5, 8], 0,
        [
            new Spikes([[6, 9, 0], [8, 9, 1]], 0),
            new Blocks([[7, 3, 0]])
        ]
    ),
    new Button(
        0, [11, 8], 0,
        [
            new Walls([[14, 6, 1], [12, 5, 1]])
        ]
    ),
],
3, 0 // swaps, blocks
); // ^ LEVEL index 34
levels.addLevel([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
    [0, 1, 0, 2, 2, 1, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2],
    [1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
],
[[75, 0, 0], [150, 0, 0]], // [Gold, Silver] --> [seconds, swaps, blocks]
0, // [goal-y]
[
    new Button(
        0, [0, 0], 0,
        [
            new Spikes([[4, 0, 1], [10, 0, 1]], 1)
        ],
        true
    ),
    new Button(
        0, [0, 0], 0,
        [
            new Spikes([[5, 0, 1], [6, 0, 1], [8, 0, 1], [9, 0, 1]], 0)
        ],
        true
    )
],
0, 0 // swaps, blocks
); // ^ LEVEL index 35

let instructions = [
    [["W", "A", "S", "D"], "Run to the right"],
    [[], "Jump through semi-solid platforms"],
    [["R", "P"], "Restart, or Pause"],
    [[], ""],
    [[], ""],
    [[], ""],
    [["E"], "Swap the direction of time!"],
    [[], ""],
    [[], ""],
    [["S"], "Create a dino-block!"],
    [["S", "E"], "Dino-blocks can be support..."],
    [[], ""], // LEVEL index 11
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""],
    [[], ""]
];