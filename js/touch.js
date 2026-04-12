// touch controls VERY DIRTY CODE PLS FIX
    
function initTouchControls() {
    let touchstartX = 0;
    let touchendX = 0;
    let touchstartY = 0;    
    let touchendY = 0;

    let selectedTile;

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
            openCharacterCreation();
        } else if (gameState == "dead") {
            openCharacterCreation();
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