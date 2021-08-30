// GLOBAL, INITIALIZATION, & EVENTS

// GLOBAL VARIABLES
let coolMathGames = false;
let beginningLevel = 0;
let width = 16; // in units
let height = 12;
let graphics = "images"; // = "imagesTwo"; for Dahlia's
let levelsWpowers = [5, 8]; // the levels that hold powers
let powers = [false, false]; // unlocked: [swapping, blocking]
let unit = (Math.floor(window.innerHeight / (height + 0.5) / 4) * 4 < 50) ? Math.floor(window.innerHeight / (height + 0.5) / 4) * 4 : 50;
if (!coolMathGames) unit = Math.floor(window.innerHeight / (height + 0.5) / 4) * 4;
let pixel = unit / 10;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--width", width);
document.body.style.setProperty("--height", height);
let paused = false;
let swapDelay = 200; // milliseconds before you can swap time again
let stepCounter = 0; // animation step always up (counts)
let step = 0; // actual animation step (counts)
let stepSpeed = 8; // steps per second
let animationStepSpeed = 0.2; // bigger = faster
let time = 1; // -1 = BACKWARDS TIME
let frame = 0; // CORE OPERATION: going up when forward, down when backward!
let GFuel = 3; // number of game frames per ghost frame (ghosts are choppier)
let nextGhost = undefined;


setTimeout(function () {
    document.body.querySelector("#ProgressFill").classList.remove("silver");
    document.body.querySelector("#ProgressFill").classList.add("gold");
}, 3000);
// INITIALIZATION

// Canvas holder
let ctx = []; // [0-background, 1-blocks, 2-mainObjects, 3-ghosts, 4-ghostBlocks, 5-avatar, 6-frontObjects, 7-frontER_Objects(goal, items) :last:-LCanvas]
function makeContexts(num) {
    for (let i = 0; i < num; i++) {
        let canvas = document.createElement("CANVAS");
        canvas.id = "Canvas" + i;
        canvas.width = unit * width;
        canvas.height = unit * height;
        document.body.insertBefore(canvas, document.querySelector(".belowCanvases"));
        let thisCTX = canvas.getContext('2d');
        thisCTX.imageSmoothingEnabled = false;
        ctx.push(thisCTX);
    }
    let miniC = document.body.querySelector("#LCanvas");
    miniC.width = unit * width * 0.32;
    miniC.height = unit * height * 0.32;
    ctx.push(miniC.getContext('2d'));
}
makeContexts(8);
ctx[4].globalAlpha = 0.5;

// Image holder
let img = [];
function makeImages(srcs) {
    for (let i = 0; i < srcs.length; i++) {
        let image = new Image();
        image.src = graphics + "/" + srcs[i];
        img.push(image);
    }
}
makeImages(["BlockTileset.png", "Background.png", "AvatarTileset.png", "Objects.png"]);

// *** Where it all starts ***
window.onload = function () {
    score.init();
    levels.startLevel(beginningLevel);
    levels.drawLevel(beginningLevel, true);
    ctx[0].drawImage(img[1], 0, 0, unit * width, unit * height);
    startAnimating(60); // 60 fps
    setTimeout(visible, 300); // should be the length of menu animation
}

// To run actual frame-by-frame animation
var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        // actual looping code below!
        if (!paused) {
            frame += time;
            avatar.physics();
            levels.updateTime();
            if (!(frame % Math.round(60 / stepSpeed))) {
                stepCounter++;
                step += time;
            }
            if (!(frame % GFuel)) { // Run the Ghosts + Update the Level objects
                nextGhost.learn();
                clear(4);
                for (g in levels.ghosts) {
                    levels.ghosts[g].newFrame();
                }
                levels.update();
            }
        }
    }
}

// EVENTS

function keyPressed(code, num) {
    if (!paused || !num) {
        if ((code == 37 || code == 65) && !avatar.complete) avatar.keys[0] = num; // Left
        else if ((code == 38 || code == 87) && !avatar.complete) avatar.keys[1] = num; // Up
        else if ((code == 39 || code == 68) && !avatar.complete) avatar.keys[2] = num; // Right
        else if ((code == 40 || code == 83) && !avatar.complete) avatar.keys[3] = num; // Down
        else if ((code == 69 || code == 32) && num && !avatar.complete) swapTime(); // E or [Space]
        else if ((code == 80 || code == 82 || code == 27) && num) dom.key(code); // P or R or [Esc]
    } else if (num) { // keydown on menus
        dom.key(code);
    }
}

document.addEventListener("keydown", function(event) {
    let k = event.keyCode;
    if (k == 9 || k == 38 || k == 40) event.preventDefault();
    keyPressed(k, 1);
});
document.addEventListener("keyup", function(event) {
	keyPressed(event.keyCode, 0);
});

document.addEventListener("mousedown", function (e) { // stops blurring
    e.preventDefault();
    return false;
});

document.addEventListener('contextmenu', event => event.preventDefault());
