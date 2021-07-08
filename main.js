// GLOBAL, INITIALIZATION, & EVENTS

// GLOBAL VARIABLES

let width = 16; // in units
let height = 12;
let unit = (Math.floor(window.innerHeight / (height + 0.5) / 4) * 4 < 50) ? Math.floor(window.innerHeight / (height + 0.5) / 4) * 4 : 50;
let pixel = unit / 10;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--width", width);
document.body.style.setProperty("--height", height);
let paused = false;
let stepCounter = 0; // animation step digit
let step = 0; // actual animation step
let stepSpeed = 8; // steps per second
let time = 1; // -1 = BACKWARDS TIME
let frame = 0; // CORE OPERATION: going up when forward, down when backward!
let GFuel = 3; // number of game frames per ghost frame (ghosts are choppier)
let nextGhost = undefined;

// INITIALIZATION

// Canvas holder
let ctx = []; // [0-background, 1-blocks, 2-objects, 3-ghosts, 4-ghostBlocks, 5-avatar]
function makeContexts(num) {
    for (let i = 0; i < num; i++) {
        let canvas = document.createElement("CANVAS");
        canvas.id = "Canvas" + i;
        canvas.width = unit * width;
        canvas.height = unit * height;
        document.body.appendChild(canvas);
        ctx.push(canvas.getContext('2d'));
    }
}
makeContexts(6);
ctx[4].globalAlpha = 0.5;

// Image holder
let img = [];
function makeImages(srcs) {
    for (let i = 0; i < srcs.length; i++) {
        let image = new Image();
        image.src = "images/" + srcs[i];
        img.push(image);
    }
}
makeImages(["BlockTileset.png", "Background.png", "AvatarTileset.png"]);

// *** Where it all starts. ***
window.onload = function () {
    levels.startLevel(0);
    ctx[0].drawImage(img[1], 0, 0, unit * width, unit * height);
    animate();
}

// To run actual frame-by-frame animation
function animate() {
	if (!paused) {
        frame += time;
        avatar.physics();
        if (!(frame % Math.round(60 / stepSpeed))) {
            stepCounter++;
            step += time;
        }
        if (!(frame % GFuel)) { // Run the Ghosts
            nextGhost.learn();
            clear(4);
            for (g in levels.ghosts) {
                levels.ghosts[g].newFrame();
            }
        }
	}
	raf = window.requestAnimationFrame(animate);
}

// EVENTS

function keyPressed(code, num) {
	if (code === 37 || code === 65) avatar.keys[0] = num; // Left
	else if (code === 38 || code === 87) avatar.keys[1] = num; // Up
	else if (code === 39 || code === 68) avatar.keys[2] = num; // Right
	else if (code === 40 || code === 83) avatar.keys[3] = num; // Down
    else if (code === 69 && num) swapTime();
}

document.addEventListener("keydown", function(event) {
	keyPressed(event.keyCode, 1);
});
document.addEventListener("keyup", function(event) {
	keyPressed(event.keyCode, 0);
});

document.addEventListener('contextmenu', event => event.preventDefault());