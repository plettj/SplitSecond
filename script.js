// DOM, MENUS, & CSS ANIMATIONS

// DOM

let dom = {
    covers: document.body.querySelectorAll(".cover"),
    levelNum: document.body.querySelector("#NextLevel"),
    levelText: document.body.querySelector(".bigText"),
    pauseButton: document.body.querySelector("#Pause"),
    menus: [document.body.querySelector("#PauseMenu"), document.body.querySelector("#LevelsMenu")],
    displayed: -1, // -1-nothing, 0-PauseMenu, 1-LevelsMenu, 2-LevelTransition
    newLevel: function (next = false) {
        if (next) {
            dom.levelNum.textContent = levels.currentLevel + 2;
            dom.covers.forEach(function (e) {e.classList.add("on");});
            dom.levelText.classList.add("on");
            dom.displayed = 2;
        } else {
            dom.covers.forEach(function (e) {e.classList.remove("on");});
            dom.levelText.classList.remove("on");
            dom.displayed = -1;
        }
    },
    key: function (code) {
        if (code == 80 || code == 13) { // P or [enter]
            if (this.displayed == 0) menuBack(true); // Play button
            else if (code == 80) fade('in', 'Pause Menu'); // Pause button
        } else if (code == 82) { // R
            if (this.displayed !== 1 && document.body.querySelector(".restart").style.display == "block") restart();
        } else if (code == 76) { // L
            if (this.displayed == 0) fade('in', 'Levels Menu');
        }
    }
}
function fade(direction, type = "Next Level") {
    switch (type) {
        case "Pause Menu":
            if (direction == "in") {
                document.body.querySelector("#PauseMenu").classList.remove("off");
                document.body.querySelector("#PauseMenu").classList.add("on");
                document.body.querySelector("#Pause").style.display = "none";
                document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.add("on");});
                document.body.querySelector(".restart").style.display = "block";
                document.body.querySelector("#PauseTitle").textContent = "Paused";
                paused = true;
                dom.displayed = 0;
            } else {
                document.body.querySelector("#PauseMenu").classList.remove("on");
                document.body.querySelector("#PauseMenu").classList.add("off");
                document.body.querySelector("#Pause").style.display = "block";
                document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.remove("on");});
                paused = false;
                dom.displayed = -1;
            }
            break;
        case "Levels Menu":
            if (direction == "in") {
                document.body.querySelector("#LevelsMenu").classList.remove("off");
                document.body.querySelector("#LevelsMenu").classList.add("on");
                document.body.querySelector("#PauseMenu").classList.remove("on");
                document.body.querySelector("#PauseMenu").classList.add("off");
                dom.displayed = 1;
            } else {
                document.body.querySelector("#LevelsMenu").classList.remove("on");
                document.body.querySelector("#LevelsMenu").classList.add("off");
                document.body.querySelector("#PauseMenu").classList.remove("off");
                document.body.querySelector("#PauseMenu").classList.add("on");
                dom.displayed = -1;
            }
            break;
    }
}
function visible() {
    document.body.querySelectorAll(".menu").forEach(function (e) {e.style.visibility = "visible";});
}

function menuBack(everything = false) {
    // here I'll have the logic for which menu you ought to be taken to
    if (!everything && document.body.querySelector("#PauseTitle").textContent !== "Paused" && dom.displayed !== 1) {
        fade("in", "Levels Menu");
    } else {
        fade('out', 'Levels Menu');
        fade('out', 'Pause Menu');
    }
}

function restart() {
    fade('out', 'Pause Menu');
    levels.startLevel(levels.currentLevel);
}

function tryLevel(level) {
    levels.startLevel(level - 1);
    menuBack();
    fade("in", "Pause Menu");
    document.body.querySelector(".restart").style.display = "none";
    document.body.querySelector("#PauseTitle").textContent = "Level " + level;
}