function setupCanvas() {

    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    ctx.imageSmoothingEnabled = false;

    let mouseX;
    let mouseY;

    scaleX = 1;
    scaleY = 1;

    viewport = {
        x: 0,
        y: 0,
        zoom: 1
    };

    zoomed = false;

    popupText = [];

}

function drawSprite(sprite, x, y) {
    
    ctx.drawImage(
        spritesheet,
        (sprite-(Math.floor(sprite/50)*50))*16,
        Math.floor(sprite/50)*16,
        16,
        16,
        x*tileSize + shakeX,
        y*tileSize + shakeY,
        tileSize,
        tileSize
    )
}

function draw() {
    if (!(gameState == "running" || gameState == "dead" || gameState == "spells" || gameState == "stats" || gameState == "useSelect" || gameState == "viewmode" || gameState == "inventory" || gameState == "wield" || gameState == "eat" || gameState == "drop")) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /*if (zoomed) {
        scaleX = 0.75;
        scaleY = 0.75;
    } else {
        scaleX = 1;
        scaleY = 1;
    }*/

    translateX = -player.getDisplayX() * tileSize + (canvas.width / scaleX / 2) - (tileSize/2);
    translateY = -player.getDisplayY() * tileSize + (canvas.height / scaleY / 2) - (tileSize/2);
    
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.translate(translateX, translateY);

    screenshake();

    seenTiles = [];

    for (let i = -1; i < numTiles+1; i++) {
        for (let j = -1; j < numTiles+1; j++) {
            const target = getTile(i, j);
            const distance = (Math.max(Math.abs(target.x - player.tile.x), Math.abs(target.y - player.tile.y)))

            if (distance <= 3 && distance > 0) {
                drawLine(player.tile.x, player.tile.y, target.x, target.y);
            }
        }
    }

    function drawLine(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const length = dx > dy ? dx : dy;
        for (let i = 0; i <= length; ++i) {
            const t = i / length;
            const x = x1 + Math.round(t * (x2 - x1));
            const y = y1 + Math.round(t * (y2 - y1));
            seenTiles.push(getTile(x, y));
            getTile(x, y).known = true;
            if (!getTile(x, y).passable) {
                return;
            }
        }
    }

    for (const seenTile of seenTiles) {
        seenTile.draw();
    }


    for (let i = -1; i < numTiles+1; i++) {
        for (let j = -1; j < numTiles+1; j++) {
            if (getTile(i, j).known && !seenTiles.includes(getTile(i, j))) {
                getTile(i, j).draw();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(getTile(i, j).x * tileSize + shakeX, getTile(i, j).y * tileSize + shakeY, tileSize, tileSize);
            }
        }
    }

    if (monsters != undefined) {
        for (const monster of monsters) {
            if (seenTiles.includes(monster.tile)) {
                monster.draw();
            }
        }
    }

    player.draw();

    ctx.restore();

    let centerY = canvas.height / 2;
    let centerX = canvas.width / 2;

    // Top-Center text
    drawText("Caves", 30, false, 30, "violet", 400, "center")
    drawText("["+level+"]", 30, false, 60, "white", 400, "center");

    //console.log("x is ", mouseX-300);
    //console.log("y is ", mouseY-50);

    //drawText(`Mouse X is: ${mouseX}`, 20, false, mouseY, "white", mouseX+20);
    //drawText(`Mouse Y is ${mouseY}`, 20, false, mouseY+20, "white", mouseX+20);

    //let xTile = Math.floor((mouseX)/64)
    //let yTile = Math.floor((mouseY)/64)

    //let tileName = tiles[xTile][yTile].constructor.name;

    //drawText(`Tile name is ${tileName}`, 20, false, mouseY+40, "white", mouseX+20);

    //drawText(`Tile x ${xTile}`, 20, false, mouseY+60, "white", mouseX+20);
    //drawText(`Tile y ${yTile}`, 20, false, mouseY+80, "white", mouseX+20);

    //if (selectedTile != undefined) {
        //selectedTile.selected = false;
    //}

    //let selectedTile = player.tile.getNeighbour(Math.round(mouseX/64-6), Math.round(mouseY/64-6));
    //selectedTile.selected = true;

    if (gameState == "running") {


        // Show popups
        if (Array.isArray(popupText)) {
            if (popupText.length) {

                for (let popup of popupText) {
                    let drawX = popup.x+tileSize/2-(popup.startTranslateX-translateX);
                    let drawY = popup.y+popupText.indexOf(popup)*20-popup.timeout-(popup.startTranslateY-translateY);
                    drawText(popup.text, 20, false, drawY*scaleY, popup.color, drawX*scaleX, "center");
                    popup.timeout++;
                    if (popup.timeout >= 100) {
                        popupText.splice(popupText.indexOf(popup), 1);
                    }
                }
            }
        }

        drawText(`Level: ${player.level}`, 20, false, 30, 'rgba(244, 230, 62, 0.75)', 670, "right");
        drawText(`XP: ${player.xp}/${player.xpToLevel}`, 20, false, 50, 'rgba(237, 227, 103, 0.75)', 670, "right");

        drawText(`Health: ${player.hp}`, 20, false, 30, 'rgba(255, 74, 83, 0.75)', 20);
        drawText(`Mana: ${player.mana}`, 20, false, 50, 'rgba(97, 143, 252, 0.75', 20);
        drawText(`Hunger: ${player.hunger}`, 20, false, 70, 'rgba(229, 156, 89, 0.75', 20);

        let player_weapon;
        let text_color = "white";
        if (player.weapon != undefined) {
            player_weapon = player.weapon.fullName();

            if (player.weapon.quality != undefined) {
                switch(player.weapon.quality) {
                    case "Junk": text_color = "grey"; break;
                    case "Rusted": text_color = "orange"; break;
                    case "Normal": text_color = "white"; break;
                    case "Sharp": text_color = "aqua"; break;
                    case "Masterpiece": text_color = "violet"; break;
                }
            }

        } else {
            player_weapon = "Fists";
        }



        drawText(`Right hand:`, 20, false, 100, "white", 20);
        drawText(`${player_weapon}`, 20, false, 120, text_color, 20);

        if (player.weapon != undefined) {
            drawText(`Damage: ${player.weapon.diceRolls}d${player.weapon.diceSides}`, 20, false, 150, "white", 20);
        } else {
            drawText(`Damage: 1d2`, 20, false, 150, "white", 20);
        }

        drawText(`AC/DV: ${player.armorClass}/${player.evasionClass}`, 20, false, 170, "white", 20);

        drawText("Status:", 30, false, 200, "violet", 20);


        for (let i = 0; i < player.statuses.length; i++) {
            const statusText = (`${player.statuses[i].constructor.name} (${player.statuses[i].duration})`);
            drawText(statusText, 20, false, 230 + i * 30, "aqua", 20);
              
        }

        if (player.tile.items.length > 0) {
            for (let item of player.tile.items) {
                let text = item.name;
                let text_color = "white";

                switch(item.type) {
                    case "weapon": text = item.fullName(); break;
                    case "body_armor": text = item.quality+" "+text + " [" + item.av + "/" + item.ev + "]"; break;
                    case "coin": text = item.amount + " " + item.name; break;
                    case "scroll": break;
                    case "food": break;
                }

                if (item.quality != undefined) {
                    switch(item.quality) {
                        case "Junk": text_color = "grey"; break;
                        case "Rusted": text_color = "orange"; break;
                        case "Normal": text_color = "white"; break;
                        case "Sharp": text_color = "aqua"; break;
                        case "Masterpiece": text_color = "violet"; break;
                    }
                }

                drawText("Here lies: ", 20, false, 500, "white", 20);
                drawText(text, 20, false, 520 + player.tile.items.indexOf(item)*20, text_color, 20);
            }
        }
    }

    if (gameState == "spells") {
        drawText("Spells:", 30, false, 200, "violet", 20);

        for (let i = 0; i < numSpells; i++) {
            const spellText = `${i + 1}) ${player.spells[i] || "--- "}`;
            drawText(spellText, 20, false, 230 + i * 40, "aqua", 20);
        }
    }

    if (gameState == "inventory") {
        drawText(`Gold: ${score}`, 30, false, 30, "violet", 20);

        drawText("Items:", 30, false, 200, "violet", 20);

        for (let i = 0; i < player.inventory.length; i++) {
            let itemText = `${i + 1}) ${player.inventory[i].fullName()}`;
            drawText(itemText, 20, false, 230 + i * 40, "aqua", 20);
        }


    }

    if (gameState == "wield") {
        drawText("Weapons:", 30, false, 200, "violet", 20);

        let wieldable_weapons = [];
        for (let item of player.inventory) {
            if (item.type != undefined) {
                if (item.type == "weapon") {
                    wieldable_weapons.push(item);
                }
            }
        }

        if (wieldable_weapons == undefined) return;

        for (let i = 0; i < wieldable_weapons.length; i++) {
            let weaponText = `${i + 1}) ${wieldable_weapons[i].fullName()}`;
            drawText(weaponText, 20, false, 230 + i * 40, "aqua", 20);
        }
    }

    if (gameState == "eat") {
        drawText("Food:", 30, false, 200, "violet", 20);

        let eatable_items = [];
        for (let item of player.inventory) {
            if (item.type != undefined) {
                if (item.type == "food") {
                    eatable_items.push(item);
                }
            }
        }

        if (eatable_items == undefined) return;

        for (let i = 0; i < eatable_items.length; i++) {
            let foodText = `${i + 1}) ${eatable_items[i].fullName()}`;
            drawText(foodText, 20, false, 230 + i * 40, "aqua", 20);
        }
    }

    if (gameState == "drop") {
        drawText("What to drop:", 30, false, 200, "violet", 20);

        if (player.inventory == undefined) return;

        for (let i = 0; i < player.inventory.length; i++) {
            let itemText = `${i + 1}) ${player.inventory[i].fullName()}`;
            drawText(itemText, 20, false, 230 + i * 40, "aqua", 20);
        }
    }

    if (gameState == "stats") {
        drawUIBox();
        drawMainStats(player, centerX-200, centerY);
        drawSkillStats(player, centerX+100, centerY);
    }

    if (gameState == "useSelect") {

    }

    if (gameState == "viewmode") {
        drawText(`Tile Name: ${selectedTile.constructor.name}`, 20, false, 100, "white", 20)
        drawText(`Tile X: ${selectedTile.x}`, 20, false, 120, "white", 20)
        drawText(`Tile Y: ${selectedTile.y}`, 20, false, 140, "white", 20)
        drawText(`Liquid: ${selectedTile.liquid}`, 20, false, 180, "white", 20)
        drawText(`Liquid Volume: ${selectedTile.liquidVolume}`, 20, false, 200, "white", 20)
        drawText(`Liquid Capacity: ${selectedTile.liquidVolumeCapacity}`, 20, false, 220, "white", 20)
        if (selectedTile.monster != undefined) {
            drawText(`Monster Name: ${selectedTile.monster.constructor.name}`, 20, false, 260, "white", 20)
            drawText(`Monster Level: ${selectedTile.monster.level}`, 20, false, 280, "white", 20)
            drawText(`Monster HP: ${selectedTile.monster.hp}`, 20, false, 300, "white", 20)
        }

    }
}

function addPopups(txt, clr, target) {

    if (target.constructor.name == "Player") {
        let textPopup = { 
            text: txt,
            color: clr,
            timeout: 0,
            x: target.tile.x * tileSize + translateX,
            y: target.tile.y * tileSize + translateY,
            startTranslateX: translateX,
            startTranslateY: translateY
        };
        popupText.push(textPopup);
    } else {
        let textPopup = { 
            text: txt,
            color: "grey"/*clr*/,
            timeout: 0,
            x: target.tile.x * tileSize + translateX,
            y: target.tile.y * tileSize + translateY,
            startTranslateX: translateX,
            startTranslateY: translateY
        };
        if (target.tile.dist(player.tile) < 6) {
            popupText.push(textPopup);
        }
    }


}

function mouseCoords(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
}

function drawMainStats(target, x, y) {
    drawText("Main Stats:", 30, false, y - 140, "violet", x);

    drawText(`Strength: ${target.strength}`, 20, false, y - 10, "white", x)
    drawText(`Constitution: ${target.constitution}`, 20, false, y + 20, "white", x)
    drawText(`Perception: ${target.perception}`, 20, false, y + 50, "white", x)
    drawText(`Agility: ${target.agility}`, 20, false, y + 80, "white", x)
    drawText(`Arcane: ${target.arcane}`, 20, false, y + 110, "white", x)
    drawText(`Will: ${target.will}`, 20, false, y + 140, "white", x)
}

function drawSkillStats(target, x, y) {
    drawText("Skills:", 30, false, y - 140, "violet", x);

    drawText(`Fighting: ${target.fighting}`, 20, false, y - 10, "white", x)
    drawText(`Endurance: ${target.endurance}`, 20, false, y + 20, "white", x)
    drawText(`Dodge: ${target.dodge}`, 20, false, y + 50, "white", x)
    drawText(`Weapon Skill: ${target.weaponSkill}`, 20, false, y + 80, "white", x)
    drawText(`Magic: ${target.magic}`, 20, false, y + 110, "white", x)
}

function drawUIBox() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0+100, 0+100, canvas.width-200, canvas.height-200);
}

function check_dead() {
    for (let k = monsters.length - 1; k >= 0; k--) {
        if (monsters[k].dead) {
            // Xp gain
            player.xp = monsters[k].rare ? player.xp + monsters[k].xpPoints : player.xp + monsters[k].xpPoints + randomRange(0, 3);
            if (player.xp >= player.xpToLevel) {
                player.levelUp();
                player.xp = 0;
                player.xpToLevel = Math.floor(player.xpToLevel*1.25);
            }

            if (randomRange(1, 100) > 75) {
                dropItems(monsters[k]);
            }

            monsters.splice(k, 1);


        }
    }
}

function dropItems(monster) {
    monster.tile.items.push(items.food.meat);
}

function check_for_tick() {    
    tick();
}

function tick() {

    for (let i = 0; i < tiles.length; i++) {
        for (let j = 0; j < tiles.length; j++) {
            if (tiles[i][j].liquid == "Blood") {
                if (tiles[i][j].liquidVolume > tiles[i][j].liquidVolumeCapacity-100) {

                    if (roll(1, 100) > 50) {
                        let bloodToFlow = randomRange(Math.floor((tiles[i][j].liquidVolume - (tiles[i][j].liquidVolumeCapacity-100))/2), tiles[i][j].liquidVolume - (tiles[i][j].liquidVolumeCapacity-100));
                        let neigbours = shuffle(tiles[i][j].getAdjacentPassableNeighbours());
                        neigbours[0].liquid = tiles[i][j].liquid;
                        tiles[i][j].liquidVolume -= bloodToFlow;
                        neigbours[0].liquidVolume += bloodToFlow;
                    }

                }
            }
        }
    }

    if (monsters != undefined) {
        for (let k = monsters.length - 1; k >= 0; k--) {
            if (monsters[k].dead) {
                monsters.splice(k, 1);
            } else {
                monsters[k].update();
            }
        }
    }

    player.update();

    if (player.dead) {
        addScore(score, false);
        gameState = "dead";
    }


    if (player.cursed) {
        spawnCounter--;
        if (spawnCounter <= 0) {
            spawnMonster();
            spawnCounter = spawnRate;
            spawnRate--;
        }
    }
}

function showTitle() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameState = "title";

    drawText("Press 1 for Warrior, or 2 for Mage", 30, true, canvas.height / 2 - 200, "white");
    drawText("PROJECT", 40, true, canvas.height / 2 - 110, "white");
    drawText("HYPERION", 70, true, canvas.height / 2 - 50, "white");

    drawScores();
}

function startGame() {
    gameStarted = false;
    level = 1;
    score = 0;
    numSpells = 1;

    levelTiles = [];
    levelMonsters = [];
    startLevel(startingHp);
    gameStarted = true;

    gameState = "running";
}

function startLevel(playerHp, playerSpells, randomUpStairs, upOrDown) {
    spawnRate = 5;
    spawnCounter = spawnRate;

    if (gameStarted) {
        // Save player stats
        savePlayer();
    }

    let levelType = 0;
    if (level <= 5) {
        levelType = 0;
    } else if (level <= 10) {
        levelType = 4;
    } else {
        levelType = 2;
    }

    if (gameStarted) {
    }

    if(gameStarted) {
        if(levelTiles[level-1]) {
            levelMonsters[level-1+upOrDown] = monsters;
            loadLevel();
            monsters = levelMonsters[level-1];
            placePlayer(upOrDown);
        } else {
            levelMonsters[level-1+upOrDown] = monsters;
            generateLevel(levelType);
            placePlayer();
            placeStairs();
            placeDoors();
        }
    } else {
        generateLevel(levelType);
        placePlayer();
        placeStairs();
        placeDoors();
    }
 

    function placeDoors() {
        let doorsNumber = randomRange(0, 5); 
        for (let x = 0; x < doorsNumber; x++) {
            let doorTile = randomPassableTile();
            if (doorTile.constructor.name != "StairsUp" && doorTile.constructor.name != "StairsDown" && doorTile.monster == undefined) {
                doorTile.replace(ClosedDoor);
            }
        }
        
    }

    function placePlayer(upOrDown) {
        let playerRandomTile;


        if (upOrDown == 1) {
            for (let i = 0; i < levelTiles[level-1].length; i++) {
                for (let j = 0; j < levelTiles[level-1].length; j++) {
                    if (levelTiles[level-1][i][j].constructor.name == "StairsDown") {
                        playerRandomTile = levelTiles[level-1][i][j];
                    }
                }
            }
        }

        if (upOrDown == -1) {
            for (let i = 0; i < levelTiles[level-1].length; i++) {
                for (let j = 0; j < levelTiles[level-1].length; j++) {
                    if (levelTiles[level-1][i][j].constructor.name == "StairsUp") {
                        playerRandomTile = levelTiles[level-1][i][j];
                    }
                }
            }
        }

        if (upOrDown == undefined || playerRandomTile == undefined) { playerRandomTile = randomPassableTile(); }

        player = new Player(playerRandomTile, playerClass);
        playerRandomTile.monster = player;
        player.move(playerRandomTile);

        if (gameStarted) {
            // Restore player stats
            restorePlayer();
        }
    
        if (playerSpells) {
            player.spells = playerSpells;
        }    
    }

    function placeStairs() {
        // place stairs
        if (randomUpStairs) {
            randomPassableTile().replace(StairsUp);
        } else {
            let newTile = player.tile.replace(StairsUp);;
            newTile.monster = player;
            player.move(newTile);
        }

        tryTo('place stairs down', () => {
            let randomTile = randomPassableTile();
            if (randomTile.constructor.name == "StairsUp") {
                randomTile = randomPassableTile();
                if (randomTile.constructor.name == "StairsUp") {
                    randomTile = randomPassableTile();
                    if (randomTile.constructor.name == "StairsUp") {
                        return false
                    } else { randomTile.replace(StairsDown); return true; }
                } else { randomTile.replace(StairsDown); return true;}
            } else { randomTile.replace(StairsDown); return true; }
        })

        /*tryTo('place stairs down', () => {
            const randomTile = randomPassableTile();
            if (randomTile.constructor.name == "StairsUp") {
                randomPassableTile().replace(StairsDown);
                return true;
            } else {
                return false;
            }
 
        })*/
    }
}

function savePlayer() {
    playerMaxHealth = player.maxHealth;
    playerHp = player.hp;
    playerLevel = player.level;
    playerXp = player.xp;
    playerXpToLevel = player.xpToLevel;
    playerAttack = player.attack;
    playerDefense = player.defense;

    // main stats
    playerStrength = player.strength;
    playerConstitution = player.constitution;
    playerPerception = player.perception;
    playerAgility = player.agiity;
    playerArcane = player.arcane;
    playerWill = player.will;

    playerEvasion = player.evasion;

    playerStatuses = player.statuses;

    playerWeapon = player.weapon;
    playerArmor = player.armor;

    playerInventory = player.inventory;

}

function restorePlayer() {
    player.maxHealth = playerMaxHealth;
    player.hp = playerHp;
    player.level = playerLevel;
    player.xp = playerXp;
    player.xpToLevel = playerXpToLevel;
    player.attack = playerAttack;
    player.defense = playerDefense;

    // main stats
    player.strength = playerStrength;
    player.constitution = playerConstitution;
    player.perception = playerPerception;
    player.agiity = playerAgility;
    player.arcane = playerArcane;
    player.will = playerWill;
    
    player.evasion = playerEvasion;

    playerStatuses = player.statuses;

    player.weapon = playerWeapon;
    player.armor = playerArmor;
    player.rearm();

    player.inventory = playerInventory;
    
}

function drawText(text, size, centered, textY, color, textX, align) {
    ctx.fillStyle = color;
    ctx.font = `${size}px monospace`;
    if (!textX) {
        textX = centered ? (canvas.width-ctx.measureText(text).width)/2 : canvas.width - uiWidth * tileSize + 25;
    }

    if (align == "center") {
        ctx.textAlign = align;
    }

    ctx.fillText(text, textX, textY);
    ctx.textAlign = "left";
}

function screenshake() {

    if (shakeAmount) {
        shakeAmount--;
    }

    const shakeAngle = Math.random() * Math.PI*2;
    shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
    shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
}

/* ///////////////////
// score.js
*/ ///////////////////

function getScores() {
    return localStorage.scores ? JSON.parse(localStorage.scores) : [];
}

function addScore(score, won) {
    const scores = getScores();
    const scoreObject = {score, run: 1, totalScore: score, active: won};
    const lastScore = scores.pop();

    if (lastScore) {
        if (lastScore.active) {
            scoreObject.run = lastScore.run + 1;
            scoreObject.totalScore += lastScore.totalScore;
        } else {
            scores.push(lastScore);
        }
    }
    scores.push(scoreObject);

    localStorage.scores = JSON.stringify(scores);
}

function drawScores() {
    const scores = getScores();
    if (!scores.length) {
        return;
    }
    drawText(
        rightPad(["RUN", "SCORE", "TOTAL"]),
        18,
        true,
        canvas.height / 2,
        "white"
    );

    const newestScore = scores.pop();
    scores.sort((a, b) => b.totalScore - a.totalScore);
    scores.unshift(newestScore);

    for (let i = 0; i < Math.min(10, scores.length); i++) {
        const scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
        drawText(
            scoreText,
            18,
            true,
            canvas.height / 2 + 24 + i * 24,
            i == 0 ? "aqua" : "violet"
        );
    }
}

/* ///////////////////
// sound.js
*/ ///////////////////

function initSounds() {
    sounds = {
        hit1: new Audio('sounds/hit1.wav'),
        hit2: new Audio('sounds/hit2.wav'),
        treasure: new Audio('sounds/treasure.wav'),
        newLevel: new Audio('sounds/newLevel.wav'),
        spell: new Audio('sounds/spell.wav'),
        trap: new Audio('sounds/trap.wav'),
        trapdoor: new Audio('sounds/trapdoor.wav'),
        healthUp: new Audio('sounds/healthUp.wav'),
        move: new Audio('sounds/move.wav'),
        firebolt: new Audio('sounds/firebolt.wav'),
    }
    sounds.hit1.volume = 0.1;
    sounds.hit2.volume = 0.1;
    sounds.treasure.volume = 0.1;
    sounds.newLevel.volume = 0.1;
    sounds.spell.volume = 0.1;
    sounds.trap.volume = 0.1;
    sounds.trapdoor.volume = 0.1;
    sounds.healthUp.volume = 0.1;
    sounds.move.volume = 0.1;
    sounds.firebolt.volume = 0.1;
}

function playSound(soundName) {
    sounds[soundName].currentTime = 0;
    sounds[soundName].play();
}