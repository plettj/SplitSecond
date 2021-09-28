// DOM, MENUS, & CSS ANIMATIONS

// DOM

let dom = {
    covers: document.body.querySelectorAll(".cover"),
    levelNum: document.body.querySelector("#NextLevel"),
    levelText: document.body.querySelector(".bigText"),
    pauseTitle: document.body.querySelector("#PauseTitle"),
    pauseNum: document.body.querySelector("#CurrLevel"),
    pauseButton: document.body.querySelector("#Pause"),
    powers: document.body.querySelector("#Powers"),
    instruction: document.body.querySelector(".instruction"),
    progressFill: document.body.querySelector("#ProgressFill"),
    bestScore: document.body.querySelector("#BestScore"),
    nextScore: document.body.querySelector("#NextScore"),
    medals: [document.body.querySelector(".progressMedal.gold"), document.body.querySelector(".progressMedal.silver"), document.body.querySelector(".progressMedal.bronze")],
    menus: [document.body.querySelector("#PauseMenu"), document.body.querySelector("#LevelsMenu"), document.body.querySelector("#SettingsMenu")],
    focuses: [document.body.querySelector(".play"), "Dynamically chooses the current level.", document.body.querySelectorAll("#SettingsMenu [tabindex='0']")[0]],
    checkboxes: document.body.querySelectorAll("input[type='checkbox']"),
    displayed: -1, // -1-nothing, 0-PauseMenu, 1-LevelsMenu, 2-SettingsMenu 3-LevelTransition
    preview: -1, // the currently-displayed level
    newMenu: function (menu = 1) {
        dom.close();
        //console.log(menu);
        switch (menu) {
            case 0: // Pause Menu
                dom.menus[0].classList.remove("off");
                dom.menus[0].classList.add("on");
                dom.pauseNum.textContent = levels.currentLevel + 1;
                dom.pauseButton.classList.add("off");
                dom.powers.classList.add("off");
                dom.instruction.classList.add("off");
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
                    document.body.querySelectorAll("#Select td")[(levels.currentLevel == -1) ? 0 : levels.currentLevel].focus();
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
        dom.pauseButton.classList.remove("off");
        dom.powers.classList.remove("off");
        dom.instruction.classList.remove("off");
        dom.covers.forEach(function (e) {e.classList.remove("on");});
        paused = false;
        dom.displayed = -1;
    },
    newLevel: function (nextL = false) {
        if (nextL) {
            dom.levelNum.textContent = levels.currentLevel + 2;
            dom.covers.forEach(function (e) {e.classList.add("on");});
            dom.levelText.classList.add("on");
            dom.pauseButton.classList.add("off");
            dom.powers.classList.add("off");
            dom.instruction.classList.add("off");
            dom.displayed = 3;
        } else {
            dom.covers.forEach(function (e) {e.classList.remove("on");});
            dom.levelText.classList.remove("on");
            dom.pauseButton.classList.remove("off");
            dom.powers.classList.remove("off");
            dom.instruction.classList.remove("off");
            dom.displayed = -1;
            if (!autoStart) dom.preview = -1;
            dom.updateInstruct();
        }
    },
    key: function (code) {
        let element = document.body.querySelector(":focus");
        if (!gameBegun) {
            if (code == 13 || code == 32 || code == 38 || code == 39 || code == 87 || code == 68 || code == 27) {
                startGame();
            }
            return;
        } if (code == 82 && dom.displayed == -1) { // R
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

                // don't do anything since settings only have vertical controls
            }
        } else if (code == 38 || code == 87) { // Up
            if (dom.displayed == 0) {
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

                // don't do anything since settings only have vertical controls
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
        // watch out! (don't add more) sometimes I return from this function.
    },
    updateSide: function (element = document.body.querySelector(":focus"), direction = 0, cursor = false) {
        let l = parseInt(element.textContent) - 1;
        console.log();
        let personalBest = 0;
        for (let l = 0; l < document.querySelectorAll("#Select td:not(.locked)").length - 1; l++) {
            personalBest += score.displayScore(score.myBest[l], false);
        }
        if (document.querySelectorAll("#Select td:not(.locked)").length == score.myBest.length) {
            let final = document.querySelectorAll("#Select td:not(.locked)")[score.myBest.length - 1];
            let possClass = final.childNodes[1].classList[1];
            if (possClass == score.translate[0] || possClass == score.translate[1] || possClass == score.translate[2]) {
                personalBest += score.displayScore(score.myBest[l], false);
            }
        }
        document.body.querySelector("#DevelopersRecord").textContent = personalBest;
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
            [document.body.querySelector("#LRankHolder"), ...(document.body.querySelectorAll(".line"))].forEach(function (elem) {
                elem.classList.remove("bronze", "silver", "gold");
                if (score.scores[l][0] < 3) elem.classList.add(score.translate[score.scores[l][0]]);
            });
            if (score.scores[l][0] == 3) document.body.querySelector("#LRank").textContent = "Unsolved";
            else document.body.querySelector("#LRank").innerHTML = capitalize(score.translate[score.scores[l][0]]);
            dom.scoreInfo(l);
            document.body.querySelector("#LMessage").innerHTML = score.scores[l][2];

            dom.preview = l;
        }
    },
    updateInstruct: function () {
        document.body.querySelectorAll(".key").forEach(function (key) {
            key.classList.add("off");
        });
        if (instructions.length > levels.currentLevel) {
            if (instructions[levels.currentLevel][0].length == 0) {
                document.body.querySelector(".instruction p.text").classList.remove("margin");
            } else {
                document.body.querySelector(".instruction p.text").classList.add("margin");
                for (let k = 0; k < instructions[levels.currentLevel][0].length; k++) {
                    let key = document.body.querySelectorAll(".key")[k];
                    key.classList.remove("off");
                    key.textContent = instructions[levels.currentLevel][0][k];
                }
            }
            document.body.querySelector(".instruction p.text").textContent = instructions[levels.currentLevel][1];
        } else {
            document.body.querySelector(".instruction").classList.add("permaOff");
        }
    },
    scrollToRow: function (row, direction) { // direction --> 0-GOAWAY, 1-Up, -1-Down
        if (!direction) return false;
        let menuScroll = document.body.querySelector(".scroll").scrollTop;
        let elemScroll = document.body.querySelectorAll("#Select tr")[row].offsetTop - Math.round(unit * 0.15);
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
    scoreInfo: function (level) {
        let rank = score.scores[level][0];
        let displays = [score.displayScore(score.goals[level][0], true), score.displayScore(score.goals[level][1], true)]; // [gold, silver]
        dom.medals[1].style.left = "calc(" + Math.ceil(displays[1] / displays[0] * 100) + "% - var(--unit) * 0.45)";
        dom.medals[2].style.left = "calc(" + Math.ceil(100 / displays[0] * 100) + "% - var(--unit) * 0.45)";
        if (rank == 3) {
            dom.progressFill.style.width = "3.5%";
            document.body.querySelector("#Scores").classList.remove("on");
            return;
        } else {
            let nextMedal = (rank < 2) ? 0 : 1;
            let yours = score.displayScore(score.scores[level][1], true);
            let goal = score.displayScore(score.goals[level][nextMedal], true);
            if (rank == 0) {
                dom.progressFill.style.width = "100%";
                document.querySelector("#NextScoreTitle").textContent = "Gold's score:";
            } else {
                dom.progressFill.style.width = Math.floor(yours / displays[0] * 100 - 2) + "%";
                document.querySelector("#NextScoreTitle").textContent = "Next medal:";
            }
            dom.bestScore.textContent = yours;
            dom.nextScore.textContent = goal;
            score.translate.forEach(function (name) {
                if (name !== "") {
                    dom.bestScore.classList.remove(name);
                    dom.nextScore.classList.remove(name);
                }
            });
            //console.log(rank);

            dom.bestScore.classList.add(score.translate[rank]);
            dom.nextScore.classList.add(score.translate[(rank > 0) ? rank - 1 : 0]);
        }
        document.body.querySelector("#Scores").classList.add("on");
    },
    restart: function () {
        dom.play();
        levels.startLevel(levels.currentLevel);
    },
    updateTotalScore: function (totalScore) {
        document.querySelector("#TotalScore").textContent = totalScore;
    },
    swapPref: function (n, type) {
        switch (type) {
            case "autoStart":
                autoStart = !autoStart;
                dom.checkboxes[n].checked = autoStart;
                save();
                break;
            case "statisticTwo":
                statisticTwo = !statisticTwo;
                dom.checkboxes[n].checked = statisticTwo;
                save();
                levels.startLevel(levels.currentLevel);
                break;
        }
    }
}

function shakePower(power) {
    document.body.querySelectorAll(".powerBox p")[power].classList.add("shake");
    setTimeout(function () {
        document.body.querySelectorAll(".powerBox p")[power].classList.remove("shake");
    }, 1000);
    console.log("Shake " + power + " power!!!");
}

function updatePower() {
    let displays = document.body.querySelectorAll(".powerBox p");
    displays[0].textContent = Math.floor(levels.powers[levels.currentLevel][0] - levels.scores[1]);
    displays[1].textContent = Math.floor(levels.powers[levels.currentLevel][1] - levels.scores[2][0]);
}

// This function relies on score.scores being up-to-date ([0, 0, 0] = uncomplete)
function initializeLevels() {
    let currRow = document.createElement("tr");
    let comeToLast = false; // true, if come to last solved level
    for (let s = 0; s < score.scores.length; s++) {
        if (!(s % 4)) { // first in a row
            currRow = document.createElement("tr");
        }
        let td = document.createElement("td");
        let bar = document.createElement("div");
        bar.classList.add("bar");
        if (score.scores[s][1][0] + score.scores[s][1][1] + score.scores[s][1][2] <= 0) {
            if (comeToLast) td.classList.add("locked");
            else {
                td.setAttribute("onclick", "dom.play(" + (s + 1) + ");");
                let rank = score.scores[s][0];
                if (rank == 2) bar.classList.add("bronze");
                else if (rank == 1) bar.classList.add("silver");
                else if (rank == 0) bar.classList.add("gold");
                comeToLast = true;
            }
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
    window.scrollTo(0, 0);
    dom.updateSide(document.body.querySelector("td"));
    //console.log("Possibly: make powers visible");
    for (let i = 0; i < 2; i++) {
        if (powers[i]) document.body.querySelectorAll("#Powers .powerBox")[i].classList.add("on");
    }
    dom.updateTotalScore(score.calcTotal());
    dom.checkboxes[0].checked = autoStart;
    dom.checkboxes[1].checked = statisticTwo;
}

function startGame() {
    console.log("starting the game!!");
    paused = false;
    gameBegun = true;
    document.body.querySelector("#TitleScreenOverlay").classList.add("leaving");
    setTimeout(function () {
        document.body.querySelector("#TitleScreen").classList.add("gone");
        document.body.querySelector("#TitleScreenOverlay").classList.remove("leaving");
        levels.startLevel(beginningLevel);
        levels.drawLevel(beginningLevel, true);
        startAnimating(60); // 60 fps
    }, 500);
    setTimeout(function () {
        document.body.querySelector("#TitleScreenOverlay").style.display = "none";
    }, 1000);
}

function fullDelete() {
    //if (confirm("Are you sure you want to delete all your progress in Split Second?")) {
        console.log("Full deletion time!!");
        localStorage.setItem('saved', JSON.stringify({
            "bestLevel": 0,
            "powers": [false, false],
            "autoStart": true,
            "scores": []
        }));
        location.reload();
    //}
}
