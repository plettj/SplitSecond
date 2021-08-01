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
    focuses: [document.body.querySelector(".play"), "Dynamically chooses the current level.", document.body.querySelector("#settingsfocustemp")],
    displayed: -1, // -1-nothing, 0-PauseMenu, 1-LevelsMenu, 2-SettingsMenu 3-LevelTransition
    newMenu: function (menu = 1) {
        dom.close();
        switch (menu) {
            case 0: // Pause Menu
                dom.menus[0].classList.remove("off");
                dom.menus[0].classList.add("on");
                dom.pauseNum.textContent = levels.currentLevel + 1;
                dom.pauseButton.style.display = "none"; // PAUSE TRANSITION ANIMATION FIX
                dom.covers.forEach(function (e) {e.classList.add("on");});
                paused = true;
                setTimeout(function () {
                    if (document.body.querySelector(":focus") != null) document.body.querySelector(":focus").blur();
                    dom.focuses[0].focus();
                }, 0);
                break;
            case 1: // Levels Menu
                dom.menus[1].classList.remove("off");
                dom.menus[1].classList.add("on");
                setTimeout(function () {
                    document.body.querySelectorAll("td")[levels.currentLevel].focus();
                    dom.updateSide();
                }, 0);
                break;
            case 2: // Settings Menu
                dom.menus[2].classList.remove("off");
                dom.menus[2].classList.add("on");
                setTimeout(function () {dom.focuses[2].focus();}, 0);
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
        if (level > levels.levels.length) return;
        else if (level == undefined) level = levels.currentLevel;
        else if (level - 1 !== levels.currentLevel) levels.startLevel(level - 1);
        dom.close();
        dom.pauseButton.style.display = "block"; // PAUSE TRANSITION ANIMATION FIX
        dom.covers.forEach(function (e) {e.classList.remove("on");});
        paused = false;
        dom.displayed = -1;
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
            console.log("R!");
            levels.startLevel(levels.currentLevel);
        } else if (code == 80 && dom.displayed == -1) { // P
            console.log("P!");
            dom.newMenu(0);
        } else if (code == 37 || code == 65) { // left
            if (dom.displayed == 1) {
                if (element.previousElementSibling != null) {
                    if (element.previousElementSibling.matches("[tabindex='0']:not(.locked)")) {
                        element.previousElementSibling.focus();
                        dom.updateSide();
                        return;
                    }
                }
                let list = element.parentElement.querySelectorAll(":scope > [tabindex='0']:not(.locked)");
                list[list.length - 1].focus();
                dom.updateSide();
            } else if (dom.displayed == 2) {
                // settings menu left button...
            }
        } else if (code == 38 || code == 87) { // Up
            if (dom.displayed == 0 || dom.displayed == 2) {
                if (element.previousElementSibling.matches("[tabindex='0']")) element.previousElementSibling.focus();
                else element.parentElement.querySelector(":scope > [tabindex='0']:last-child").focus();
            } else if (dom.displayed == 1) {
                if (element.matches(".back") || element.matches(".settings")) return;
                let col = Array.from(element.parentElement.children).indexOf(element);
                let row = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);
                if (row == 0) {
                    if (col < 2) {
                        document.body.querySelector("#LevelsMenu .content .settings").focus();
                    } else {
                        document.body.querySelector("#LevelsMenu .content .back").focus();
                    }
                    dom.updateSide();
                } else {
                    let newRow = element.parentElement.parentElement.querySelectorAll("tr")[row - 1];
                    let list = newRow.querySelectorAll(":scope > [tabindex='0']:not(.locked)");
                    if (list[col] != null) {
                        list[col].focus();
                    } else {
                        list[list.length - 1].focus();
                    }
                    dom.updateSide();
                }
            }
        } else if (code == 39 || code == 68) { // Right
            if (dom.displayed == 1) {
                if (element.nextElementSibling != null) {
                    if (element.nextElementSibling.matches("[tabindex='0']:not(.locked)")) {
                        element.nextElementSibling.focus();
                        dom.updateSide();
                        return;
                    }
                }
                let list = element.parentElement.querySelectorAll(":scope > [tabindex='0']:not(.locked)")[0].focus();
                dom.updateSide();
            } else if (dom.displayed == 2) {
                // settings menu right button...
            }
        } else if (code == 40 || code == 83) { // Down
            if (dom.displayed == 0 || dom.displayed == 2) {
                if (element.nextElementSibling != null) element.nextElementSibling.focus();
                else element.parentElement.querySelector(":scope > [tabindex='0']").focus();
            } else if (dom.displayed == 1) {
                if (element.matches(".settings")) {
                    document.body.querySelector("#Select td:not(.locked)").focus();
                    dom.updateSide();
                } else if (element.matches(".back")) {
                    document.body.querySelector("#Select td:not(.locked):last-child").focus();
                    dom.updateSide();
                } else {
                    let col = Array.from(element.parentElement.children).indexOf(element);
                    let row = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);
                    let newRow = element.parentElement.parentElement.querySelectorAll("tr")[row + 1];
                    let list = newRow.querySelectorAll(":scope > [tabindex='0']:not(.locked)");
                    if (list.length > 0) { // not on the bottom
                        if (list[col] != null) {
                            list[col].focus();
                        } else {
                            list[list.length - 1].focus();
                        }
                        dom.updateSide();
                    }
                }
            }
        } else if (code == 32 || code == 13) { // [Space] or [Enter]
            element.click();
        } else if (code == 8) { // [Backspace]
            if (dom.displayed == 1 || dom.displayed == 2) { // Levels or Settings
                dom.back(dom.displayed == 1);
            }
        }
        // watch out! sometimes I return from this function.
    },
    updateSide: function (element = document.body.querySelector(":focus"), cursor = false) {
        let l = parseInt(element.textContent) - 1;
        if (typeof(l) !== "number" || l !== l || !element.matches("[tabindex='0']:not(.locked)")) return;
        //console.log("Updating for level " + (l + 1) + "...");
        if (!cursor) {
            document.body.querySelector("#LNumber").textContent = (l + 1);
            levels.drawLevel(l, true);
        } else {
            element.focus();
            document.body.querySelector("#LNumber").textContent = (l + 1);
            levels.drawLevel(l, true);
        }
        // update the side menu.
    },
    restart: function () {
        dom.play();
        levels.startLevel(levels.currentLevel);
    },
}

function visible() {
    document.body.querySelectorAll(".menu").forEach(function (e) {e.style.visibility = "visible";});
}
