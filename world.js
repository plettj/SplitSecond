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
    complete: false,
    init: function (coor) {
        this.keys = [0, 0, 0, 0];
        this.complete = false;
        this.coor = coor;
        this.dir = 1;
        this.vcoor = [0, 0];
        this.draw();
    },
    draw: function (a = [1, this.dir]) { // a: [xOnTileset, yOnTileset]
        ctx[5].drawImage(img[2], a[0] * 100, a[1] * 100, 100, 100, Math.round(this.coor[0]), Math.round(this.coor[1]), unit, unit);
    },
    drawTempSquares: function (squares, colour, opacity = 0.3) {
        ctx[4].beginPath();
        ctx[4].globalAlpha = opacity;
        ctx[4].fillStyle = colour;
        for (let i = 0; i < squares.length; i++) {
            ctx[4].fillRect(squares[i][0] * unit, squares[i][1] * unit, unit, unit);
        }
        //ctx[4].stroke();
    },
    physics: function () { // PHYSICS
        clear(5, this.coor);
        let key = [((!this.keys[3] || this.keys[1]) && !this.bFrame[1]) ? this.keys[2] - this.keys[0] : 0, (this.keys[3] > this.keys[1]) ? -1 : this.keys[1]]; // [x, y] values: -1, 0, 1
        
        // [Xleft, Xright, Ytop, Ybottom]
        let before = [Math.floor((this.coor[0] + pixel * 2) / unit), Math.floor((this.coor[0] + (this.box[0] + 1) * pixel) / unit), Math.floor((this.coor[1] + 2.99 * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
        if (!key[0]) this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.amax / (this.inAir + 1));
        this.vcoor[0] += key[0] * this.amax / (this.inAir + 1);
        this.vcoor[1] += this.gravity;
        for (let i = 0; i < 2; i++) if (Math.abs(this.vcoor[i]) > this.vmax[i]) this.vcoor[i] = Math.sign(this.vcoor[i]) * this.vmax[i];
        if (!this.bFrame[0]) { // if NOT in block, move horizontally.
            this.coor[0] += this.vcoor[0];
        }
        this.coor[1] += this.vcoor[1];
        let after = [Math.floor((this.coor[0] + pixel * 2) / unit), Math.floor((this.coor[0] + (this.box[0] + 1) * pixel) / unit), Math.floor((this.coor[1] + 2.99 * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
        
        let l = levels.levels[levels.currentLevel];
        
        if (before[3] < after[3]) { // DOWN - crossed into new cell
            onGround = (isS([before[0], after[3]]) || isS([before[1], after[3]]));
            if (onGround) {
                this.inAir = 0;
                this.vcoor[1] = 0;
                this.coor[1] = before[3] * unit;
            } else this.inAir = 1;
        } else if (before[2] > after[2]) { // UP - crossed into new cell
            hitHead = (isS([before[0], after[2]], true) || isS([before[1], after[2]], true));
            if (hitHead) {
                this.coor[1] -= this.vcoor[1];
                this.vcoor[1] = this.gravity / -2;
            }
        }
        if (before[1] < after[1]) { // RIGHT - crossed into new cell
            hitWall = (isS([after[1], before[2]], true) || isS([after[1], before[3]], true));
            if (hitWall && before[0] < width - 1) {
                this.vcoor[0] = 0;
                this.coor[0] = before[1] * unit + pixel * 2.99;
            } else if (hitWall && !this.complete) { // Level Complete!
                levels.endLevel([width, before[2]]);
                this.complete = true;
                this.keys = [0, 0, 1, 0];
            }
        } else if (before[0] > after[0]) { // LEFT - crossed into new cell
            hitWall = (isS([after[0], before[2]], true) || isS([after[0], before[3]], true));
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
            } else if (key[1] < 0 && !this.bFrame[1]) { // DOWN
                if (!(isS([before[0], after[2]]) || isS([before[1] / unit, after[2]])) && before[2] >= 0) { // not standing in DinoBlocks
                    if (isS([before[0], after[2]])) { // left is a DinoBlock
                        if (isS([before[1], after[3]])) { // right below is solid
                            this.bFrame[2] = before[1] * unit;
                            this.bFrame[1] = 1;
                            this.vcoor[0] = 0;
                        }
                    } else if (isS([before[1], after[2]])) { // right is a DinoBlock
                        if (isS([before[0], after[3]])) { // left below is solid
                            this.bFrame[2] = before[0] * unit;
                            this.bFrame[1] = 1;
                            this.vcoor[0] = 0;
                        }
                    } else {
                        this.bFrame[2] = (!isS([before[this.dir], after[3]])) ? before[this.dir * -1 + 1] * unit : before[this.dir] * unit;
                        this.bFrame[1] = 1;
                        this.vcoor[0] = 0;
                    }
                }
            }
            if (this.bFrame[0] + this.bFrame[1]) { // slide towards the target:
                if (this.coor[0] - this.bFrame[2] > this.vmax[0]) this.coor[0] -= this.vmax[0] / 1.6;
                else if (this.coor[0] - this.bFrame[2] < -this.vmax[0]) this.coor[0] += this.vmax[0] / 1.6;
                else this.coor[0] = this.bFrame[2];
            }
        } else if (this.bFrame[0]) this.bFrame[1] = 0;
        this.bFrame[0] = this.bFrame[0] + 0.15 * (this.bFrame[1] * 2 - 1);
        this.bFrame[0] = (this.bFrame[0] <= 0) ? 0 : ((this.bFrame[0] >= 2) ? 2 : this.bFrame[0]);

        
        //clear(4); // draw the squares that indicate the collision square locations.
        //this.drawTempSquares([[before[0], before[2]], [before[1], before[2]], [before[0], before[3]], [before[1], before[3]]], "#ff1515");
        //this.drawTempSquares([[after[0], after[2]], [after[1], after[2]], [after[0], after[3]], [after[1], after[3]]], "#15ffff");
        
        //let CLIPPED = XOR([isS([before[0], before[2]], true, false), isS([before[1], before[2]], true, false), isS([before[0], before[3]], true, false), isS([before[1], before[3]], true, false)]);
        
        //let CLIPPED = false;
        //if (before[2] >= 0 && before[2] < height) if (l[before[2]][before[0]] == 1 || l[before[2]][before[1]] == 1) CLIPPED = true;
        //if (before[3] >= 0 && before[3] < height) if (l[before[3]][before[0]] == 1 || l[before[3]][before[1]] == 1) CLIPPED = true;
        if (XOR([isS([before[0], before[2]], true, false), isS([before[1], before[2]], true, false), isS([before[0], before[3]], true, false), isS([before[1], before[3]], true, false)])) {
            console.log("You've corner-clipped!!");
            //this.drawTempSquares([[Math.floor((this.coor[0] + (this.box[0] / 2 + 1) * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)]], "#1515ff", 0.9);
            let centerCo = [Math.floor((this.coor[0] + (this.box[0] / 2 + 1) * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
            if (!isS([centerCo[0], centerCo[1]], true)) if (this.vcoor[0] > 0) this.coor[0] = centerCo[0] * unit + 2 * pixel;
            else this.coor[0] = centerCo[0] * unit - 1 * pixel;
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
                levels.levels[levels.currentLevel][Math.floor(f[1] / unit)][Math.floor(f[0] / unit)] = 1.5;
            }
        }
        ctx[4].drawImage(img[2], a[0] * 100, a[1] * 100, 100, 100, f[0], f[1], unit, unit);
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

function swapTime() {
    time *= -1;
    nextGhost.finish();
    levels.ghosts.push(nextGhost);
    nextGhost = new Ghost();
}

// OBSTACLES

// BUTTON

