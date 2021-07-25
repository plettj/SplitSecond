// DOM, MENUS, & CSS ANIMATIONS

// DOM
function fade(direction, type = "Next Level") {
    switch (type) {
        case "Next Level":
            if (direction == "in") {
                document.body.querySelector("#NextLevel").textContent = levels.currentLevel + 2;
                document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.add("on");});
                document.body.querySelector(".bigText").classList.add("on");
            } else {
                document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.remove("on");});
                document.body.querySelector(".bigText").classList.remove("on");
            }
            break;
        case "Pause Menu":
            if (direction == "in") {
                document.body.querySelector("#PauseMenu").classList.remove("off");
                document.body.querySelector("#PauseMenu").classList.add("on");
                document.body.querySelector("#Pause").style.display = "none";
                document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.add("on");});
                paused = true;
            } else {
                document.body.querySelector("#PauseMenu").classList.remove("on");
                document.body.querySelector("#PauseMenu").classList.add("off");
                document.body.querySelector("#Pause").style.display = "block";
                document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.remove("on");});
                paused = false;
            }
            break;
        case "Levels Menu":
            
            break;
    }
}
function visible() {
    document.body.querySelectorAll(".menu").forEach(function (e) {e.style.visibility = "visible";});
}

function menuBack() {
    // here I'll have the logic for which menu you ought to be taken to
    fade('out', 'Pause Menu');
}