// AVATAR, PHYSICS, & OBSTACLES



// AVATAR

let avatar = {
    coor: [0, 0], // in ACTUAL computer pixels
    keys: [0, 0, 0, 0], // [A, W, D, S] 1 = pressed.
    //action: 0, // 0-still 1-left 2-right 3-jump 4-block
    dir: 1, // 0-left 1-right
    vcoor: [0, 0], // velocity of the avatar
    vmax: [pixel, pixel * 2], // max velocity: [x, y];
    amax: [1 / 7 * pixel, 1 / 12 * pixel], // max acceleration: [ground, air].
    jump: 1 / 3 * unit, // jump speed.
    init: function (coor) {
        this.coor = coor;
        this.dir = 1;
        this.vcoor = [0, 0];
    },
    draw: function (a) { // a: [xOnTileset, yOnTileset]
        //ctx[7].drawImage(img[1], a[0] * 100, a[1] * 100, 100, 100, this.coor[0], this.coor[1], unit, unit);
    },
    physics: function () { // physics for the avatar.
        clear(5, this.coor);

        // left or right always happens, unless down.
        // up always happens.
        // down always happens, unless up.
        if (this.keys[0] !== this.keys[2]) {
            if (this.keys[0]) {this.action = 1; this.dir = 0;} // LEFT
            else {this.action = 2; this.dir = 1;} // RIGHT
        } else if (this.keys[1] == this.keys[3]) this.action = 0;
        /*if (this.keys[1] !== this.keys[3]) {
            if (this.keys[1]) this.action = 3; // UP
            else this.action = 4; // DOWN
        } else if (this.keys[0] == this.keys[2]) this.action = 0;*/

        if (this.action == 1 || this.action == 2) {
            this.vcoor[0] += (this.action * 2 - 3) * this.amax[0];
            if (Math.abs(this.vcoor[0]) > this.vmax[0]) this.vcoor[0] -= (this.action * 2 - 3) * this.amax[0];
        } else if (!this.action) {
            this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.amax[0]);
        }

        this.coor[0] += this.vcoor[0];
        this.coor[1] += this.vcoor[1];

        this.draw([stepCounter % 4, this.dir + ((this.action == 1 || this.action == 2) ? 2 : 0)]);
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