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
    preview: beginningLevel,
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
                    console.log("focussing on levels.currentLevel");
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
            levels.startLevel(levels.currentLevel);
        } else if ((code == 80 || code == 27) && dom.displayed == -1) { // P
            dom.newMenu(0);
        } else if (code == 27) { // [esc]
            dom.play();
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
                    dom.updateSide(document.body.querySelector(":focus"), 1);
                } else {
                    let newRow = element.parentElement.parentElement.querySelectorAll("tr")[row - 1];
                    let list = newRow.querySelectorAll(":scope > [tabindex='0']:not(.locked)");
                    if (list[col] != null) {
                        list[col].focus();
                    } else {
                        list[list.length - 1].focus();
                    }
                    dom.updateSide(document.body.querySelector(":focus"), 1);
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
                element.parentElement.querySelectorAll(":scope > [tabindex='0']:not(.locked)")[0].focus();
                dom.updateSide();
            } else if (dom.displayed == 2) {
                // settings menu right button...
            }
        } else if (code == 40 || code == 83) { // Down
            if (dom.displayed == 0 || dom.displayed == 2) {
                if (element.nextElementSibling != null) element.nextElementSibling.focus();
                else element.parentElement.querySelector(":scope > [tabindex='0']").focus();
            } else if (dom.displayed == 1) {
                if (element.matches(".settings")) { // settings button
                    document.body.querySelector("#Select td:not(.locked)").focus();
                    dom.updateSide(document.body.querySelector(":focus"), -1);
                } else if (element.matches(".back")) { // back button
                    elementsInTopRow = document.body.querySelectorAll("#Select tr:first-child td:not(.locked)");
                    elementsInTopRow[elementsInTopRow.length - 1].focus();
                    dom.updateSide(document.body.querySelector(":focus"), -1);
                } else {
                    let col = Array.from(element.parentElement.children).indexOf(element);
                    let row = Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement);
                    let newRow = element.parentElement.parentElement.querySelectorAll("tr")[(row + 1 < levels.levels.length / 4) ? row + 1 : row];
                    let list = newRow.querySelectorAll(":scope > [tabindex='0']:not(.locked)");
                    if (list.length > 0) { // not on the bottom
                        if (list[col] != null) {
                            list[col].focus();
                        } else {
                            list[list.length - 1].focus();
                        }
                        dom.updateSide(document.body.querySelector(":focus"), -1);
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
    updateSide: function (element = document.body.querySelector(":focus"), direction = 0, cursor = false) {
        let l = parseInt(element.textContent) - 1;
        if (l !== dom.preview) { // new element
            if (typeof(l) !== "number" || l !== l || !element.matches("[tabindex='0']:not(.locked)")) return;
            //console.log("Updating for level " + (l + 1) + "...");
            if (cursor) {
                element.focus();
            } else {
                dom.scrollToRow(Array.from(element.parentElement.parentElement.children).indexOf(element.parentElement), direction);
            }
            document.body.querySelector("#LNumber").textContent = (l + 1);
            levels.drawLevel(l, true);
            // update the side menu.
            dom.preview = l;
        }
    },
    scrollToRow: function (row, direction) { // direction --> 0-GOAWAY, 1-Up, -1-Down
        if (!direction) return false;
        let menuScroll = document.body.querySelector(".scroll").scrollTop;
        let elemScroll = document.body.querySelectorAll("tr")[row].offsetTop - Math.round(unit * 0.15);
        let willScroll = false;
        if (direction == 1) { // Up
            if (elemScroll - menuScroll < unit * 1) {
                if (row > 1) elemScroll -= unit * 2.2; // not the second row
                else elemScroll = 0;
                willScroll = true;
            }
        } else { // Down
            if (elemScroll - menuScroll > unit * 6) {
                if (row + 2 < levels.levels.length / 4) elemScroll -= unit * (4.4 + 0.7); // not the second-last row
                willScroll = true;
            }
        }
        if (willScroll) {
            document.body.querySelector(".scroll").scroll({
                top: elemScroll,
                behavior: "smooth"
            });
        }
    },
    restart: function () {
        dom.play();
        levels.startLevel(levels.currentLevel);
    },
}

// This function relies on score.scores being up-to-date ([0, 0, 0] = uncomplete)
function initializeLevels() {
    let currRow = document.createElement("tr");
    for (let s = 0; s < score.scores.length; s++) {
        if (!(s % 4)) { // first in a row
            currRow = document.createElement("tr");
        }
        let td = document.createElement("td");
        let bar = document.createElement("div");
        bar.classList.add("bar");
        if (score.scores[s][1][0] + score.scores[s][1][1] + score.scores[s][1][2] <= 0 && s !== 0 && !beginningLevel) {
            td.classList.add("locked");
        } else {
            td.setAttribute("onclick", "dom.play(" + (s + 1) + ");");
            let rank = score.scores[s][0];
            if (rank == 2) bar.classList.add("bronze");
            else if (rank == 1) bar.classList.add("silver");
            else if (rank == 0) bar.classList.add("gold");
        }
        td.setAttribute("onmousemove", "dom.updateSide(this, 1, true);");
        td.setAttribute("tabindex", "0");
        td.textContent = (s + 1);
        td.id = "td" + (s + 1);
        td.appendChild(bar);
        currRow.appendChild(td);
        if (!((s + 1) % 4) || s + 1 >= score.scores.length) { // last in a row
            document.querySelector("#Select").appendChild(currRow);
        }
    }
}

function visible() {
    document.body.querySelectorAll(".menu").forEach(function (e) {e.style.visibility = "visible";});
}
