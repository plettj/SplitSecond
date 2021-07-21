// DOM, MENUS, & CSS ANIMATIONS

// DOM
function fade(direction) {
    if (direction === "in") {
        document.getElementById("nextLevel").textContent = levels.currentLevel + 2;
        document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.add("on");});
        document.body.querySelector(".bigText").classList.add("on");
    } else {
        document.body.querySelectorAll(".cover").forEach(function (e) {e.classList.remove("on");});
        document.body.querySelector(".bigText").classList.remove("on");
    }
}