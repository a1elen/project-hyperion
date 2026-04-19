function initKeyControls() {
    if (!window._gameMenuKeydownBound) {
        window._gameMenuKeydownBound = true;
        document.addEventListener("keydown", handleGameMenuKeydown);
    }

    // Ensure window gets focus on click
    document.addEventListener("click", () => {
        window.focus();
    });

    document.querySelector("html").onkeypress = (e) => {
        if (gameState === "gameMenu") return;

        if (e.key == "n") DEBUG = !DEBUG;

        if (gameState == "title") {
            if (e.key === "Enter") {
                openCharacterCreation();
            }
        } else if (gameState == "characterCreation") {
            const selectedRace = RACES[characterCreationState.selectedRaceIndex];
            const availableDestinies = getDestiniesForRace(selectedRace.name);
            
            // Number keys to select race (1-3)
            if (e.key >= "1" && e.key <= "3") {
                const index = parseInt(e.key, 10) - 1;
                if (index < RACES.length) {
                    characterCreationState.selectedRaceIndex = index;
                    characterCreationState.selectedDestinyIndex = 0;
                    characterCreationState.selectedColumn = 0;
                }
            }
            // Number keys to select destiny (only when in destiny column)
            if (e.key >= "1" && e.key <= "9" && characterCreationState.selectedColumn === 1) {
                const index = parseInt(e.key, 10) - 1;
                if (index < availableDestinies.length) {
                    characterCreationState.selectedDestinyIndex = index;
                }
            }
            if (e.key === "Enter") {
                startGameWithCharacterCreation();
            }
            if (e.key === "Escape") {
                showTitle();
            }
        } else if (gameState == "dead") {
            openCharacterCreation();
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
                if (e.key == "o") startLevel(Math.min(maxHp, player.hp - 5), player.spells);
                if (e.key == "p") {
                    level++;
                    startLevel(Math.min(maxHp, player.hp + 1), player.spells);
                }
            }

            if (e.key == "x") {
                gameState = "viewmode";
                selectedTile = player.tile;
                selectedTile.selected = true;
            }

            if (e.key == "i") openInventoryGameMenu();

            if (e.key == "b") openEquipmentMenu();

            if (e.key == "w") openWieldGameMenu();

            if (e.key == "W") openWearGameMenu();

            if (e.key == "E") openEatGameMenu();

            if (e.key == "d") openDropGameMenu();

            if (e.key == "r") openReadGameMenu();

            if (e.key == "a") openAbilitiesGameMenu();

            if (e.key == "t") openThrowGameMenu();

            if (e.key == "e") {
                // Check if there are any interactions available
                let hasInteractions = false;
                for (let ox = -1; ox <= 1; ox++) {
                    for (let oy = -1; oy <= 1; oy++) {
                        const tile = player.tile.getNeighbour(ox, oy);
                        if (tile && collectTileInteractions(player, tile).length > 0) {
                            hasInteractions = true;
                            break;
                        }
                    }
                    if (hasInteractions) break;
                }

                if (!hasInteractions) {
                    addPopups("Nothing to interact with", "gray", player);
                    return;
                }

                gameState = "useSelect";

                // Only highlight tiles that have interactions
                for (let ox = -1; ox <= 1; ox++) {
                    for (let oy = -1; oy <= 1; oy++) {
                        const tile = player.tile.getNeighbour(ox, oy);
                        if (tile && collectTileInteractions(player, tile).length > 0) {
                            tile.selected = true;
                        }
                    }
                }
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
                tick();
            }

            if (e.key == "R") {
                isResting = true;
                addMessageLog("Resting...");
                processRest();
            }

            if (e.key == "0") openSpellsGameMenu();

            if (e.key == "@") gameState = "stats";
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

            if (e.key == "e") {
                gameState = "running";
                for (let ox = -1; ox <= 1; ox++) {
                    for (let oy = -1; oy <= 1; oy++) {
                        player.tile.getNeighbour(ox, oy).selected = false;
                    }
                }
            }
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
        } else if (gameState == "throwTarget") {
            if (selectedTile != undefined) {
                if (selectedTile.selected = true) {
                    selectedTile.selected = false;
                }
            }

            const radius = 3;
            const dx = 0;
            const dy = 0;

            if (e.key == "8") {
                const newTile = selectedTile.getNeighbour(0, -1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "2") {
                const newTile = selectedTile.getNeighbour(0, 1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "4") {
                const newTile = selectedTile.getNeighbour(-1, 0);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "6") {
                const newTile = selectedTile.getNeighbour(1, 0);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "9") {
                const newTile = selectedTile.getNeighbour(1, -1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "3") {
                const newTile = selectedTile.getNeighbour(1, 1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "1") {
                const newTile = selectedTile.getNeighbour(-1, 1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "7") {
                const newTile = selectedTile.getNeighbour(-1, -1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }

            if (e.key == "x" || e.key == "Escape") {
                gameState = "running";
                selectedTile.selected = false;
                selectedItemIndex = null;
            }

            if (e.key == "Enter" || e.key == " ") {
                player.throwItem(selectedItemIndex, selectedTile);
                gameState = "running";
                selectedTile.selected = false;
                selectedItemIndex = null;
            }
        } else if (gameState == "jumpTarget") {
            if (selectedTile != undefined) {
                if (selectedTile.selected = true) {
                    selectedTile.selected = false;
                }
            }

            const radius = 3;

            if (e.key == "8") {
                const newTile = selectedTile.getNeighbour(0, -1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "2") {
                const newTile = selectedTile.getNeighbour(0, 1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "4") {
                const newTile = selectedTile.getNeighbour(-1, 0);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "6") {
                const newTile = selectedTile.getNeighbour(1, 0);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "9") {
                const newTile = selectedTile.getNeighbour(1, -1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "3") {
                const newTile = selectedTile.getNeighbour(1, 1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "1") {
                const newTile = selectedTile.getNeighbour(-1, 1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }
            if (e.key == "7") {
                const newTile = selectedTile.getNeighbour(-1, -1);
                if (newTile.dist(player.tile) <= radius) {
                    selectedTile.selected = false;
                    selectedTile = newTile;
                    selectedTile.selected = true;
                }
            }

            if (e.key == "x" || e.key == "Escape") {
                gameState = "running";
                selectedTile.selected = false;
            }

            if (e.key == "Enter" || e.key == " ") {
                // Check if tile is passable
                if (selectedTile.passable) {
                    // Check hunger
                    if (player.hunger >= 10) {
                        player.hunger -= 10;
                        addMessageLog("Jump! -10 hunger");
                        addPopups("-10 Hunger", "orange", player);
                    } else {
                        player.hp -= 1;
                        addMessageLog("Jump! -1 HP (not enough hunger)");
                        addPopups("-1 HP", "red", player);
                    }
                    
                    // Move player to target tile
                    player.tile.monster = null;
                    selectedTile.monster = player;
                    player.tile = selectedTile;
                    
                    // Use a turn
                    tick();
                    
                    // Set cooldown
                    const jumpAbility = player.abilities.find(a => a.name === "Jump");
                    if (jumpAbility) {
                        jumpAbility.currentCooldown = jumpAbility.cd;
                    }
                    
                    addPopups("Jump!", "aqua", player);
                } else {
                    addMessageLog("Cannot jump to impassable tile");
                }
                
                gameState = "running";
                selectedTile.selected = false;
            }
        }
    };
}
