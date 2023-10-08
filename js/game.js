function setupCanvas() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    ctx.imageSmoothingEnabled = false;

    viewport = {
        x: 0,
        y: 0,
        zoom: 1
    };
}

function drawSprite(sprite, x, y) {
    ctx.drawImage(
        spritesheet,
        sprite*16,
        0,
        16,
        16,
        x*tileSize + shakeX,
        y*tileSize + shakeY,
        tileSize,
        tileSize
    )
}

function draw() {
    if (!(gameState == "running" || gameState == "dead" || gameState == "spells" || gameState == "stats")) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.save();
    ctx.translate(-player.getDisplayX() * tileSize + (canvas.width / 2) - (tileSize/2), -player.getDisplayY() * tileSize + (canvas.height / 2) - (tileSize/2));

    screenshake();

    const seenTiles = [];

    for (let i = 0; i < numTiles; i++) {
        for (let j = 0; j < numTiles; j++) {
            const target = getTile(i, j);
            const distance = (Math.max(Math.abs(target.x - player.tile.x), Math.abs(target.y - player.tile.y)))

            if (distance == 3) {
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


    for (let i = 0; i < numTiles; i++) {
        for (let j = 0; j < numTiles; j++) {
            if (getTile(i, j).known && !seenTiles.includes(getTile(i, j))) {
                getTile(i, j).draw();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(getTile(i, j).x * tileSize, getTile(i, j).y * tileSize, tileSize, tileSize);
            }
        }
    }

    for (const monster of monsters) {
        if (seenTiles.includes(monster.tile)) {
            monster.draw();
        }
    }

    player.draw();

    let centerY = player.getDisplayY() * tileSize;
    let centerX = player.getDisplayX() * tileSize - 350;

    drawText(`Depth: ${level}`, 30, false, centerY - 230, "violet", centerX);
    drawText(`Score: ${score}`, 30, false, centerY - 200, "violet", centerX);

    if (gameState == "running") {

        drawText(`Level: ${player.level} ${player.xp}/${player.xpToLevel}`, 20, false, centerY - 140, "yellow", centerX)
        drawText(`Health: ${player.hp}`, 20, false, centerY - 110, "red", centerX)
        drawText(`Weapon: ${player.weaponDamage[0]}d${player.weaponDamage[1]}`, 20, false, centerY - 80, "white", centerX)
        drawText(`AV / EV: ${player.armorClass}/${player.evasionClass}`, 20, false, centerY - 40, "white", centerX)

        drawText("Status:", 30, false, centerY + 180, "violet", centerX);


        for (let i = 0; i < player.statuses.length; i++) {
            const statusText = (`${player.statuses[i].constructor.name} (${player.statuses[i].duration})`);
            drawText(statusText, 20, false, centerY + 210 + i * 30, "aqua", centerX);
              
        }
    }

    if (gameState == "spells") {
        drawText("Spells:", 30, false, centerY - 170, "violet", centerX);

        for (let i = 0; i < numSpells; i++) {
            const spellText = `${i + 1}) ${player.spells[i] || "--- "}`;
            drawText(spellText, 20, false, centerY - 140 + i * 40, "aqua", centerX);
        }
    }

    if (gameState == "stats") {
        drawUIBox();
        drawMainStats(player, centerX-50, centerY);
        drawSkillStats(player, centerX+50, centerY);
    }

    ctx.restore();
}

function drawMainStats(target, x, y) {
    drawText("Main Stats:", 30, false, y - 170, "violet", x);

    drawText(`Strength: ${target.strength}`, 20, false, y - 10, "white", x)
    drawText(`Constitution: ${target.constitution}`, 20, false, y + 20, "white", x)
    drawText(`Perception: ${target.perception}`, 20, false, y + 50, "white", x)
    drawText(`Agility: ${target.agility}`, 20, false, y + 80, "white", x)
    drawText(`Arcane: ${target.arcane}`, 20, false, y + 110, "white", x)
    drawText(`Will: ${target.will}`, 20, false, y + 140, "white", x)
}

function drawSkillStats(target, x, y) {
    drawText("Skills:", 30, false, y - 170, "violet", x);

    drawText(`Fighting: ${target.fighting}`, 20, false, y - 10, "white", x)
    drawText(`Endurance: ${target.endurance}`, 20, false, y + 20, "white", x)
    drawText(`Dodge: ${target.dodge}`, 20, false, y + 50, "white", x)
    drawText(`Weapon Skill: ${target.weaponSkill}`, 20, false, y + 80, "white", x)
    drawText(`Magic: ${target.magic}`, 20, false, y + 110, "white", x)
}

function drawUIBox() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0+100, 0+150, canvas.width-100, canvas.height-150);
}

function check_dead() {
    for (let k = monsters.length - 1; k >= 0; k--) {
        if (monsters[k].dead) {
            // Xp gain
            player.xp = monsters[k].rare ? player.xp + monsters[k].xpPoints : player.xp + monsters[k].xpPoints + randomRange(0, 3);
            if (player.xp >= player.xpToLevel) {
                player.levelUp();
                player.xp = 0;
                player.xpToLevel *= 2;
            }

            monsters.splice(k, 1);


        }
    }
}

function check_for_tick() {    
    tick();
}

function tick() {
    for (let k = monsters.length - 1; k >= 0; k--) {
        if (monsters[k].dead) {
            monsters.splice(k, 1);
        } else {
            monsters[k].update();
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
    startLevel(startingHp);
    gameStarted = true;

    gameState = "running";
}

function startLevel(playerHp, playerSpells, randomUpStairs) {
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
        levelType = 1;
    } else {
        levelType = 2;
    }

    if (gameStarted) {
    }

    if(gameStarted) {
        if(levelTiles[level-1]) {
            loadLevel();
            placePlayer();
        } else {
            generateLevel(levelType);
            placePlayer();
            placeStairs();
        }
    } else {
        generateLevel(levelType);
        placePlayer();
        placeStairs();
    }
 

    function placePlayer() {
        const playerRandomTile = randomPassableTile();
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
            player.tile.replace(StairsUp);
        }

        tryTo('place stairs down', () => {
            const randomTile = randomPassableTile();
            if (randomTile.constructor.name == "StairsUp") {
                randomPassableTile().replace(StairsDown);
                return true;
            } else {
                return false;
            }
 
        })
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

        playerWeaponDamage = player.weaponDamage;
        playerEvasion = player.evasion;

        playerStatuses = player.statuses;
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
    
        player.weaponDamage = playerWeaponDamage;
        player.evasion = playerEvasion;

        playerStatuses = player.statuses;
}

function drawText(text, size, centered, textY, color, textX) {
    ctx.fillStyle = color;
    ctx.font = `${size}px monospace`;
    if (!textX) {
        textX = centered ? (canvas.width-ctx.measureText(text).width)/2 : canvas.width - uiWidth * tileSize + 25;
    }

    ctx.fillText(text, textX, textY);
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