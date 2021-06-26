// BLOCKS, OBJECTS, & LEVELS

var levels = {
    levels: [],
    currentLevel: 0,
    addLevel: function (values/*here I'll add parameters as additional objects are created*/) {
        this.levels.push(values);
    },
    drawLevel: function (level) {
        // draw the specified level
        for (let y = 0; y < this.levels[level].length; y++) {
            for (let x = 0; x < this.levels[level][0].length; x++) {
                switch (this.levels[level][y][x]) {
                    case 1:
                        let blocks = [0, 0, 0, 0];
                        let l = levels.levels[level];
                        if (x > 0) if (l[y][x - 1] !== 1) blocks[1] = 1;
                        if (x < this.levels[level][0].length - 1) if (l[y][x + 1] !== 1) blocks[0] = 1;
                        if (y > 0) if (l[y - 1][x] !== 1) blocks[2] = 1;
                        if (y < this.levels[level].length - 1) if (l[y + 1][x] !== 1) blocks[3] = 1;
                        /*if (y > 0 && x > 0) if (!blocks[1] && !blocks[2] && l[y - 1][x - 1] !== 1) ctx[0].drawImage(img[0], 400, 0, 100, 100, x * unit, y * unit, unit, unit);
                        if (y > 0 && x < this.levels[level][0].length - 1) if (!blocks[0] && !blocks[2] && l[y - 1][x + 1] !== 1) ctx[0].drawImage(img[0], 400, 100, 100, 100, x * unit, y * unit, unit, unit);
                        if (y < this.levels[level].length - 1 && x < this.levels[level][0].length - 1) if (!blocks[0] && !blocks[3] && l[y + 1][x + 1] !== 1) ctx[0].drawImage(img[0], 400, 200, 100, 100, x * unit, y * unit, unit, unit);
                        if (y < this.levels[level].length - 1 && x > 0) if (!blocks[1] && !blocks[3] && l[y + 1][x - 1] !== 1) ctx[0].drawImage(img[0], 400, 300, 100, 100, x * unit, y * unit, unit, unit);*/
                        ctx[0].drawImage(img[0], (blocks[1] + 2 * blocks[0]) * 100, (blocks[2] + 2 * blocks[3]) * 100, 100, 100, x * unit, y * unit, unit, unit);
                        break;
                }
            }
        }
        // draw the buttons and spikes and walls and doors
    },
    startLevel: function (level) {
        this.currentLevel = level;
        this.drawLevel(level);
        // start the specified level
    }
}

levels.addLevel([
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]);
