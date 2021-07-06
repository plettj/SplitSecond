// AVATAR, PHYSICS, & OBSTACLES



// AVATAR

let avatar = {
    coor: [0, 0], // in ACTUAL computer pixels
    box: [7, 7], // 1 game pixel from left, 2 from top.
    keys: [0, 0, 0, 0], // [A, W, D, S] 1 = pressed.
    action: 0, // 0-still 1-left 2-right 3-block
    dir: 1, // 0-left 1-right
    inAir: 0, // 0-grounded 1-in air
    vcoor: [0, 0], // velocity of the avatar
    vmax: [pixel, pixel * 2], // max velocity: [x, y];
    amax: 1 / 7 * pixel, // max acceleration: [ground, air].
    gravity: 1 / 6 * pixel,
    jump: 1 / 3.6 * unit, // jump speed.
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
        if (this.inAir) this.vcoor[1] += this.gravity;
        this.coor[0] += this.vcoor[0];
        this.coor[1] += this.vcoor[1];

        let key = [(!this.keys[3]) ? this.keys[2] - this.keys[0] : 0, (this.keys[3] > this.keys[1]) ? -1 : this.keys[1]]; // [x, y] values: -1, 0, 1
        if (key[0]) {
            this.dir = (key[0] + 1) / 2;
            if (key[1] >= 0) this.action = (key[0] + 1) / 2 + 1;
            else this.action = 0;
        } else this.action = 0;
        if (!this.inAir && key[1] < 0) this.action = 3;
        if (!this.inAir && key[1] > 0) {
            this.vcoor[1] -= this.jump;
            this.inAir = 1;
        }
        // [[xleft, xright], [ytop, ybottom]]
        let temp = [[Math.floor((this.coor[0] + pixel) / unit), Math.floor((this.coor[0] + (this.box[0] + 1) * pixel) / unit)], [Math.floor((this.coor[1] + 2.9 * pixel) / unit), Math.floor((this.coor[1] + (this.box[1] + 2.9) * pixel) / unit)]];
        let l = levels.levels[levels.currentLevel];
        // check if in-air (bottom collisions)
        if (temp[1][1] < height) { // not on the bottom of the screen
            let onGround = false;
            if (temp[0][0] >= 0) if (l[temp[1][1]][temp[0][0]] == 1 || l[temp[1][1]][temp[0][0]] == 2) onGround = true;
            if (temp[0][1] < width) if (l[temp[1][1]][temp[0][1]] == 1 || l[temp[1][1]][temp[0][1]] == 2) onGround = true;
            if (onGround && this.vcoor[1] >= 0) {
                this.inAir = 0;
                this.vcoor[1] = 0;
                this.coor[1] = (temp[1][1] - 1) * unit;
            } else this.inAir = 1;
        } else {
            // set timeout to die from falling in a pit.
        }

        // check if

        
        
        if (this.action == 1 || this.action == 2) {
            this.vcoor[0] += (this.action * 2 - 3) * this.amax / (this.inAir + 1);
            if (Math.abs(this.vcoor[0]) > this.vmax[0]) this.vcoor[0] -= (this.action * 2 - 3) * this.amax / (this.inAir + 1);
        } else if (!this.action) {
            this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.amax / (this.inAir + 1));
        }

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