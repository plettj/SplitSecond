// Global variables
let width = 16; // in units
let height = 12;
let unit = Math.floor(window.innerHeight / (height + 0.5) / 4) * 4;
document.body.style.setProperty("--unit", unit + "px");
document.body.style.setProperty("--width", width);
document.body.style.setProperty("--height", height);

// Canvas holder
let ctx = [];

function canvasInit(num) {
    for (let i = 0; i < num; i++) {
        let canvas = document.createElement("CANVAS");
        canvas.id = "Canvas" + i;
        canvas.width = unit * width;
        canvas.height = unit * height;
        document.body.appendChild(canvas);
        ctx.push(canvas.getContext('2d'));
    }
}
canvasInit(3);


// Game logic
var paused = false;


// To run actual frame-by-frame animation
function animate() {
	if (!paused) {
        // Stuff to run each frame goes here.
	}
	raf = window.requestAnimationFrame(animate);
}

animate();
