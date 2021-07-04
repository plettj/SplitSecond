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
let accentStones = 14; // average number of blocks until an accent stone is added.
let stepCounter = 0; // animation step digit
let step = 0; // actual animation step
let stepSpeed = 7; // 6 steps per second
let time = 1; // -1 = BACKWARDS TIME
let frame = 0; // CORE OPERATION: going up when forward, down when backward!

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

// Image holder
let img = [];
function makeImages(srcs) {
    for (let i = 0; i < srcs.length; i++) {
        let image = new Image();
        image.src = "images/" + srcs[i];
        img.push(image);
    }
}
makeImages(["BlockTileset.png", "Background.png"]);

// *** Where it all starts. ***
window.onload = function () {
    levels.drawLevel(0);
    ctx[0].drawImage(img[1], 0, 0, unit * width, unit * height);
    animate();
}

// To run actual frame-by-frame animation
function animate() {
	if (!paused) {
        avatar.physics();
        frame += time;
        if (!(frame % Math.round(60 / stepSpeed))) {
            stepCounter++;
            step += time;
        }
        // Normal stuff that runs each frame goes here.
	}
	raf = window.requestAnimationFrame(animate);
}

// EVENTS

function keyPressed(code, num) {
    if (code > 36 && code < 41) avatar.keys[code - 37] = num;
	else if (code === 65) avatar.keys[0] = num; // Left
	else if (code === 87 || code === 32) avatar.keys[1] = num; // Up
	else if (code === 68) avatar.keys[2] = num; // Right
	else if (code === 83) avatar.keys[3] = num; // Down
    else if ((code === 69 || code === 32) && num) swapTime();
}

document.addEventListener("keydown", function(event) {
	keyPressed(event.keyCode, 1);
});
document.addEventListener("keyup", function(event) {
	keyPressed(event.keyCode, 0);
});

document.addEventListener('contextmenu', event => event.preventDefault());