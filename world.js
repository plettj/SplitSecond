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
    bFrame: [0, 0, 0], // [(0 through 1.8 are animation frames; 2 is block), (0-outOfBlock; 1-intoBlock), (target x, in computer pixels)]
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
            ctx[5].drawImage(img[2], this.dir * 100 + ((this.bFrame[0] == 2) ? 200 : 0), 600, 100, 100, Math.round(this.coor[0]), Math.round(this.coor[1]), unit, unit);
        } else { // normal drawing
            ctx[5].drawImage(img[2], a[0] * 100, a[1] * 100, 100, 100, Math.round(this.coor[0]), Math.round(this.coor[1]), unit, unit);
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
                            if (levels.scores[2][1] == 0) levels.scores[2][0]++; // add to total dino-blocks in level.
                            levels.scores[2][1] = 1;
                            this.vcoor[0] = 0;
                        }
                    } else if (isS([before[1], after[2]], true)) { // right is a DinoBlock
                        if (isS([before[0], after[3]])) { // left below is solid
                            this.bFrame[2] = before[0] * unit;
                            this.bFrame[1] = 1;
                            if (levels.scores[2][1] == 0) levels.scores[2][0]++; // add to total dino-blocks in level.
                            levels.scores[2][1] = 1;
                            this.vcoor[0] = 0;
                        }
                    } else {
                        this.bFrame[2] = (!isS([before[this.dir], after[3]])) ? before[this.dir * -1 + 1] * unit : before[this.dir] * unit;
                        this.bFrame[1] = 1;
                        if (levels.scores[2][1] == 0) levels.scores[2][0]++; // add to total dino-blocks in level.
                        levels.scores[2][1] = 1;
                        this.vcoor[0] = 0;
                    }
                } else if (before[2] >= 0) { // not above the screen
                    // comment out this code if I want to DISABLE [down] when INSIDE OTHER BLOCKS
                    this.bFrame[2] = (!isS([before[this.dir], after[3]])) ? before[this.dir * -1 + 1] * unit : before[this.dir] * unit;
                    this.bFrame[1] = 1;
                    if (levels.scores[2][1] == 0) levels.scores[2][0]++; // add to total dino-blocks in level.
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
        let clipped = XOR([isS(spots[0], true, false), isS(spots[1], true, false), isS(spots[2], true, false), isS(spots[3], true, false)]);
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

        levels.buttons[levels.currentLevel].forEach(function (button) {
            button.objects.forEach(function (object) {
                //if (object.type = "Swap") {
                    object.collide((beforeInPixels[0] + beforeInPixels[1]) / 2, (beforeInPixels[2] + beforeInPixels[3]) / 2, (afterInPixels[0] + afterInPixels[1]) / 2);
                //}
            });
        });

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
        ctx[4].drawImage(img[2], a[0] * 100 + 400, a[1] * 100, 100, 100, f[0], f[1], unit, unit);
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
    if (avatar.time || override) { // if avatar is allowed to swap
        time *= -1;
        if (!override) { // pressed the key (not the swap-lazer)
            levels.scores[1]++;
        }
        nextGhost.finish();
        levels.ghosts.push(nextGhost);
        nextGhost = new Ghost();
        avatar.time = false;
        setTimeout(function () {avatar.time = true;}, swapDelay);
    }
}

// OBSTACLES

let Lazer = class {
    // ([x, [top, bottom]]), (job-Swap/Teleport/Kill), (value-boolean)
    constructor ([x, [top, bottom]], job, value) {
        this.location = [x, [top, bottom]];
        this.job = job;
        this.on = value;
        this.side = 0;
        this.activated = false;
    }
    activate (activate = true, simple = false) {
        this.activated = activate;
        if (activate) this.draw(simple);
    }
    draw (simple = false) {
        if (!this.activated) return;
        let c = (simple) ? ctx.length - 1 : 2; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier
        ctx[c].drawImage(img[3], 200, 0, 100, 50, this.location[0] * m, (this.location[1][0] + 0.5) * m, m, m / 2);
        ctx[c].drawImage(img[3], 200, 50, 100, 50, this.location[0] * m, (this.location[1][1]) * m, m, m / 2);
        if (this.on) {
            let ys = this.location[1]; // the y's
            c = (c == 2) ? 6 : c;
            for (let y = ys[0]; y <= ys[1]; y++) {
                if (y == ys[0]) { // vertical thing
                    ctx[c].drawImage(img[3], 80, 100, 20, 50, (this.location[0] + 0.4) * m, (y + 0.5) * m, m / 5, m / 2);
                } else if (y == ys[1]) {// vertical thing 2
                    ctx[c].drawImage(img[3], 80, 150, 20, 50, (this.location[0] + 0.4) * m, y * m, m / 5, m / 2);
                } else {
                    ctx[c].drawImage(img[3], 0, 100, 20, 100, (this.location[0] + 0.4) * m, y * m, m / 5, m);
                }
            }
        }
    }
    update (button) {


        // use "button" to figure everything out!!


        if (this.on && this.activated) {
            let ys = this.location[1]; // the y's
            for (let y = ys[0] + 1; y < ys[1]; y++) {
                ctx[6].clearRect((this.location[0] + 0.4) * unit, y * unit, unit / 5, unit);
                ctx[6].drawImage(img[3], ((step > 0) ? step % 4 : 3 + step % 4) * 20, 100, 20, 100, (this.location[0] + 0.4) * unit, y * unit, unit / 5, unit);
            }
        }
    }
    collide (x, y, newX) { // avatar's, in actual pixels
        if (Math.sign(x - (this.location[0] + 0.5) * unit) !== Math.sign(newX - (this.location[0] + 0.5) * unit)) {
            //console.log("cross X!");
            //console.log(y + " - " + ((this.location[1][0] + 0.5) * unit));
            if (y > (this.location[1][0] + 0.5) * unit && y < (this.location[1][1] + 0.5) * unit) {
                swapTime(true);
            }
        }
    }
}

// BUTTONS

let Button = class {
    constructor (type, coor, side/* 0-left 1-right */, objects, noButton = false) {
        this.type = type;
        // 0-wall 1-spike/deathLazer 2-swapLazer 3-spike/onOffBlocks
        this.coor = coor;
        this.objects = objects;
        this.side = side;
        this.dir = -1; // animation-direction
        this.first = 0; // the "frame" at which the first value of "memory" is located.
        this.memory = [0]; // values from 0 (off) to 2 (on)
        this.appear = !noButton;
        this.onScreen = false;
        // this.frame is: Math.floor(frame / GFuel);
    }
    activate (activate = true, simple = false) {
        if (activate) {
            this.onScreen = true;
        } else {
            this.onScreen = false;


            // destroy its memory and re-initialize it!!!!!


        }
        this.objects.forEach(function (object) {
            object.activate(activate, simple);
        });
    }
    draw (simple = false) {
        if (!this.onScreen || !this.appear) return;

        let c = (simple) ? ctx.length - 1 : 2; // canvas index
        let m = (simple) ? unit * 0.32 : unit; // size multiplier

        ctx[c].drawImage(img[3], 50 * this.side + 200 * this.type, 200, 50, 100, (this.coor[0] + 1 + 0.5 * this.side) * m, this.coor[1] * m, m / 2, m);
        if (this.memory[Math.floor(frame / GFuel) - this.first] == 0) ctx[c].drawImage(img[3], 50 * this.side + 100 + 200 * this.type, 200, 50, 100, (this.coor[0] + 1 + 0.5 * this.side + 0.2 * (this.side * 2 - 1)) * m, this.coor[1] * m, m / 2, m);

        /*
        if (this.on) {
            let ys = this.location[1]; // the y's
            c = (c == 2) ? 6 : c;
            for (let y = ys[0]; y <= ys[1]; y++) {
                if (y == ys[0]) { // vertical thing
                    ctx[c].drawImage(img[3], 80, 100, 20, 50, (this.location[0] + 0.4) * m, (y + 0.5) * m, m / 5, m / 2);
                } else if (y == ys[1]) {// vertical thing 2
                    ctx[c].drawImage(img[3], 80, 150, 20, 50, (this.location[0] + 0.4) * m, y * m, m / 5, m / 2);
                } else {
                    ctx[c].drawImage(img[3], 0, 100, 20, 100, (this.location[0] + 0.4) * m, y * m, m / 5, m);
                }
            }
        }
        */
    }
    update () {
        let b = this;
        let f = Math.floor(frame / GFuel); // frame


        // UPDATE b.dir if COLLISION with AVATAR

        

        // update its memory
        if (f - b.first >= b.memory.length) { // FORWARD off the end of the memory
            b.memory.push(animationFrameCalc(b.memory[b.memory.length - 1], b.dir, true));
        } else if (f < b.first) { // BACKWARD off the end of the memory
            b.memory.unshift(animationFrameCalc(b.memory[0], b.dir, true));
            b.first--;
        } else { // middle of memory; update time!
            if (b.memory[f - b.first + time]/* future */ !== b.memory[f - b.first]/* current */) {
                // remembered value is NOT SAME AS FUTURE VALUE!
                // set future value to what it should be now, unless it's bigger.
                if (b.memory[f - b.first + time] <= animationFrameCalc(b.memory[f - b.first], b.dir, true)) {
                    b.memory[f - b.first] = animationFrameCalc(b.memory[f - b.first], b.dir, true);
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
            //console.log(this.memory);
        }
    }
}