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
                        // draw a classic brick
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