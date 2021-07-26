// DOM, MENUS, & CSS ANIMATIONS

// DOM

let dom = {
    covers: document.body.querySelectorAll(".cover"),
    levelNum: document.body.querySelector("#NextLevel"),
    levelText: document.body.querySelector(".bigText"),
    pauseTitle: document.body.querySelector("#PauseTitle"),
    pauseButton: document.body.querySelector("#Pause"),
    restartButton: document.body.querySelector(".restart"),
    menus: [document.body.querySelector("#PauseMenu"), document.body.querySelector("#LevelsMenu"), document.body.querySelector("#SettingsMenu")],
    displayed: -1, // -1-nothing, 0-PauseMenu, 1-LevelsMenu, 2-SettingsMenu 3-LevelTransition
    newLevel: function (next = false) {
        if (next) {
            dom.levelNum.textContent = levels.currentLevel + 2;
            dom.covers.forEach(function (e) {e.classList.add("on");});
            dom.levelText.classList.add("on");
            dom.pauseButton.style.display = "none";
            dom.displayed = 3;
        } else {
            dom.covers.forEach(function (e) {e.classList.remove("on");});
            dom.levelText.classList.remove("on");
            dom.pauseButton.style.display = "block";
            dom.displayed = -1;
        }
    },
    key: function (code) {
        if (code == 80 || code == 13) { // P or [enter]
            if (this.displayed == 0) dom.back(true); // Play button
            else if (code == 80) dom.pause(); // Pause button
        } else if (code == 82) { // R
            if (this.displayed !== 1) dom.restart();
        } else if (code == 76) { // L
            if (this.displayed == 0) dom.levels();
        }
    },
    pause: function (pause = true) {
        if (pause) {
            dom.menus[0].classList.remove("off");
            dom.menus[0].classList.add("on");
            dom.pauseButton.style.display = "none";
            dom.covers.forEach(function (e) {e.classList.add("on");});
            dom.restartButton.style.display = "block";
            dom.pauseTitle.textContent = "Paused";
            paused = true;
            dom.displayed = 0;
        } else { // close pause menu
            dom.menus[0].classList.remove("on");
            dom.menus[0].classList.add("off");
            dom.pauseButton.style.display = "block";
            dom.covers.forEach(function (e) {e.classList.remove("on");});
            paused = false;
            dom.displayed = -1;
        }
    },
    levels: function (enter = true) {
        if (enter) {
            dom.menus[1].classList.remove("off");
            dom.menus[1].classList.add("on");
            dom.menus[0].classList.remove("on");
            dom.menus[0].classList.add("off");
            dom.displayed = 1;
        } else { // close levels menu
            dom.menus[1].classList.remove("on");
            dom.menus[1].classList.add("off");
            dom.menus[0].classList.remove("off");
            dom.menus[0].classList.add("on");
            dom.displayed = -1;
        }
    },
    settings: function (enter = true) {
        if (enter) {
            dom.menus[2].classList.remove("off");
            dom.menus[2].classList.add("on");
            dom.levels(false);
            dom.menus[0].classList.remove("on");
            dom.menus[0].classList.add("off");
            dom.displayed = 2;
        } else { // close levels menu
            dom.menus[2].classList.remove("on");
            dom.menus[2].classList.add("off");
            dom.back();
        }
    },
    back: function (fully = false) {
        if (!fully && dom.displayed !== 1 && dom.pauseTitle.textContent !== "Paused") { // level inspect menu
            dom.levels();
        } else {
            dom.levels(false);
            dom.pause(false);
        }
    },
    restart: function () {
        dom.back(true);
        levels.startLevel(levels.currentLevel);
    },
    tryLevel: function (level) {
        levels.startLevel(level - 1);
        dom.back();
        dom.pause();
        dom.restartButton.style.display = "none";
        dom.pauseTitle.textContent = "Level " + level;
    }
}


function visible() {
    document.body.querySelectorAll(".menu").forEach(function (e) {e.style.visibility = "visible";});
}
