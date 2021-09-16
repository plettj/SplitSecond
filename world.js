// AVATAR/GHOSTS, PHYSICS, & OBSTACLES


// AVATAR/GHOSTS

// Avatar Object
let avatar = {
    coor: [0, 0], // in computer pixels
    box: [6, 7], // 2 game pixels from left, 2 from top
    keys: [0, 0, 0, 0], // [A, W, D, S] 1 = pressed
    action: 0, // 0-still 1-left 2-right
    dir: 1, // 0-left 1-right
    inAir: 0, // 0-grounded 1-in air
    //trapped: false, // true-stuck in wall/block
    bFrame: [0, 0, 0], // [(0 through 1.8 are animation frames; 2 is block), (0-outOfBlock; 1-intoBlock; -1-TRAPPED), (target x, in computer pixels)]
    vcoor: [0, 0], // velocity of the avatar
    vmax: [pixel * 0.9, 1 / 3.85 * unit], // max velocity: [x, y]
    amax: 1 / 8 * pixel, // max acceleration
    gravity: 1 / 7 * pixel,
    jump: 1 / 3.85 * unit, // jump speed
    time: true, // can swap time
    complete: false,
    init: function (coor) {
        this.keys = [0, 0, 0, 0];
        this.bFrame = [0, 0, 0];
        this.complete = false;
        this.coor = coor;
        this.dir = 1;
        this.vcoor = [0, 0];
        this.draw();
    },
    draw: function (a = [1, this.dir]) { // a: [xOnTileset, yOnTileset]
        if (!this.time) { // drawing the time-swap frames
            ctx[5].drawImage(img[2], this.dir * 100 + ((this.bFrame[0] == 2 || this.bFrame[1] == -1) ? 200 : 0), 600 + ((this.bFrame[1] == -1) ? 100 : 0), 100, 100, Math.round(this.coor[0]), Math.round(this.coor[1]), unit, unit);
        } else { // normal drawing
            ctx[5].drawImage(img[2], (this.bFrame[1] == -1) ? this.dir * 100 : a[0] * 100, (this.bFrame[1] == -1) ? 700 : a[1] * 100, 100, 100, Math.round(this.coor[0]), Math.round(this.coor[1]), unit, unit);
        }
    },
    drawTempSquares: function (squares, colour, opacity = 0.3) {
        ctx[4].beginPath();
        ctx[4].globalAlpha = opacity;
        ctx[4].fillStyle = colour;
        for (let i = 0; i < squares.length; i++) {
            ctx[4].fillRect(squares[i][0] * unit, squares[i][1] * unit, unit, unit);
        }
    },
    physics: function () { // PHYSICS
        clear(5, this.coor);
        let key = [((!this.keys[3] || this.keys[1]) && !this.bFrame[1]) ? this.keys[2] - this.keys[0] : 0, (this.keys[3] > this.keys[1]) ? -1 : this.keys[1]]; // [x, y] values: -1, 0, 1
        if (this.bFrame[1] == -1) {
            key = [0, 0];
            this.bFrame[1] = 0;
        }
        if (key[1] == -1 && (levels.scores[2][0] >= levels.powers[levels.currentLevel][1] && !levels.scores[2][1])) {
            // too many dino-bocks!
            shakePower(1);
            key[1] = 0;
        }

        // [Xleft, Xright, Ytop, Ybottom]
        let beforeInPixels = [this.coor[0] + pixel * 2, this.coor[0] + (this.box[0] + 1) * pixel, this.coor[1] + 2.99 * pixel, this.coor[1] + (this.box[1] + 2.99) * pixel];
        let before = beforeInPixels.map((n) => Math.floor(n / unit));
        if (!key[0]) this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.amax / (this.inAir + 1));
        this.vcoor[0] += key[0] * this.amax / (this.inAir + 1);
        this.vcoor[1] += this.gravity;
        for (let i = 0; i < 2; i++) if (Math.abs(this.vcoor[i]) > this.vmax[i]) this.vcoor[i] = Math.sign(this.vcoor[i]) * this.vmax[i];
        if (!this.bFrame[0]) { // if NOT in block, move horizontally.
            this.coor[0] += this.vcoor[0];
        }
        this.coor[1] += this.vcoor[1];
        let afterInPixels = [this.coor[0] + pixel * 2, this.coor[0] + (this.box[0] + 1) * pixel, this.coor[1] + 2.99 * pixel, this.coor[1] + (this.box[1] + 2.99) * pixel];
        let after = afterInPixels.map((n) => Math.floor(n / unit));
        
        if (before[3] < after[3]) { // DOWN - crossed into new cell
            onGround = (isS([before[0], after[3]]) || isS([before[1], after[3]]));
            if (onGround) {
                this.inAir = 0;
                this.vcoor[1] = 0;
                this.coor[1] = before[3] * unit;
            } else {
                this.inAir = 1;
                if (before[2] > height + 2) {
                    levels.startLevel(levels.currentLevel);
                    return;
                }
            }
        } else if (before[2] > after[2]) { // UP - crossed into new cell
            hitHead = (isS([before[0], after[2]], true) || isS([before[1], after[2]], true));
            if (hitHead) {
                this.coor[1] -= this.vcoor[1];
                this.vcoor[1] = this.gravity / -2;
            }
        }
        if (before[1] < after[1]) { // RIGHT - crossed into new cell
            hitWall = (isS([after[1], before[2]], true, true) || isS([after[1], before[3]], true, true));
            if (hitWall && before[0] == width - 1 && !this.complete && isGoalY([before[2], before[3]])) {
                levels.endLevel();
                this.complete = true;
                this.keys = [0, 0, 1, 0];
            } else if (hitWall) {
                this.vcoor[0] = 0;
                this.coor[0] = before[1] * unit + pixel * 2.99;
            }
        } else if (before[0] > after[0]) { // LEFT - crossed into new cell
            hitWall = (isS([after[0], before[2]], true, true) || isS([after[0], before[3]], true, true));
            if (hitWall) {
                this.vcoor[0] = 0;
                this.coor[0] = before[0] * unit - pixel * 1.99;
            }
        }

        if (key[0] && !this.bFrame[0]) {
            this.dir = (key[0] + 1) / 2;
            if (key[1] >= 0) this.action = (key[0] + 1) / 2 + 1;
            else this.action = 0;
        } else if (key[1] >= 0) this.action = 0;
        if (!this.inAir) { // not IN the AIR
            if (key[1] > 0) { // JUMP
                if (!this.bFrame[0]) {
                    this.vcoor[1] -= this.jump;
                    this.inAir = 1;
                }
                this.bFrame[1] = 0;
                levels.scores[2][1] = 0;
            } else if (key[1] < 0 && !this.bFrame[1]) { // DOWN
                if (!(isS([before[0], after[2]], true) || isS([before[1] / unit, after[2]], true)) && before[2] >= 0) { // not standing in DinoBlocks
                    if (isS([before[0], after[2]], true)) { // left is a DinoBlock
                        if (isS([before[1], after[3]])) { // right below is solid
                            this.bFrame[2] = before[1] * unit;
                            this.bFrame[1] = 1;
                            if (levels.scores[2][1] == 0) {
                                levels.scores[2][0]++; // add to total dino-blocks in level.
                                updatePower();
                            }
                            levels.scores[2][1] = 1;
                            this.vcoor[0] = 0;
                        }
                    } else if (isS([before[1], after[2]], true)) { // right is a DinoBlock
                        if (isS([before[0], after[3]])) { // left below is solid
                            this.bFrame[2] = before[0] * unit;
                            this.bFrame[1] = 1;
                            if (levels.scores[2][1] == 0) {
                                levels.scores[2][0]++; // add to total dino-blocks in level.
                                updatePower();
                            }
                            levels.scores[2][1] = 1;
                            this.vcoor[0] = 0;
                        }
                    } else {
                        this.bFrame[2] = (!isS([before[this.dir], after[3]])) ? before[this.dir * -1 + 1] * unit : before[this.dir] * unit;
                        this.bFrame[1] = 1;
                        if (levels.scores[2][1] == 0) {
                            levels.scores[2][0]++; // add to total dino-blocks in level.
                            updatePower();
                        }
                        levels.scores[2][1] = 1;
                        this.vcoor[0] = 0;
                    }
                } else if (before[2] >= 0) { // not above the screen
                    // comment out this code if I want to DISABLE [down] when INSIDE OTHER BLOCKS
                    this.bFrame[2] = (!isS([before[this.dir], after[3]])) ? before[this.dir * -1 + 1] * unit : before[this.dir] * unit;
                    this.bFrame[1] = 1;
                    if (levels.scores[2][1] == 0) {
                        levels.scores[2][0]++; // add to total dino-blocks in level.
                        updatePower();
                    }
                    levels.scores[2][1] = 1;
                    this.vcoor[0] = 0;
                }
            }
            if (this.bFrame[0] + this.bFrame[1]) { // slide towards the target:
                if (this.coor[0] - this.bFrame[2] > this.vmax[0]) this.coor[0] -= this.vmax[0] / 1.6;
                else if (this.coor[0] - this.bFrame[2] < -this.vmax[0]) this.coor[0] += this.vmax[0] / 1.6;
                else this.coor[0] = this.bFrame[2];
            }
        } else if (this.bFrame[0]) {
            this.bFrame[1] = 0;
            levels.scores[2][1] = 0;
        }
        this.bFrame[0] = animationFrameCalc(this.bFrame[0], this.bFrame[1]);

        
        //clear(4); // draw the squares that indicate the collision square locations.
        //this.drawTempSquares([[before[0], before[2]], [before[1], before[2]], [before[0], before[3]], [before[1], before[3]]], "#ff1515");
        //this.drawTempSquares([[after[0], after[2]], [after[1], after[2]], [after[0], after[3]], [after[1], after[3]]], "#15ffff");
        
        //let CLIPPED = XOR([isS([before[0], before[2]], true, false), isS([before[1], before[2]], true, false), isS([before[0], before[3]], true, false), isS([before[1], before[3]], true, false)]);
        
        //let CLIPPED = false;
        //if (before[2] >= 0 && before[2] < height) if (l[before[2]][before[0]] == 1 || l[before[2]][before[1]] == 1) CLIPPED = true;
        //if (before[3] >= 0 && before[3] < height) if (l[before[3]][before[0]] == 1 || l[before[3]][before[1]] == 1) CLIPPED = true;

        // -1: no clip. 
        let spots = [[before[0], before[2]], [before[1], before[2]], [before[0], before[3]], [before[1], before[3]]];
        let solid = [isS(spots[0], true, false), isS(spots[1], true, false), isS(spots[2], true, false), isS(spots[3], true, false)];
        let clipped = XOR(solid);
        if (clipped !== -1) {
            console.log("You've corner-clipped!");
            //this.drawTempSquares([[Math.floor((this.coor[0] + (this.box[0] / 2 + 1) * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)]], "#1515ff", 0.9);
            let centerCo = [Math.floor((this.coor[0] + (this.box[0] / 2 + 1) * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
            //if (this.vcoor[0] > 0 && isS([centerCo[0], centerCo[1]], true)) this.coor[0] = centerCo[0] * unit - 1 * pixel;
            //else this.coor[0] = centerCo[0] * unit + 2 * pixel
            
            if (clipped < 2) { // upwards clip
                this.coor[1] = centerCo[1] * unit - 2 * pixel;
            } else { // downwards clip
                this.coor[1] = centerCo[1] * unit - unit;
            }
        } else {
            // Get stuck in a block if your center is inside it!
            let center = [Math.floor((beforeInPixels[0] + beforeInPixels[1]) / 2 / unit), Math.floor((beforeInPixels[2] + beforeInPixels[3]) / 2 / unit)];

            if (center[0] >= 0 && center[0] < width && center[1] >= 0 && center[1] < height) {
                if (currentLevel[center[1]][center[0]] == 1) {
                    console.log("GET STUCK");
                    this.bFrame = [0, -1, center[0]];
                } else if ([
                    currentLevel[(spots[0][1] < 0) ? 0 : (spots[0][1] >= height) ? height - 1 : spots[0][1]][spots[0][0]] == 1,
                    currentLevel[(spots[1][1] < 0) ? 0 : (spots[1][1] >= height) ? height - 1 : spots[1][1]][spots[1][0]] == 1,
                    currentLevel[(spots[2][1] < 0) ? 0 : (spots[2][1] >= height) ? height - 1 : spots[2][1]][spots[2][0]] == 1,
                    currentLevel[(spots[3][1] < 0) ? 0 : (spots[3][1] >= height) ? height - 1 : spots[3][1]][spots[3][0]] == 1
                ].reduce((a, x) => x ? a + 1 : a, 0) > 1) { // snap out of block
                    if (((beforeInPixels[0] + beforeInPixels[1]) / 2 / unit) % 1 > 0.5) { // needs to move LEFT
                        console.log("SNAP LEFT");
                        if (this.vcoor[0] > 0) this.vcoor[0] = 0;
                        this.coor[0] = (center[0] + 0.3) * unit - 0.1;
                    } else {
                        console.log("SNAP RIGHT");
                        if (this.vcoor[0] < 0) this.vcoor[0] = 0;
                        this.coor[0] = (center[0] - 0.2) * unit + 0.1;
                    }
                }
            }
            if (levels.currentLevel == levelsWpowers[0] || levels.currentLevel == levelsWpowers[1]) {
                if (center[1] >= 0 && center[1] < height) {
                    let value = currentLevel[center[1]][center[0]];
                    if (value == 4 || value == 5) { // CAPTURED A POWERUP!
                        ctx[1].clearRect(center[0] * unit, center[1] * unit, unit, unit);
                        powers[value - 4] = true;
                        document.body.querySelectorAll("#Powers .powerBox")[value - 4].classList.add("on");
                    }
                }
            }
        }

        if (!this.action && Math.abs(this.vcoor[0]) < this.amax * 1.5) this.coor[0] -= this.vcoor[0];
        let a = [(this.inAir) ? 0 : stepCounter % 4, this.dir + ((this.inAir || this.action == 1 || this.action == 2) ? 2 : 0)];
        if (this.bFrame[0]) { // adjust 'a' to draw block!
            a[0] = Math.floor(this.bFrame[0]) + ((this.bFrame[0] == 2) ? Math.floor(stepCounter % 6 / 3) : 0);
            a[1] = this.dir + 4;
            if (this.bFrame[0] == 2) {// block stops at target x.
                this.coor[0] = this.bFrame[2];
            }
        }

        let trapped = 0;
        levels.buttons[levels.currentLevel].forEach(function (button) {
            button.objects.forEach(function (object) {
                if (object.type == "Swap" || object.type == "Kill") {
                    object.collide((beforeInPixels[0] + beforeInPixels[1]) / 2, (beforeInPixels[2] + beforeInPixels[3]) / 2, (afterInPixels[0] + afterInPixels[1]) / 2, beforeInPixels);
                } else if (object.type == "Spike") {
                    if (object.collide(beforeInPixels)) {
                        levels.startLevel(levels.currentLevel);
                    }
                } else if (object.type == "Wall") {
                    let result = object.collide(beforeInPixels); // [0-nothing 1-collide left 2-collide right 3-trapped, x]
                    if (result[0] == 3) {
                        trapped = -1;
                        avatar.vcoor[0] = 0;
                        avatar.bFrame[2] = result[1] * unit; // x coor
                        console.log("trapped");
                    } else if (result[0] == 2) { // hit RIGHT side of wall
                        console.log("right-collide");
                        avatar.vcoor[0] = 0;
                        avatar.coor[0] = (Math.floor(avatar.coor[0] / unit) + 0.5001) * unit;
                    } else if (result[0] == 1) { // hit LEFT side of wall
                        console.log("left-collide");
                        avatar.vcoor[0] = 0;
                        avatar.coor[0] = (Math.floor(avatar.coor[0] / unit) + (avatar.box[0] - 0.01) / 10) * unit;
                    }
                }
                // do nothing for on/off blocks; it's automatic
            });
        });
        if (trapped == -1) {
            this.bFrame[1] = -1; // -1 for trapped, 0 for normal
            this.bFrame[0] = 0;
        }
        this.draw(a);
    }
}

// Ghost Class
let Ghost = class {
    constructor () {
        this.time = time; // this ghost's native direction
        this.life = [frame, 10]; // lifetime = [startingFrame, endingFrame]
        this.coor1 = [Math.round(avatar.coor[0]), Math.round(avatar.coor[1])]; // life began at these pixels
        this.coor2 = [0, 0]; // life ended at these pixels
        this.instructions = []; // [x, y, OPENSLOT, dir, inAir, action, [blockAnimFrame, blockAnimDirection, targetX]]
        this.frame = 0; // location in instructions
        this.waiting = false; // whether it doesn't exist
    }
    learn () {
        this.instructions.push([Math.round(avatar.coor[0]), Math.round(avatar.coor[1]), 0, avatar.dir, avatar.inAir, avatar.action, [avatar.bFrame[0], avatar.bFrame[1], avatar.bFrame[2]]]);
    }
    draw () {
        if (this.instructions.length == 0) return;
        if (this.frame < 0 || this.frame >= this.instructions.length) {
            if (this.frame < 0) this.frame = 0;
            else this.frame = this.instructions.length - 1;
        }
        
        let f = this.instructions[this.frame];
        let a = [(f[4]) ? 0 : stepCounter % 4, f[3] + ((f[4] || f[5] == 1 || f[5] == 2) ? 2 : 0)];
        if (f[6][0]) { // adjust 'a' to draw block!
            a[0] = Math.floor(f[6][0]) + ((f[6][0] == 2) ? Math.floor(stepCounter % 6 / 3) : 0);
            a[1] = f[3] + 4;
            if (f[6][0] == 2) {
                ctx[4].globalAlpha = 1;
                currentLevel[Math.floor(f[1] / unit)][Math.floor(f[0] / unit)] = 1.5;
            }
        }
        ctx[4].drawImage(img[2], ((f[6][1] == -1) ? f[3] * 100 : a[0] * 100) + 400, (f[6][1] == -1) ? 700 : a[1] * 100, 100, 100, f[0], f[1], unit, unit);
        if (f[6][0] == 2) ctx[4].globalAlpha = 0.5;
    }
    newFrame () { // runs every frame
        if (!this.waiting) { // ghost isn't waiting
            if (between(this.life, frame)) { // ghost exists at this time.
                this.frame += time * this.time;
                this.draw();
            } else this.waiting = true;
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

// PHYSICS

function swapTime(override = false) {
    if ((avatar.time && levels.scores[1] < levels.powers[levels.currentLevel][0]) || override) { // if avatar is allowed to swap
        time *= -1;
        if (!override) { // pressed the key (not the swap-lazer)
            levels.scores[1]++;
            updatePower();
        }
        nextGhost.finish();
        levels.ghosts.push(nextGhost);
        nextGhost = new Ghost();
        avatar.time = false;
        setTimeout(function () {avatar.time = true;}, swapDelay);
    } else if (levels.scores[1] >= levels.powers[levels.currentLevel][0]) {
        shakePower(0);
    }
}

// OBSTACLES

// Each is its own class, rather than inheriting from a baseline class, because
// I'm a lazy programmer at the moment, and I realize that there's not a tonne that
// every object has in common other than general structure.

let Lazer = class {
    // ([x, [top, bottom]]), (type-"Swap"/"Kill"), (opp-true means opposite)
    constructor ([x, [top, bottom]], type, opp = false) {
        this.location = [x, [top, bottom]];
        this.type = type;
        this.opp = opp;
        this.active = !opp;
        this.side = 0;
        this.onScreen = false;
        this.points = [];
        if (this.type == "Kill") {
            for (let y = top + 0.5; y <= bottom + 0.5; y += 0.5) {
                this.points.push([(x + 0.5) * unit, y * unit]);
            }
        }
    }
    activate (activate = true, simple = false) {
        this.onScreen = activate;
        if (activate) {
            this.active = !this.opp;
            this.draw(simple);
        } else {
            this.active = !this.opp;
        }
    }
    draw (simple = false) {
        if (!this.onScreen) return;
        let c = (simple) ? ctx.length - 1 : 2; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier

        let kill = (this.type == "Kill") ? 100 : 0;
        ctx[c].drawImage(img[3], 200, 0, 100, 50, this.location[0] * m, (this.location[1][0] + 0.5) * m, m, m / 2);
        ctx[c].drawImage(img[3], 200, 50, 100, 50, this.location[0] * m, (this.location[1][1]) * m, m, m / 2);
        let ys = this.location[1]; // the y's
        c = (c == 2) ? 6 : c;
        for (let y = ys[0]; y <= ys[1]; y++) {
            if (y == ys[0]) { // vertical thing
                ctx[c].drawImage(img[3], 80 + kill, 100, 20, 50, (this.location[0] + 0.4) * m, (y + 0.5) * m, m / 5, m / 2);
            } else if (y == ys[1]) {// vertical thing 2
                ctx[c].drawImage(img[3], 80 + kill, 150, 20, 50, (this.location[0] + 0.4) * m, y * m, m / 5, m / 2);
            } else if (this.active) {
                ctx[c].drawImage(img[3], 0 + kill, 100, 20, 100, (this.location[0] + 0.4) * m, y * m, m / 5, m);
            }
        }
    }
    update (button) {
        if (!this.onScreen) return;
        // use "button" to figure everything out!! update this.onScreen.
        let info = button.memory[(!button.appear || !this.onScreen) ? 0 : Math.floor(frame / GFuel) - button.first];

        if (this.onScreen) this.active = (info[1] > 0 == this.opp);
        else {/*State of being during the out-going animation*/}


        let ys = this.location[1]; // the y's
        for (let y = ys[0] + 1; y < ys[1]; y++) {
            ctx[6].clearRect((this.location[0] + 0.4) * unit, y * unit, unit / 5, unit);
            if (this.active && this.onScreen) {
                ctx[6].drawImage(img[3], ((step > 0) ? step % 4 : 3 + step % 4) * 20 + ((this.type == "Kill") ? 100 : 0), 100, 20, 100, (this.location[0] + 0.4) * unit, y * unit, unit / 5, unit);
            }
        }
    }
    collide (x, y, newX, beforeIP) { // avatar's, in actual pixels
        if (!this.active || !this.onScreen) return;
        if (this.type == "Swap") {
            if (Math.sign(x - (this.location[0] + 0.5) * unit) !== Math.sign(newX - (this.location[0] + 0.5) * unit)) {
                //console.log("cross X!");
                //console.log(y + " - " + ((this.location[1][0] + 0.5) * unit));
                if (y > (this.location[1][0] + 0.5) * unit && y < (this.location[1][1] + 0.5) * unit) {
                    swapTime(true);
                }
            }
        } else if (this.type == "Kill") {
            let inLazer = inRect(beforeIP, this.points);
            if (inLazer) {
                levels.startLevel(levels.currentLevel);
            }
        }
    }
}

let Spikes = class {
    constructor (spikes, colour/* 0-black; 1-red */) {
        this.spikes = spikes.map((info) => [...info, info[2]]);
        // [x, y, natural, currState]
        this.colour = colour;
        this.type = "Spike";
        this.onScreen = false;
    }
    activate (activate = true, simple = false) {
        this.onScreen = activate;
        if (activate) this.draw(simple);
    }
    draw (simple = false) {
        if (!this.onScreen) return;
        let c = (simple) ? ctx.length - 1 : 2; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier

        for (let s = 0; s < this.spikes.length; s++) {
            ctx[c].drawImage(img[3], 500, this.spikes[s][2] * 50 + 300 * this.colour, 100, 50, Math.round(this.spikes[s][0] * m), Math.round((this.spikes[s][1] + 1) * m), m, m / 2);
            if (this.spikes[s][2]) {
                ctx[(c == 2) ? 6 : c].drawImage(img[3], 700, 300 * this.colour, 100, 100, this.spikes[s][0] * m, this.spikes[s][1] * m, m, m);
            }
        }
    }
    update (button) {
        if (!this.onScreen) return;
        let info = button.memory[(!button.appear || !this.onScreen) ? 0 : Math.floor(frame / GFuel) - button.first];

        for (let s = 0; s < this.spikes.length; s++) {
            let spike = this.spikes[s];
            if (spike[2]) {
                spike[3] = (info[0] == 0); // if button pressed, compare to spike's native state
            } else {
                spike[3] = (info[0] == 2); // if button pressed, compare to spike's native state
            }

            let animState = (info[0]) ? Math.ceil(info[0] + 0.01) : 0;
            if (spike[2] == 1) animState = (animState - 3) * -1;

            ctx[6].clearRect(spike[0] * unit, spike[1] * unit, unit, unit); // spike
            ctx[2].clearRect(spike[0] * unit, (spike[1] + 1) * unit, unit, unit / 2); // base

            if (animState !== 0) {
                ctx[6].drawImage(
                    img[3], 600 + ((animState == 3) ? 100 : 0), 300 * this.colour + ((animState == 2) ? 50 : 0), 100, 100 - ((animState % 3 !== 0) ? 50 : 0), 
                    spike[0] * unit, (spike[1] + ((animState % 3 !== 0) ? 0.5 : 0)) * unit, unit, unit / ((animState % 3 !== 0) ? 2 : 1)
                );
            }
            ctx[2].drawImage(img[3], 500, ((animState !== 0) ? 50 : 0) + 300 * this.colour, 100, 50, Math.round(spike[0] * unit), Math.round((spike[1] + 1) * unit), unit, unit / 2);
        }
    }
    collide (beforeIP) {
        if (!this.onScreen) return false;
        // run the collisions
        for (let s = 0; s < this.spikes.length; s++) {
            let ss = this.spikes[s];
            // points: [left, top, right]
            if (ss[3] >= 2) {
                let points = [[(ss[0] + 0.25) * unit, (ss[1] + 0.6) * unit], [(ss[0] + 0.5) * unit, (ss[1] + 0.3) * unit], [(ss[0] + 0.75) * unit, (ss[1] + 0.7) * unit]];
                if (inRect(beforeIP, points)) return true;
            }
        }
        return false;
    }
}

let Walls = class {
    constructor (walls) {
        this.walls = walls.map((info) => [...info, info[2]]);
        // [x, y, natural, currState]
        this.type = "Wall";
        this.onScreen = false;
    }
    activate (activate = true, simple = false) {
        this.onScreen = activate;
        if (activate) this.draw(simple);
    }
    draw (simple = false) {
        if (!this.onScreen) return;
        let c = (simple) ? ctx.length - 1 : 2; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier

        for (let w = 0; w < this.walls.length; w++) {
            ctx[c].drawImage(img[3], this.walls[w][2] * 100, 300, 100, 50, Math.round(this.walls[w][0] * m), Math.round((this.walls[w][1] - 0.5) * m), m, m / 2);
            ctx[c].drawImage(img[3], this.walls[w][2] * 100, 350, 100, 50, Math.round(this.walls[w][0] * m), Math.round((this.walls[w][1] + 1) * m), m, m / 2);
            if (this.walls[w][2]) {
                ctx[c].drawImage(img[3], 400, 300, 100, 100, this.walls[w][0] * m, this.walls[w][1] * m, m, m);
            }
        }
    }
    update (button) {
        if (!this.onScreen) return;
        let info = button.memory[(!button.appear || !this.onScreen) ? 0 : Math.floor(frame / GFuel) - button.first];

        for (let s = 0; s < this.walls.length; s++) {
            let wall = this.walls[s];
            wall[3] = ((wall[2] && info[0] == 0) || (!wall[2] && info[0] == 2)); // if button pressed, compare to wall's native state

            let animState = (info[0]) ? Math.ceil(info[0] + 0.01) : 0;
            if (wall[2] == 1) animState = (animState - 3) * -1;

            ctx[2].clearRect(wall[0] * unit, (wall[1] - 0.5) * unit, unit, unit * 2); // base

            if (animState !== 0) {
                ctx[2].drawImage(img[3], animState * 100 + 100, 300, 100, 100, Math.round(this.walls[s][0] * unit), Math.round(this.walls[s][1] * unit), unit, unit);
            }
            ctx[2].drawImage(img[3], ((animState !== 0) ? 100 : 0), 300, 100, 50, Math.round(this.walls[s][0] * unit), Math.round((this.walls[s][1] - 0.5) * unit), unit, unit / 2);
            ctx[2].drawImage(img[3], ((animState !== 0) ? 100 : 0), 350, 100, 50, Math.round(this.walls[s][0] * unit), Math.round((this.walls[s][1] + 1) * unit), unit, unit / 2);
        }
    }
    collide (beforeIP) {
        // run the collisions
        if (!this.onScreen) return [0, avatar.bFrame[2]];
        for (let w = 0; w < this.walls.length; w++) {
            let ww = this.walls[w];
            let points = [[(ww[0] + 0.3) * unit, (ww[1] + 0.5) * unit], [(ww[0] + 0.7) * unit, (ww[1] + 0.5) * unit], [(ww[0] + 0.5) * unit, (ww[1] + 0.5) * unit]];
            // points: [[left, right, middle]]
            if (ww[3]) { // wall is on!
                let collides = points.map((point) => inRect(beforeIP, [point]));
                if (collides[2]) {
                    return [3, ww[0]];
                } else if (collides[1]) {
                    return [2, ww[0]];
                } else if (collides[0]) {
                    return [1, ww[0]];
                }
            }
        }
        return [0, avatar.bFrame[2]];
    }
}

let Blocks = class {
    constructor (blocks) {
        this.blocks = blocks.map((info) => [...info, info[2]]);
        // [x, y, natural, currState]
        this.type = "Block";
        this.onScreen = false;
    }
    activate (activate = true, simple = false) {
        this.onScreen = activate;
        if (activate) this.draw(simple);
    }
    draw (simple = false) {
        if (!this.onScreen) return;
        let c = (simple) ? ctx.length - 1 : 2; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier

        for (let b = 0; b < this.blocks.length; b++) {
            ctx[c].drawImage(img[3], this.blocks[b][2] * 100 + 300, 0, 100, 100, Math.round(this.blocks[b][0] * m), Math.round(this.blocks[b][1] * m), m, m);
        }
    }
    update (button) {
        if (!this.onScreen) return;
        let info = button.memory[(!button.appear || !this.onScreen) ? 0 : Math.floor(frame / GFuel) - button.first];

        for (let s = 0; s < this.blocks.length; s++) {
            let block = this.blocks[s];
            block[3] = (info[1] > 0 == (block[2] != true));
            if (block[3]) {
                currentLevel[block[1]][block[0]] = 1;
            } else {
                currentLevel[block[1]][block[0]] = levels.levels[levels.currentLevel][block[1]][block[0]];
            }

            ctx[2].clearRect(block[0] * unit, block[1] * unit, unit, unit);
            ctx[2].drawImage(img[3], (block[3]) ? 400 : 300, 0, 100, 100, Math.round(this.blocks[s][0] * unit), Math.round(this.blocks[s][1] * unit), unit, unit);
        }
    }
}

// BUTTONS

let Button = class {
    constructor (type, coor, side/* 0-left 1-right */, objects, noButton = false) {
        this.type = type;
        // 0-walls 1-spike/deathLazer 2-swapLazer 3-spike/onOffBlocks
        this.coor = coor;
        this.spot = [(coor[0] + 0.2 + (side * -1 + 1) * 0.6) * unit, (coor[1] + 0.2) * unit, (coor[1] + 0.8) * unit];
        // [X, Ytop, Ybottom], in pixels, used for collisions
        this.objects = objects;
        this.side = side;
        this.dir = -1; // animation-direction
        this.first = 0; // the "frame" at which the first value of "memory" is located.
        this.memory = [[0, this.dir]]; // [values from 0 (off) to 2 (on), animDir];
        this.appear = !noButton;
        this.onScreen = false;
        // this.frame is: Math.floor(frame / GFuel);
    }
    activate (activate = true, simple = false) {
        if (activate) {
            this.onScreen = true;
            this.draw(simple, true);
        } else {
            this.onScreen = false;
            this.memory.splice(0, this.memory.length);
            this.dir = -1;
            this.memory.push([0, this.dir]);
            this.first = 0;
        }
        this.objects.forEach(function (object) {
            object.activate(activate, simple);
        });
    }
    draw (simple = false, first = false) {
        if (!this.onScreen || !this.appear) return;

        let c = (simple) ? ctx.length - 1 : 6; // main (top) canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier

        if (c !== ctx.length - 1) ctx[c].clearRect((this.coor[0] + 1 - 1.5 * this.side + 0.2 * (this.side * 2 - 1)) * m, this.coor[1] * m, m / 2, m);

        if (first) ctx[(c == ctx.length - 1) ? c : 2].drawImage(img[3], 50 * this.side + 200 * this.type, 200, 50, 100, (this.coor[0] + 1 - 1.5 * this.side) * m, this.coor[1] * m, m / 2, m);
        if (this.memory[(first) ? 0 : Math.floor(frame / GFuel) - this.first][1] < 0) ctx[c].drawImage(img[3], 50 * this.side + 100 + 200 * this.type, 200, 50, 100, (this.coor[0] + 1 - 1.5 * this.side + 0.2 * (this.side * 2 - 1)) * m, this.coor[1] * m, m / 2, m);
    }
    update () {
        let b = this;
        let f = Math.floor(frame / GFuel); // frame

        if (this.appear) {
            // UPDATE b.dir if COLLISION with AVATAR
            let avSpot = [(avatar.bFrame[0] == 0) ? avatar.coor[0] + pixel * 2 : avatar.coor[0], (avatar.bFrame[0] == 0) ? avatar.coor[0] + (avatar.box[0] + 1) * pixel : avatar.coor[0] + unit, avatar.coor[1] + 2.99 * pixel, avatar.coor[1] + (avatar.box[1] + 2.99) * pixel];
            
            if (inRect(avSpot, [[this.spot[0], this.spot[1]], [this.spot[0], this.spot[2]]])) {
                b.dir = 1;
            } else {
                b.dir = -1;
            }

            // update its memory
            if (f - b.first >= b.memory.length) { // FORWARD off the end of the memory
                b.memory.push([animationFrameCalc(b.memory[b.memory.length - 1][0], (b.dir / 2 + 0.5), true), b.dir]);
            } else if (f < b.first) { // BACKWARD off the end of the memory
                b.memory.unshift([animationFrameCalc(b.memory[0][0], (b.dir / 2 + 0.5), true), b.dir]);
                b.first--;
            } else { // middle of memory; update time!
                let previous = b.memory[(b.memory.length < 2) ? 0 : ((f - b.first - time >= 0) ? ((f - b.first - time < b.memory.length) ? f - b.first - time : b.memory.length - 2) : 1)];
                let now = b.memory[f - b.first];

                if (previous == undefined) {
                    console.log("type: " + b.type);
                    console.log(b.memory.length, (((f - b.first - time >= 0)) ? ((f - b.first - time < b.memory.length) ? f - b.first - time : b.memory.length - 2) : 1));
                }

                if (animationFrameCalc(previous[0], (b.dir / 2 + 0.5), true) > now[0]) {
                    b.memory[f - b.first] = [animationFrameCalc(previous[0], (b.dir / 2 + 0.5), true), b.dir];
                }
            }
        }

        // update its objects
        b.objects.forEach(function (object) {
            object.update(b);
        });

        // draw itself
        b.draw()
        
        if (!(f % 50)) {
            //console.log(this.memory.map((v) => Math.ceil(v)));
        }
    }
}