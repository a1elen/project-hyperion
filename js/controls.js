function initKeyControls() {
    document.querySelector("html").onkeypress = (e) => {
        if (e.key == "N") DEBUG = !DEBUG;

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
            if (e.key == "8") player.tryMove(0, -1);
            if (e.key == "2") player.tryMove(0, 1);
            if (e.key == "4") player.tryMove(-1, 0);
            if (e.key == "6") player.tryMove(1, 0);

            // Diagonal Movement
            if (e.key == "9") player.tryMove(1, -1);
            if (e.key == "3") player.tryMove(1, 1);
            if (e.key == "1") player.tryMove(-1, 1);
            if (e.key == "7") player.tryMove(-1, -1);

            if (e.key == "g") player.pickUp();
            if (e.key == ">") player.moveDown();
            if (e.key == "<") player.moveUp();

            if (DEBUG) {
                if (e.key == "k") addPopups("Pressed 'k'!", "white", player);
                if (e.key == "j") addMessageLog("Pressed 'j'!");
                if (e.key == "m") addStatus("AllSeeingEye", randomRange(2, 5), player);
                if (e.key == "o") startLevel(Math.min(maxHp, player.hp-5), player.spells);
                if (e.key == "p") {
                    level++;
                    startLevel(Math.min(maxHp, player.hp+1), player.spells);
                }
            }

            if (e.key == "x") {
                gameState = "viewmode";
                selectedTile = player.tile;
                selectedTile.selected = true;
            }

            if (e.key == "i") {
                gameState = "inventory";
            }

            if (e.key == "w") {
                gameState = "wield";
            }

            if (e.key == "W") {
                gameState = "wear";
            }

            if (e.key == "E") {
                gameState = "eat";
            }

            if (e.key == "d") {
                gameState = "drop";
            }

            if (e.key == "r") {
                gameState = "read";
            }

            if (e.key == "a") gameState = "abilities";

            if (e.key == "e") {
                gameState = "useSelect";

                player.tile.getNeighbour(0, -1).selected = true;
                player.tile.getNeighbour(0, 1).selected = true;
                player.tile.getNeighbour(-1, 0).selected = true;
                player.tile.getNeighbour(1, 0).selected = true;
    
                player.tile.getNeighbour(1, -1).selected = true;
                player.tile.getNeighbour(1, 1).selected = true;
                player.tile.getNeighbour(-1, 1).selected = true;
                player.tile.getNeighbour(-1, -1).selected = true;

                player.tile.getNeighbour(0, 0).selected = true;

            }

            if (e.key == "z") {

                if (scaleX < 1.75) {
                    scaleX += 0.25;
                    scaleY += 0.25;
                }
            }

            if (e.key == "Z") {

                if (scaleX > 0.25) {
                    scaleX -= 0.25;
                    scaleY -= 0.25;
                }
            }
            if (e.key == "5") {
                if (randomRange(1, 20) > 10 && player.hunger > 0) {
                    player.heal(1);
                    player.healMana(1);
                    player.hunger = Math.max(0, player.hunger - randomRange(5, 10)) ;
                }
                tick();
            }
            
            if (e.key == "0") gameState = "spells";

            if (e.key == "@") gameState = "stats";

        } else if (gameState == "spells") {
            if (e.key >= 1 && e.key <= 9) player.castSpell(e.key-1);

            if (e.key == "0") gameState = "running";
        } else if (gameState == "stats") {
            if (e.key == "@") gameState = "running";
        } else if (gameState == "inventory") {
            if (e.key == "i") {
                gameState = "running";
            }
        } else if (gameState == "wield") {
            if (e.key == "w") {
                gameState = "running";
            }
            if (e.key >= 1 && e.key <= 9) {
                player.wield(e.key-1);
                tick();
                gameState = "running";
            }
        } else if (gameState == "wear") {
            if (e.key == "W") {
                gameState = "running";
            }
            if (e.key >= 1 && e.key <= 9) {
                player.wear(e.key-1);
                tick();
                gameState = "running";
            }
        } else if (gameState == "eat") {
            if (e.key == "E") {
                gameState = "running";
            }
            if (e.key >= 1 && e.key <= 9) {
                player.eat(e.key-1);
                tick();
                gameState = "running";
            }
        } else if (gameState =="read") {
            if (e.key == "r") {
                gameState = "running";
            }
            if (e.key >= 1 && e.key <= 9) {
                player.castScroll(e.key-1);
                tick();
                gameState = "running";
            }
        } else if (gameState == "drop") {
            if (e.key == "d") {
                gameState = "running";
            }
            if (e.key >= 1 && e.key <= 9) {
                player.drop(e.key-1);
                tick();
                gameState = "running";
            }
        } else if (gameState == "abilities") {
            if (e.key = "a") gameState = "running";
            if (e.key >= 1 && e.key <= 9) {
                player.useAbility(e.key-1);
                tick();
                gameState = "running";
            }
        } else if (gameState == "useSelect") {
            if (e.key == "w" || e.key == "8") player.use(0, -1);
            if (e.key == "s" || e.key == "2") player.use(0, 1);
            if (e.key == "a" || e.key == "4") player.use(-1, 0);
            if (e.key == "d" || e.key == "6") player.use(1, 0);

            if (e.key == "9") player.use(1, -1);
            if (e.key == "3") player.use(1, 1);
            if (e.key == "1") player.use(-1, 1);
            if (e.key == "7") player.use(-1, -1);

            if (e.key == "5") player.use(0, 0);

            if (e.key == "e") gameState = "running";

            player.tile.getNeighbour(0, -1).selected = false;
            player.tile.getNeighbour(0, 1).selected = false;
            player.tile.getNeighbour(-1, 0).selected = false;
            player.tile.getNeighbour(1, 0).selected = false;
    
            player.tile.getNeighbour(1, -1).selected = false;
            player.tile.getNeighbour(1, 1).selected = false;
            player.tile.getNeighbour(-1, 1).selected = false;
            player.tile.getNeighbour(-1, -1).selected = false;

            player.tile.getNeighbour(0, 0).selected = false;
        } else if (gameState == "viewmode") {

            if (selectedTile != undefined) {
                if (selectedTile.selected = true) {
                    selectedTile.selected = false;
                }
            }

            if (e.key == "8") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(0, -1);
                selectedTile.selected = true;
            } 
            if (e.key == "2") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(0, 1);
                selectedTile.selected = true;
            }
            if (e.key == "4") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(-1, 0);
                selectedTile.selected = true;
            }
            if (e.key == "6") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(1, 0);
                selectedTile.selected = true;
            }
            if (e.key == "9") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(1, -1);
                selectedTile.selected = true;
            }
            if (e.key == "3") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(1, 1);
                selectedTile.selected = true;
            }
            if (e.key == "1") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(-1, 1);
                selectedTile.selected = true;
            }
            if (e.key == "7") {
                selectedTile.selected = false;
                selectedTile = selectedTile.getNeighbour(-1, -1);
                selectedTile.selected = true;
            }

            if (e.key == "x") gameState = "running";
        }
    }
}