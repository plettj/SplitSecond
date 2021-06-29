// BLOCKS, OBJECTS, LEVELS, & GRAPHICS

function clear(context, coor = false) {
    if (!coor) ctx[context].clearRect(0, 0, ctx[context].canvas.width, ctx[context].canvas.height);
    else ctx[context].clearRect(coor[0] - unit / 20, coor[1] - unit / 20, unit * 1.1, unit * 1.1);
}

function Meteor(x, startStep) {
    this.x = x; // in pixels
    this.step = startStep;
    this.gen = Math.floor(Math.random() * 9); // cell to start animating
    this.update = function () { // draw based on the global "step"
        if (step >= this.step && step - this.step < (height * 5 + 5)) {
            ctx[2].drawImage(img[5], ((this.gen + step) % 9) * 250, 0, 250, 300, (this.x - step + this.step) * pixel, (step - this.step - 15) * pixel * 2 - pixel, unit * 2.5, unit * 3);
        } else return false;
    }
}

let background = {
    moon: [(width - 6.5) * 10, 15], // coordinates, in "pixels"
    meteors: [],
    update: function (update = true) {
        if (update) { // move the meteors and moon
            ctx[2].clearRect(0, 0, width * unit, height * unit);
            for (let i = 0; i < this.meteors.length; i++) {
                this.meteors[i].update();
            }
            // UPDATE THE MOONNNNN DON'T FORGET
        } else { // draw the whole background
            ctx[0].drawImage(img[2], 0, 0, unit * width, unit * height);
            ctx[1].drawImage(img[3], unit * (width - 6.5), unit * 1.5, unit * 4, unit * 4);
            ctx[2].clearRect(0, 0, width * unit, height * unit);
            ctx[3].clearRect(0, 0, width * unit, height * unit); // clear the moon canvas too.
            ctx[3].drawImage(img[4], 0, 0, unit * width, unit * height);
        }
    },
    addMeteor: function (x/* in units */, startStep) {
        this.meteors.push(new Meteor(x * 10, startStep));
    },
    reset: function () {
        // clear the meteor and moon canvases.
        // call this.update(false)
    }
}

let levels = {
    levels: [],
    currentLevel: 0,
    addLevel: function (values/*here I'll add parameters as additional objects are created*/) {
        this.levels.push(values);
    },
    drawLevel: function (level) { // draw the specified level
        let colour = Math.floor(Math.random() * 4);
        let next = Math.floor(Math.random() * accentStones * 2);
        for (let y = 0; y < this.levels[level].length; y++) {
            for (let x = 0; x < this.levels[level][0].length; x++) {
                switch (this.levels[level][y][x]) {
                    case 1: // normal block
                        let blocks = [0, 0, 0, 0]; // [right, left, up, down]
                        let l = levels.levels[level];
                        if (x > 0) if (l[y][x - 1] !== 1) blocks[1] = 1;
                        if (x < this.levels[level][0].length - 1) if (l[y][x + 1] !== 1) blocks[0] = 1;
                        if (y > 0) if (l[y - 1][x] !== 1) blocks[2] = 1;
                        if (y < this.levels[level].length - 1) if (l[y + 1][x] !== 1) blocks[3] = 1;
                        ctx[4].drawImage(img[0], (blocks[1] + 2 * blocks[0]) * 100, (blocks[2] + 2 * blocks[3]) * 100, 100, 100, x * unit, y * unit, unit, unit);
                        
                        if (!blocks[2] || (!blocks[0] && !blocks[3]) || !blocks[1]) {
                            if (!next) { // place accent stone
                                let params = [[400, 100, 0], [500, 100, 0], [600, 200, 1]]; // [column, width, x]
                                let possible = []; // possible kinds of accent stones
                                if (!blocks[2]) possible.push(0);
                                if ((!blocks[0] && !blocks[3])) possible.push(1);
                                if (!blocks[1]) possible.push(2);
                                let pi = Math.floor(Math.random() * possible.length); // this way, params[possible[pi]] holds the params for the drawing
                                ctx[4].drawImage(img[0], params[possible[pi]][0], (colour % 4) * 100, params[possible[pi]][1], 100, x * unit - params[possible[pi]][2] * unit, y * unit, unit * params[possible[pi]][1] / 100, unit);
                                next = Math.floor(Math.random() * accentStones * 2);
                                colour += 1;
                            } else next--;
                        }
                        break;
                    case 2: // semisolid block
                        break;
                    case 3: // avatar location
                        avatar.init([x * unit, y * unit]);
                        break;
                }
            }
        }
        // draw the buttons and spikes and walls and doors and stuff
    },
    startLevel: function (level) {
        this.currentLevel = level;
        this.drawLevel(level);
        // start the specified level
    }
}


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
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
]);

levels.addLevel([
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
