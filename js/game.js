function setupCanvas() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = tileSize * (numTiles + uiWidth);
    canvas.height = tileSize * numTiles;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    ctx.imageSmoothingEnabled = false;
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
    if (gameState == "running" || gameState == "dead" || gameState == "spells") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        screenshake();

        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                getTile(i, j).draw();
            }
        }

        for (let i = 0; i < monsters.length; i++) {
            monsters[i].draw();
        }

        player.draw();

        drawText("Level: " + level, 30, false, 40, "violet");
        drawText("Score: " + score, 30, false, 70, "violet");

        if (gameState == "running") {
            drawText("Stats:", 30, false, 130, "violet");

            drawText("XP Level: " + player.level + " " + player.xp + "/" + player.xpToLevel, 20, false, 170, "yellow")
            drawText("Health: " + player.hp, 20, false, 200, "red")
            drawText("Attack: " + player.attack + " + " + player.bonusAttack, 20, false, 230, "white")
            drawText("Defense: " + player.defense, 20, false, 260, "white")

            drawText("Strength: " + player.strength, 20, false, 290, "white")
            drawText("Constitution: " + player.constitution, 20, false, 320, "white")
            drawText("Perception: " + player.perception, 20, false, 350, "white")
            drawText("Agility: " + player.agiity, 20, false, 380, "white")
            drawText("Arcane: " + player.arcane, 20, false, 410, "white")
            drawText("Will: " + player.will, 20, false, 440, "white")

            drawText("Status:", 30, false, 500, "violet");


            for (let i = 0; i < player.statuses.length; i++) {
                let statusText = (player.statuses[i].constructor.name + " (" + player.statuses[i].duration + ")");
                drawText(statusText, 20, false, 540 + i * 30, "aqua");
              
            }
            /*if (player.stunned) {
                drawText("Stunned! (" + (player.stunCounter + 1) + ")", 20, false, 390, "aqua")
            }*/
        }

        if (gameState == "spells") {
            drawText("Spells:", 30, false, 130, "violet");

            for (let i = 0; i < /*player.spells.length*/numSpells; i++) {
                let spellText = (i + 1) + ") " + (player.spells[i] || "--- ");
                drawText(spellText, 20, false, 170 + i * 40, "aqua");
            }
        }
    }
}

function check_dead() {
    for (let k = monsters.length - 1; k >= 0; k--) {
        if (monsters[k].dead) {
            // Xp gain
            if (monsters[k].rare) {
                player.xp = player.xp + monsters[k].xpPoints;
            } else {
                player.xp = player.xp + monsters[k].xpPoints + randomRange(0, 3);
            }
            if (player.xp >= player.xpToLevel) {
                player.levelUp();
                player.xp = 0;
                player.xpToLevel = player.xpToLevel * 2;
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
        if (!monsters[k].dead) {
            monsters[k].update();
        } else {
            monsters.splice(k, 1);
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
    spawnRate = 10;
    spawnCounter = spawnRate;

    if (gameStarted) {
        // Save player stats
        savePlayer();
    }

    let levelType = 0;
    if (level > 5) {
        levelType = 1;
    } else {
        levelType = 0;
    }

    if (gameStarted) {
        saveLevel();
    }

    if(!gameStarted) {
        generateLevel(levelType);
        placePlayer();
        placeStairs();
    } else {
        if(levelTiles[level-1].length > 0) {
            loadLevel();
            placePlayer();
        } else {
            generateLevel(levelType);
            placePlayer();
            placeStairs();
        }
    }
 

    function placePlayer() {
        let playerRandomTile = randomPassableTile();
        player = new Player(playerRandomTile, playerClass);
        
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

        randomPassableTile().replace(StairsDown);
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
}

function drawText(text, size, centered, textY, color, textX) {
    ctx.fillStyle = color;
    ctx.font = size + "px monospace";
    if (!textX) {
        if (centered) {
            textX = (canvas.width-ctx.measureText(text).width)/2;
        } else {
            textX = canvas.width - uiWidth * tileSize + 25;
        }
    }

    ctx.fillText(text, textX, textY);
}

function getScores() {
    if (localStorage["scores"]) {
        return JSON.parse(localStorage["scores"]);
    } else {
        return [];
    }
}

function addScore(score, won) {
    let scores = getScores();
    let scoreObject = {score: score, run: 1, totalScore: score, active: won};
    let lastScore = scores.pop();

    if (lastScore) {
        if (lastScore.active) {
            scoreObject.run = lastScore.run + 1;
            scoreObject.totalScore += lastScore.totalScore;
        } else {
            scores.push(lastScore);
        }
    }
    scores.push(scoreObject);

    localStorage["scores"] = JSON.stringify(scores);
}

function drawScores() {
    let scores = getScores();
    if (scores.length) {
        drawText(
            rightPad(["RUN", "SCORE", "TOTAL"]),
            18,
            true,
            canvas.height / 2,
            "white"
        );

        let newestScore = scores.pop();
        scores.sort(function(a, b) {
            return b.totalScore - a.totalScore;
        });
        scores.unshift(newestScore);

        for (let i = 0; i < Math.min(10, scores.length); i++) {
            let scoreText = rightPad([scores[i].run, scores[i].score, scores[i].totalScore]);
            drawText(
                scoreText,
                18,
                true,
                canvas.height / 2 + 24 + i * 24,
                i == 0 ? "aqua" : "violet"
            );
        }
    }
}

function screenshake() {
    if (shakeAmount) {
        shakeAmount--;
    }
    let shakeAngle = Math.random() * Math.PI*2;
    shakeX = Math.round(Math.cos(shakeAngle) * shakeAmount);
    shakeY = Math.round(Math.sin(shakeAngle) * shakeAmount);
}

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