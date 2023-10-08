// touch controls VERY DIRTY CODE PLS FIX
    
function initTouchControls() {
    let touchstartX = 0;
    let touchendX = 0;
    let touchstartY = 0;    
    let touchendY = 0;

    document.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
        e.preventDefault();
    })

    document.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        checkDirection()
        e.preventDefault();
    })
}

function touchMove(x, y) {
    if (gameState == "title") {
            startGame();
        } else if (gameState == "dead") {
            showTitle();
        } else if (gameState == "running") {
            player.tryMove(x, y);
        }
}

function checkDirection() {
    xDist = Math.floor(Math.abs(touchstartX - touchendX));
    yDist = Math.floor(Math.abs(touchstartY - touchendY));

    if (xDist < 100 && yDist < 100) {
        return;
    }

    if (touchendX < touchstartX && xDist > 100 && yDist < 100) {
        // left
        touchMove(-1, 0);
        return;
    }
    if (touchendX > touchstartX && xDist > 100 && yDist < 100) {
        // right
        touchMove(1, 0);
        return;
    }
    if (touchendY < touchstartY && yDist > 100 && xDist < 100) {
        // up
        touchMove(0, -1);
        return;
    }
    if (touchendY > touchstartY && yDist > 100 && xDist < 100) {
        // down
        touchMove(0, 1);
        return;
    }
}

function initKeyControls() {
    document.querySelector("html").onkeypress = (e) => {
        if (gameState == "title") {
            if (e.key == "1") {
                playerClass = 1;
                startGame();
            }
            if (e.key == "2") {
                playerClass = 2;
                startGame();
            }
        } else if (gameState == "dead") {
            showTitle();
        } else if (gameState == "running") {
            // Four-side movement
            if (e.key == "w" || e.key == "8") player.tryMove(0, -1);
            if (e.key == "s" || e.key == "2") player.tryMove(0, 1);
            if (e.key == "a" || e.key == "4") player.tryMove(-1, 0);
            if (e.key == "d" || e.key == "6") player.tryMove(1, 0);

            if (e.key == "z") ctx.translate(-2, -2);

            // Diagonal Movement
            if (e.key == "9") player.tryMove(1, -1);
            if (e.key == "3") player.tryMove(1, 1);
            if (e.key == "1") player.tryMove(-1, 1);
            if (e.key == "7") player.tryMove(-1, -1);

            if (e.key == "g") player.pickUp();
            if (e.key == ">") player.moveDown();
            if (e.key == "<") player.moveUp();
            if (e.key == "e") player.use();
            if (e.key == "m") addStatus("AllSeeingEye", randomRange(2, 5), player);
            if (e.key == "r") startLevel(Math.min(maxHp, player.hp-5), player.spells);
            if (e.key == "p") {
                level++;
                startLevel(Math.min(maxHp, player.hp+1), player.spells);
            }
            if (e.key == "z") {
                if (!zoomed) {
                    zoomed = true;
                } else {
                    zoomed = false;
                }
            }
            if (e.key == "5") tick();

            if (e.key == "0") gameState = "spells";

            if (e.key == "@") gameState = "stats";

        } else if (gameState == "spells") {
            if (e.key >= 1 && e.key <= 9) player.castSpell(e.key-1);

            if (e.key == "0") gameState = "running";
        } else if (gameState == "stats") {
            if (e.key == "@") gameState = "running";
        }
    }
}