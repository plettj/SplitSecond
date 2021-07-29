// DOM, MENUS, & CSS ANIMATIONS

// DOM

let dom = {
    covers: document.body.querySelectorAll(".cover"),
    levelNum: document.body.querySelector("#NextLevel"),
    levelText: document.body.querySelector(".bigText"),
    pauseTitle: document.body.querySelector("#PauseTitle"),
    pauseNum: document.body.querySelector("#CurrLevel"),
    pauseButton: document.body.querySelector("#Pause"),
    menus: [document.body.querySelector("#PauseMenu"), document.body.querySelector("#LevelsMenu"), document.body.querySelector("#SettingsMenu")],
    focuses: [document.body.querySelector(".play"), document.body.querySelector("td"), document.body.querySelector("#settingsfocustemp")],
    displayed: -1, // -1-nothing, 0-PauseMenu, 1-LevelsMenu, 2-SettingsMenu 3-LevelTransition
    newMenu: function (menu = 1) {
        //cursor.move("away");
        dom.close();
        switch (menu) {
            case 0: // Pause Menu
                dom.menus[0].classList.remove("off");
                dom.menus[0].classList.add("on");
                dom.pauseNum.textContent = levels.currentLevel + 1;
                dom.pauseButton.style.display = "none"; // PAUSE TRANSITION ANIMATION FIX
                dom.covers.forEach(function (e) {e.classList.add("on");});
                paused = true;
                setTimeout(function () {dom.focuses[0].focus();}, 0);
                //cursor.move(dom.focuses[0]);
                break;
            case 1: // Levels Menu
                dom.menus[1].classList.remove("off");
                dom.menus[1].classList.add("on");
                setTimeout(function () {dom.focuses[1].focus();}, 0);
               // cursor.move(dom.focuses[1]);
                break;
            case 2: // Settings Menu
                dom.menus[2].classList.remove("off");
                dom.menus[2].classList.add("on");
                setTimeout(function () {dom.focuses[2].focus();}, 0);
                //cursor.move(dom.focuses[2]);
                break;
        }
        dom.displayed = menu;
    },
    back: function (toPause = false) {
        if (!toPause) dom.newMenu();
        else dom.newMenu(0);
    },
    close: function () {
        [0, 1, 2].forEach(function (i) {
            dom.menus[i].classList.remove("on");
            dom.menus[i].classList.add("off");
        });
    },
    play: function (level) {
        if (level == undefined) level = levels.currentLevel;
        else if (level - 1 !== levels.currentLevel) levels.startLevel(level - 1);
        dom.close();
        dom.pauseButton.style.display = "block"; // PAUSE TRANSITION ANIMATION FIX
        dom.covers.forEach(function (e) {e.classList.remove("on");});
        paused = false;
        dom.displayed = -1;
        //cursor.move("away");
    },
    newLevel: function (nextL = false) {
        if (nextL) {
            dom.levelNum.textContent = levels.currentLevel + 2;
            dom.covers.forEach(function (e) {e.classList.add("on");});
            dom.levelText.classList.add("on");
            dom.pauseButton.style.display = "none"; // PAUSE TRANSITION ANIMATION FIX
            dom.displayed = 3;
        } else {
            dom.covers.forEach(function (e) {e.classList.remove("on");});
            dom.levelText.classList.remove("on");
            dom.pauseButton.style.display = "block"; // PAUSE TRANSITION ANIMATION FIX
            dom.displayed = -1;
        }
    },
    key: function (code) {
        let element = document.body.querySelector(":focus");
        if (code == 82 && dom.displayed == -1) { // R
            levels.startLevel(levels.currentLevel);
        } else if (code == 80 && dom.displayed == -1) { // P
            dom.newMenu(0);
        } else if (code == 37 || code == 65) { // left
            if (dom.displayed == 1) {
                // let's deal with the level select menu later.
            }
        } else if (code == 38 || code == 87) { // Up
            if (dom.displayed == 0 || dom.displayed == 2) {
                if (element.previousElementSibling.matches("[tabindex='0']")) element.previousElementSibling.focus();
                else element.parentElement.querySelector(":scope > [tabindex='0']:last-child").focus();
            } else {
                // let's deal with the level select menu later.
            }
        } else if (code == 39 || code == 68) { // Right
            if (dom.displayed == 1) {
                // let's deal with the level select menu later.
            }
        } else if (code == 40 || code == 83) { // Down
            if (dom.displayed == 0 || dom.displayed == 2) {
                if (element.nextElementSibling != null) element.nextElementSibling.focus();
                else element.parentElement.querySelector(":scope > [tabindex='0']").focus();
            } else {
                // let's deal with the level select menu later.
            }
        } else if (code == 32 || code == 13) { // [Space] or [Enter]
            element.click();
        }
    },
    restart: function () {
        dom.play();
        levels.startLevel(levels.currentLevel);
    }
}

function visible() {
    document.body.querySelectorAll(".menu").forEach(function (e) {e.style.visibility = "visible";});
}

/*
let cursor = {
    pixel: pixel / 1.5,
    dom: document.body.querySelector("#Cursor"),
    cover: "",
    showing: false,
    move: function (element) {
        if (element === "away") {
            document.body.style.setProperty("--cd", "none");
            this.showing = false;
        } else {
            setTimeout(function () {
                document.body.style.setProperty("--cd", "block");
                document.body.style.setProperty("--cx", (window.scrollX + element.getBoundingClientRect().left - cursor.pixel) + "px");
                document.body.style.setProperty("--cy", (window.scrollY + element.getBoundingClientRect().top - cursor.pixel * 2) + "px");
                document.body.style.setProperty("--cw", (element.clientWidth + cursor.pixel * 4) + "px"); // these 4's should be changed to 2's if spacing is too large.
                document.body.style.setProperty("--ch", (element.clientHeight + cursor.pixel * 4) + "px");
                cursor.cover = element;
                if (!cursor.showing) {
                    cursor.showing = true;
                    cursor.update(0);
                }
            }, 400);
        }
    },
    update: function (frame) {
        if (!this.showing) return;
        if (frame) {
            document.body.style.setProperty("--cy", (window.scrollY + cursor.cover.getBoundingClientRect().top - this.pixel) + "px");
            document.body.style.setProperty("--ch", (cursor.cover.clientHeight + this.pixel * 2) + "px");
        } else {
            document.body.style.setProperty("--cy", (window.scrollY + cursor.cover.getBoundingClientRect().top - this.pixel * 2) + "px");
            document.body.style.setProperty("--ch", (cursor.cover.clientHeight + this.pixel * 4) + "px");
        }
        console.log("Cursor frame!");
        setTimeout(function () {cursor.update(frame * -1 + 1);}, 550);
    },
    over: function () {
        console.log("hovered over the cursor.");
    },
    click: function () {
        console.log("clicked on the cursor.");
    }
}

document.body.style.setProperty("--cp", cursor.pixel + "px");
cursor.move("away");
*/

