// AVATAR, PHYSICS, & OBSTACLES



// AVATAR

let avatar = {
    coor: [0, 0], // in ACTUAL computer pixels
    box: [7, 7], // 1 game pixel from left, 2 from top
    keys: [0, 0, 0, 0], // [A, W, D, S] 1 = pressed
    action: 0, // 0-still 1-left 2-right 3-block
    dir: 1, // 0-left 1-right
    inAir: 0, // 0-grounded 1-in air
    vcoor: [0, 0], // velocity of the avatar
    vmax: [pixel * 1.2, 1 / 3.25 * unit], // max velocity: [x, y]
    amax: 1 / 7 * pixel, // max acceleration
    gravity: 1 / 5 * pixel,
    jump: 1 / 3.25 * unit, // jump speed.
    init: function (coor) {
        this.coor = coor;
        this.dir = 1;
        this.vcoor = [0, 0];
    },
    draw: function (a) { // a: [xOnTileset, yOnTileset]
        ctx[5].drawImage(img[2], a[0] * 100, a[1] * 100, 100, 100, Math.round(this.coor[0]), Math.round(this.coor[1]), unit, unit);
    },
    drawTempSquares: function (squares) {
        ctx[4].beginPath();
        for (let i = 0; i < squares.length; i++) {
            ctx[4].rect(squares[i][0] * unit, squares[i][1] * unit, unit, unit);
        }
        ctx[4].stroke();
    },
    physics: function () { // physics for the avatar.
        clear(5, this.coor);
        let key = [(!this.keys[3]) ? this.keys[2] - this.keys[0] : 0, (this.keys[3] > this.keys[1]) ? -1 : this.keys[1]]; // [x, y] values: -1, 0, 1
        
        // [Xleft, Xright, Ytop, Ybottom]
        let before = [Math.floor((this.coor[0] + pixel) / unit), Math.floor((this.coor[0] + (this.box[0] + 1) * pixel) / unit), Math.floor((this.coor[1] + 2.99 * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
        if (!key[0]) this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.amax / (this.inAir + 1));
        this.vcoor[0] += key[0] * this.amax / (this.inAir + 1);
        this.vcoor[1] += this.gravity;
        for (let i = 0; i < 2; i++) if (Math.abs(this.vcoor[i]) > this.vmax[i]) this.vcoor[i] = Math.sign(this.vcoor[i]) * this.vmax[i];
        this.coor[0] += this.vcoor[0];
        this.coor[1] += this.vcoor[1];
        let after = [Math.floor((this.coor[0] + pixel) / unit), Math.floor((this.coor[0] + (this.box[0] + 1) * pixel) / unit), Math.floor((this.coor[1] + 2.99 * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.99) * pixel) / unit)];
        
        let l = levels.levels[levels.currentLevel];
        /* On the axis you're testing, use AFTER;
           On the other axis, use BEFORE.
           WAIT THIS ALLOWS DIAGONAL CLIPS OH NO */
        
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
                this.vcoor[1] = this.gravity / -2;
                this.coor[1] = before[3] * unit - 2.49 * pixel;
            }
        }
        if (before[1] < after[1] && wallCheck) { // RIGHT - crossed into new cell
            let hitWall = false;
            if (after[1] >= width) hitWall = true;
            else {
                if (before[2] >= 0) if (l[before[2]][after[1]] == 1) hitWall = true;
                if (before[3] < height) if (l[before[3]][after[1]] == 1) hitWall = true;
            }
            if (hitWall) {
                this.vcoor[0] = 0;
                this.coor[0] = before[1] * unit + pixel * 1.99;
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
                this.coor[0] = before[0] * unit - pixel * 0.99;
            }
        }

        if (key[0]) {
            this.dir = (key[0] + 1) / 2;
            if (key[1] >= 0) this.action = (key[0] + 1) / 2 + 1;
            else this.action = 0;
        } else this.action = 0;
        if (!this.inAir && key[1] < 0) this.action = 3;
        if (!this.inAir && key[1] > 0) { // JUMP
            let hitHead = false;
            /*if (after[2] < height && after[2] > 0 && wallCheck) {
                if (before[0] >= 0) if (l[after[2] - 1][before[0]] == 1) hitHead = true;
                if (before[1] < width) if (l[after[2] - 1][before[1]] == 1) hitHead = true;
            } // ISSUE: repeated jump underneath block */
            if (!hitHead) {
                this.vcoor[1] -= this.jump;
                this.inAir = 1;
            }
        }

        if (!this.action && Math.abs(this.vcoor[0]) < this.vmax[0] / 4) this.coor[0] -= this.vcoor[0];
        this.draw([(this.inAir) ? 0 : stepCounter % 4, this.dir + ((this.inAir || this.action == 1 || this.action == 2) ? 2 : 0)]);
    }
}

// PHYSICS

function swapTime() {
    time *= -1;
    /*
    nextGhost.finish();
    levels.ghosts.push(nextGhost);
    nextGhost = new Ghost();
    nextGhost.init();
    */
}