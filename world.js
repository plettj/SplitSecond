// AVATAR, PHYSICS, & OBSTACLES



// AVATAR

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
    },
    draw: function (a) { // a: [xOnTileset, yOnTileset]
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
    physics: function () { // physics for the avatar.
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
            this.coor[1] += this.vcoor[1];
        }
        let after = [Math.floor((this.coor[0] + pixel * 2) / unit), Math.floor((this.coor[0] + (this.box[0] + 1) * pixel) / unit), Math.floor((this.coor[1] + 2.99 * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
        
        let l = levels.levels[levels.currentLevel];
        /* On the axis you're testing, use AFTER;
           On the other axis, use BEFORE.
           WAIT THIS ALLOWS DIAGONAL CLIPS OH NO
           Solved corner clips: if (beforeSquare = 1) get OUTTA there!*/
        
        let wallCheck = !(after[3] >= height || after[2] < 0); // if you go through the top or bottom of the screen, don't throw errors!
        if (before[3] < after[3]) { // DOWN - crossed into new cell
            let onGround = false;
            if (after[3] >= 0 && wallCheck) {
                if (before[0] >= 0) if (l[after[3]][before[0]] == 1 || l[after[3]][before[0]] == 2) onGround = true;
                if (before[1] < width) if (l[after[3]][before[1]] == 1 || l[after[3]][before[1]] == 2) onGround = true;
            }
            if (onGround) {
                this.inAir = 0;
                this.vcoor[1] = 0;
                this.coor[1] = before[3] * unit;
            } else this.inAir = 1;
        } else if (before[2] > after[2]) { // UP - crossed into new cell
            let hitHead = false;
            if (after[2] < height && wallCheck) {
                if (before[0] >= 0) if (l[after[2]][before[0]] == 1) hitHead = true;
                if (before[1] < width) if (l[after[2]][before[1]] == 1) hitHead = true;
            }
            if (hitHead) {
                this.coor[1] -= this.vcoor[1];
                this.vcoor[1] = this.gravity / -2;
            }
        }
        if (before[1] < after[1] && wallCheck) { // RIGHT - crossed into new cell
            let hitWall = false;
            if (after[1] >= width) hitWall = true;
            else {
                if (before[2] >= 0) if (l[before[2]][after[1]] == 1) hitWall = true;
                if (before[3] < height) if (l[before[3]][after[1]] == 1) hitWall = true;
            }
            if (hitWall && before[0] < width - 1) {
                this.vcoor[0] = 0;
                this.coor[0] = before[1] * unit + pixel * 2.99;
            } else if (hitWall && !this.complete) { // Level Complete!
                levels.endLevel([16, before[2]]);
                this.complete = true;
                this.keys = [0, 0, 1, 0];
            }
        } else if (before[0] > after[0] && wallCheck) { // LEFT - crossed into new cell
            let hitWall = false;
            if (after[0] < 0) hitWall = true;
            else {
                if (before[2] >= 0) if (l[before[2]][after[0]] == 1) hitWall = true;
                if (before[3] < height) if (l[before[3]][after[0]] == 1) hitWall = true;
            }
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
                possible = before[this.dir];
                this.bFrame[2] = possible * unit;
                if (after[3] < height) {
                    if (l[after[3]][possible] !== 1 && l[after[3]][possible] !== 2) this.bFrame[2] = before[this.dir * -1 + 1] * unit;
                }
                this.bFrame[1] = 1;
                this.vcoor[0] = 0;
            }
            if (this.bFrame[0] + this.bFrame[1]) { // slide towards the target:
                if (this.coor[0] - this.bFrame[2] > this.vmax[0]) this.coor[0] -= this.vmax[0] / 1.6;
                else if (this.coor[0] - this.bFrame[2] < -this.vmax[0]) this.coor[0] += this.vmax[0] / 1.6;
                else this.coor[0] = this.bFrame[2];
            }
        }
        this.bFrame[0] = this.bFrame[0] + 0.15 * (this.bFrame[1] * 2 - 1);
        this.bFrame[0] = (this.bFrame[0] <= 0) ? 0 : ((this.bFrame[0] >= 2) ? 2 : this.bFrame[0]);
        
        //clear(4); // draw the squares that indicate the collision square locations.
        //this.drawTempSquares([[before[0], before[2]], [before[1], before[2]], [before[0], before[3]], [before[1], before[3]]], "#ff1515");
        //this.drawTempSquares([[after[0], after[2]], [after[1], after[2]], [after[0], after[3]], [after[1], after[3]]], "#15ffff");
        let CLIPPED = false;
        if (before[2] >= 0 && before[2] < height) if (l[before[2]][before[0]] == 1 || l[before[2]][before[1]] == 1) CLIPPED = true;
        if (before[3] >= 0 && before[3] < height) if (l[before[3]][before[0]] == 1 || l[before[3]][before[1]] == 1) CLIPPED = true;
        if (CLIPPED) {
            console.log("You've corner-clipped!!");
            //this.drawTempSquares([[Math.floor((this.coor[0] + (this.box[0] / 2 + 1) * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)]], "#1515ff", 0.9);
            let centerCo = [Math.floor((this.coor[0] + (this.box[0] / 2 + 1) * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
            if (centerCo[1] >= 0 && centerCo[1] < height) if (l[centerCo[1][0]] !== 1) if (this.vcoor[0] > 0) this.coor[0] = centerCo[0] * unit + 2 * pixel;
            else this.coor[0] = centerCo[0] * unit - 1 * pixel;
        }

        if (!this.action && Math.abs(this.vcoor[0]) < this.amax * 1.5) this.coor[0] -= this.vcoor[0];
        a = [(this.inAir) ? 0 : stepCounter % 4, this.dir + ((this.inAir || this.action == 1 || this.action == 2) ? 2 : 0)];
        if (this.bFrame[0]) { // adjust 'a' to draw block!
            a[0] = Math.floor(this.bFrame[0]) + ((this.bFrame[0] == 2) ? Math.floor(stepCounter % 6 / 3) : 0);
            a[1] = this.dir + 4;
            if (this.bFrame[0] == 2) this.coor[0] = this.bFrame[2]; // block stops at target x.
        } else if (this.keys[0] || this.keys[2]) console.log("not working properly?");

        this.draw(a);
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