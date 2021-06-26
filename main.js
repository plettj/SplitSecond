// MAIN, GLOBAL, & INITIALIZATION

// Global variables
let width = 16; // in units
let height = 12;
let unit = (Math.floor(window.innerHeight / (height + 0.5) / 4) * 4 < 50) ? Math.floor(window.innerHeight / (height + 0.5) / 4) * 4 : 50;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--width", width);
document.body.style.setProperty("--height", height);
let paused = false;
let stepCounter = 0; // animation step digit
let step = 0; // actual animation step
let time = 1; // -1 = BACKWARDS TIME
let frame = 0; // CORE OPERATION: up when forward, down when backward!!!!

// Canvas holder
let ctx = [];
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
makeContexts(1);
console.log(ctx);

// Image holder
let img = [];
function makeImages(srcs) {
    for (let i = 0; i < srcs.length; i++) {
        let image = new Image();
        image.src = "images/" + srcs[i];
        img.push(image);
    }
}
makeImages(["BlockTileset.png"]);


// Game logic


// To run actual frame-by-frame animation
function animate() {
	if (!paused) {
        frame += time;
        // Stuff to run each frame goes here.
	}
	raf = window.requestAnimationFrame(animate);
}


window.onload = function () {
    levels.drawLevel(0);
    animate();
}
