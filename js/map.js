isLevelXL = false;

function pickLevelDimensions() {
    if (randomRange(1, 100) <= 10) {
        isLevelXL = true;
        levelWidth = randomRange(18, 30) * 2;
        levelHeight = randomRange(16, 26) * 2;
    } else {
        isLevelXL = false;
        levelWidth = randomRange(18, 30);
        levelHeight = randomRange(16, 26);
    }
}

function levelMinDim() {
    return Math.min(levelWidth, levelHeight);
}

function tryAddItemToTile(tile, item) {
    if (!tile || item == undefined) return false;
    if (tile.items.length >= tile.itemCapacity) return false;
    tile.items.push(item);
    return true;
}

function scatterRandomHoles() {
    const count = randomRange(0, 3);
    for (let k = 0; k < count; k++) {
        tryTo("scatter hole", () => {
            const t = randomPassableTile();
            const n = t.constructor.name;
            if (n === "StairsUp" || n === "StairsDown" || n === "Hole") return false;
            if (t.monster) return false;
            t.replace(Hole);
            return true;
        });
    }
}

function generateLevel(levelGen) {

    pickLevelDimensions();
    levelPool[level-1].levelgen();
    scatterRandomHoles();


    generateMonsters();

    const treasureNumber = clamp(Math.floor(level / 2) + 1, 1, randomRange(2, 4));
    
    generateTraps(randomRange(1, 5));

    generateItems(randomRange(3, 6));
    generateObjects(randomRange(1, 5));
    generateDecorativeObjects();
}

function initBiomes() {
    underground = {
        levelGen: function() {generateCellular();},
        monsters: []
    }

    caves = {
        levelGen: function() {generateDirectional();},
        monsters: []
    }
}

function generateDirectional() {
    let passableTiles=0;

    let numberOfYCaves = randomRange(1, 3);
    let numberOfXCaves = randomRange(0, 3);

    // clean level
    tiles = [];
    for (let i = 0; i < levelWidth; i++) {
        tiles[i] = [];
    }
    
    for (let i = 0; i < levelWidth; i++) {
        for (let j = 0; j < levelHeight; j++) {
            tiles[i][j] = new Wall(i, j, SPRITES.WALL_CHASM);
        }
    }

    for (let i = 0; i < numberOfYCaves; i++) {
        let length = randomRange(10, levelMinDim() - 4);
        let roughness = randomRange(1, 100); // 1 to 100
        let windyness = randomRange(1, 100); // 1 to 100

        let startX = randomRange(3, levelWidth - 3);
        let startY = levelHeight - 2;
        let startWidth = 3;

        fillRect(startX-1, startY+1, startX+1, startY-1);

        let x = startX;
        let y = startY;
        let width = startWidth;
        let maxWidth = 10;

        while (startY - y != length) {
            y--;

            let randomRoughness;
            if (randomRange(1, 100) < roughness) {
                switch(roll(1, 4)) {
                    case 1: randomRoughness = -2; break;
                    case 2: randomRoughness = -1; break;
                    case 3: randomRoughness =  1; break;
                    case 4: randomRoughness =  2; break;
                }
                width += randomRoughness;
                if (width < 3) {
                    width = 3;
                } else if (width > maxWidth) {
                    width = maxWidth;
                }
            }

            let randomWindyness;
            if (randomRange(1, 100) < windyness) {
                switch(roll(1, 4)) {
                    case 1: randomWindyness = -2; break;
                    case 2: randomWindyness = -1; break;
                    case 3: randomWindyness =  1; break;
                    case 4: randomWindyness =  2; break;
                }
                x += randomWindyness;
                if (x < 0) {
                    x = 0;
                    } else if (x > levelWidth - 3) {
                        x = levelWidth - 3;
                    }
                }
                fillRect(x, y, x+width, y);
            }
        }
    
    for (let i = 0; i < numberOfXCaves; i++) {
        let length = randomRange(10, levelMinDim() - 4);
        let roughness = randomRange(1, 100); // 1 to 100
        let windyness = randomRange(1, 100); // 1 to 100

        let startX = 0+2;
        let startY = randomRange(3, levelHeight - 3);
        let startWidth = 3;

        fillRect(startX-1, startY+1, startX+1, startY-1);

        let x = startX;
        let y = startY;
        let width = startWidth;
        let maxWidth = 10;

        while (x - startX != length) {
            x++;

            let randomRoughness;
            if (randomRange(1, 100) < roughness) {
                switch(roll(1, 4)) {
                    case 1: randomRoughness = -2; break;
                    case 2: randomRoughness = -1; break;
                    case 3: randomRoughness =  1; break;
                    case 4: randomRoughness =  2; break;
                }
                width += randomRoughness;
                if (width < 3) {
                    width = 3;
                } else if (width > maxWidth) {
                    width = maxWidth;
                }
            }

            let randomWindyness;
            if (randomRange(1, 100) < windyness) {
                switch(roll(1, 4)) {
                    case 1: randomWindyness = -2; break;
                    case 2: randomWindyness = -1; break;
                    case 3: randomWindyness =  1; break;
                    case 4: randomWindyness =  2; break;
                }
                y += randomWindyness;
                if (y < 0) {
                    y = 0;
                } else if (y > levelHeight - 3) {
                    y = levelHeight - 3;
                }
            }

            fillRect(x, y, x, y-width);

        }
    }

}

function generateTraps(numberOfTraps) {
    for (let i = 0; i < numberOfTraps; i++) {
        const t = getRandomTrap();
        if (t.category === "trap" && t.name === "Spiketrap") {
            t.loaded = true;
            t.sprite = SPRITES.SPIKETRAP_LOADED;
        }
        const tile = randomPassableTile();
        if (tile.monster) continue;
        if (tile.objects.some(o => o.category === "trap")) continue;
        tile.objects.push(t);
    }
}

function fillRect(x1, y1, x2, y2) {
    for (let i = x1; i <= x2; i++) {
        for (let j = y1; j >= y2; j--) {
            //tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_CHASM);
            if (tiles[i] != undefined) {
                if (tiles[i][j] != undefined) {
                    tiles[i][j].replace(Floor, SPRITES.FLOOR_DUNGEON_2);
                }

            }
        }
    }
}

function generateItems(numberOfItems) {
    for (let i = 0; i < numberOfItems; i++) {
        tryTo("place item", () => tryAddItemToTile(randomPassableTile(), getRandomItem()));
    }
}

function generateObjects(numberOfObjects) {
    for (let i = 0; i < numberOfObjects; i++) {
        randomPassableTile().objects.push(getRandomObject());
    }
}
function generateDecorativeObjects() {
    if (randomRange(1, 2) == 1) return;

    for (let i = 0; i < randomRange(0, 6); i++) {
        let chosenItem;

        if (randomRange(1, 2) == 1) {
            chosenItem = items.tools.bone;
        } else {
            chosenItem = items.tools.skull;
        }

        tryAddItemToTile(randomPassableTile(), chosenItem);
    }
}
function getRandomObject() {
    let objectsPool = levelPool[level-1].objPool;
    return Object.create(shuffle(objectsPool)[0]);
}

function getRandomTrap() {
    let trapsPool = levelPool[level-1].trapsPool;
    let chosenTrap = Object.create(shuffle(trapsPool)[0]);

    if (roll(1, 20) > 15) {
        chosenTrap.visible = true;
    }

    return chosenTrap;
}

function getQuality(item) {
    if (item.type == "weapon") {
        let randomNumber = randomRange(1, 5);

        switch (randomNumber) {
            case 1: item.damage_max-=2; return "Junk"; break;
            case 2: item.damage_max-=1; return "Rusted"; break;
            case 3: return "Normal"; break;
            case 4: item.damage_max+=1; return "Sharp"; break;
            case 5: item.damage_max+=2; return "Masterpiece"; break;
        }
    }

    if (item.type == "body_armor") {
        let randomNumber = randomRange(1, 5);

        switch (randomNumber) {
            case 1: item.av-=2; item.ev-=2; return "Junk"; break;
            case 2: item.av-=1; item.ev-=1; return "Rusted"; break;
            case 3: return "Normal"; break;
            case 4: item.av+=1; item.ev+=1; return "Sharp"; break;
            case 5: item.av+=2; item.ev+=2; return "Masterpiece"; break;
        }
    }
}

function initBodyArmor() {
    let body_armors = [];

    body_armor = {
        name: "Copper Chestplate",
        type: "body_armor",
        sprite: 58,
        av: 3,
        ev: 3,
        quality: "normal",
        get() {
            player.wear(this);
            return true;
        }
    };
    body_armors.push(body_armor);

    body_armor = {
        name: "Bronze Chestplate",
        type: "body_armor",
        sprite: 59,
        av: 4,
        ev: 3,
        quality: "normal",
        get() {
            player.wear(this);
            return true;
        }
    };
    body_armors.push(body_armor);

    body_armor = {
        name: "Iron Chestplate",
        type: "body_armor",
        sprite: 60,
        av: 5,
        ev: 5,
        quality: "normal",
        get() {
            player.wear(this);
            return true;
        }
    };
    body_armors.push(body_armor);

    body_armor = {
        name: "Silver Chestplate",
        type: "body_armor",
        sprite: 62,
        av: 6,
        ev: 5,
        quality: "normal",
        get() {
            player.wear(this);
            return true;
        }
    };
    body_armors.push(body_armor);

    body_armor = {
        name: "Gold Chestplate",
        type: "body_armor",
        sprite: 61,
        av: 7,
        ev: 5,
        quality: "normal",
        get() {
            player.wear(this);
            return true;
        }
    };
    body_armors.push(body_armor);

    body_armor = {
        name: "Steel Chestplate",
        type: "body_armor",
        sprite: 63,
        av: 8,
        ev: 6,
        quality: "normal",
        get() {
            player.wear(this);
            return true;
        }
    };
    body_armors.push(body_armor);

    return body_armors;
}

function initSwords() {
    let swords = [];

    weapon = {
        name: "Copper Sword",
        type: "weapon",
        sprite: 51,
        damage_min: 1,
        damage_max: 3,
        quality: "normal",
        get() {
            //player.wield(this);
            // Check if identical item already exists in inventory
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            // If no identical item found, add as new
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                addPopups("Not enough space", "white", player);
            }
        }
    };
    swords.push(weapon);

    weapon = {
        name: "Bronze Sword",
        type: "weapon",
        sprite: 52,
        damage_min: 1,
        damage_max: 5,
        quality: "normal",
        get() {
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                addPopups("Not enough space", "white", player);
            }
        }
    };
    swords.push(weapon);

    weapon = {
        name: "Iron Sword",
        type: "weapon",
        sprite: 53,
        damage_min: 2,
        damage_max: 5,
        quality: "normal",
        get() {
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                addPopups("Not enough space", "white", player);
            }
        }
    };
    swords.push(weapon);

    weapon = {
        name: "Silver Sword",
        type: "weapon",
        sprite: 55,
        damage_min: 1,
        damage_max: 7,
        quality: "normal",
        get() {
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                addPopups("Not enough space", "white", player);
            }
        }
    };
    swords.push(weapon);

    weapon = {
        name: "Gold Sword",
        type: "weapon",
        sprite: 54,
        damage_min: 2,
        damage_max: 6,
        quality: "normal",
        get() {
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                addPopups("Not enough space", "white", player);
            }
        }
    };
    swords.push(weapon);

    weapon = {
        name: "Steel Sword",
        type: "weapon",
        sprite: 43,
        damage_min: 2,
        damage_max: 7,
        quality: "normal",
        get() {
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                addPopups("Not enough space", "white", player);
            }
        }
    };
    swords.push(weapon);

    return swords;
}

function getRandomItem() {

    // weapon materials: copper, bronze, iron, silver, gold, steel
    // armor materials, copper, bronze, iron, silver, gold, steel

    let item;
    let item_pool = [];

    weapon = shuffle(initSwords())[0];

    body_armor = shuffle(initBodyArmor())[0];

    gold = {
        name: "Gold",
        type: "coin",
        sprite: 700,
        amount: randomRange(5, 25),
        get() {
            score += randomRange(9, 21);
            playSound("treasure");
            return true;
        }
    };

    magicScroll = {
        spell: shuffle(Object.keys(spells))[0],
        name: "Scroll of " + this.spell,
        type: "scroll",
        sprite: 800,
        get() { 
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                return false;
            }
        },
        fullName() {
            this.name = "Scroll of " + this.spell;
            return this.name;
        }
    }

    magicBook = {
        spell: shuffle(Object.keys(spells))[0],
        name: "Magic Book of " + this.spell,
        type: "book",
        sprite: 750,
        get() { 
            if (player.spells.length < numSpells) {
                player.addSpell(this.spell);
                return true;
            } else {
                return false;
            }
        },
        fullName() {
            this.name = "Magic Book of " + this.spell;
            return this.name;
        }
    }

    pickaxe = {
        name: "Pickaxe",
        type: "tool",
        sprite: 56,
        get() { 
            for (let existingItem of player.inventory) {
                if (areItemsIdentical(this, existingItem)) {
                    existingItem.quantity = (existingItem.quantity || 1) + 1;
                    addPopups("Picked up " + this.name, "white", player);
                    return true;
                }
            }
            if (player.inventory.length < player.inventory_space) {
                this.quantity = 1;
                player.inventory.push(this);
                addPopups("Picked up " + this.name, "white", player);
                return true;
            } else {
                return false;
            }
        }
    }

    weapon.quality = getQuality(weapon);
    body_armor.quality = getQuality(body_armor);
    
    item_pool.push(makeSword(randomRange(0, 4), randomRange(0, 1)), makeAxe(), makeHammer(), makeQuarterstaff(), makeBodyarmor(), gold, magicScroll, magicBook, items.weapons.pickaxe, items.tools.skull, items.tools.bone, items.food.potato, makeTorch(), makeLantern())

    item = shuffle(item_pool)[0];

    return item;
}

function saveLevel() {
    // Clear monster references from tiles to prevent invisible player blocking
    for (let i = 0; i < tiles.length; i++) {
        for (let j = 0; j < tiles[i].length; j++) {
            if (tiles[i][j]) {
                tiles[i][j].monster = null;
            }
        }
    }
    levelTiles[level-1] = tiles;
}

function loadLevel() {
    tiles = levelTiles[level-1];
    if (!tiles || tiles.length === 0) {
        // Fallback if level data is corrupted or missing
        console.error("Level data corrupted or missing for level " + level + ". Generating fallback level.");
        tiles = [];
        for (let i = 0; i < levelWidth; i++) {
            tiles[i] = [];
            for (let j = 0; j < levelHeight; j++) {
                tiles[i][j] = new Wall(i, j, SPRITES.WALL_UNDERGROUND);
            }
        }
        return;
    }
    levelWidth = tiles.length;
    levelHeight = tiles[0] ? tiles[0].length : levelHeight;
}

function generateCellular(wallChance, levelType) {
    let passableTiles=0;

    // clean level
    tiles = [];
    for (let i = 0; i < levelWidth; i++) {
        tiles[i] = [];
    }

    //tiles = [];
    for (let i = 0; i < levelWidth; i++) {
        //tiles[i] = [];
        for (let j = 0; j < levelHeight; j++) {
            if (Math.random() < wallChance || !inBounds(i, j)) {
                if (levelType == 0) {
                    tiles[i][j] = new Wall(i, j, SPRITES.WALL_UNDERGROUND);
                } else if (levelType == 1) {
                    tiles[i][j] = new Wall(i, j, SPRITES.WALL_CHASM);
                } else if(levelType == 2) {
                    tiles[i][j] = new Wall(i, j, SPRITES.WALL_CAVE);
                }
            } else {
                if (levelType == 0) {
                    tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_UNDERGROUND);
                } else if (levelType == 1) {
                    tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_CHASM);
                } else if (levelType == 2) {
                    tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_CAVE);
                }
                passableTiles++;
            }
        }
    }
    return passableTiles;
}

function iterateCellular(count, levelType) {
    for(let c = 0; c < count; c++) {
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                const neighbours = tiles[i][j].getAdjacentPassableNeighbours();
                if (tiles[i][j].passable) {
                    if(neighbours >= 5); {
                        if (levelType == 0) {
                            tiles[i][j] = tiles[i][j].replace(Wall, SPRITES.WALL_UNDERGROUND);
                        } else if (levelType == 1) {
                            tiles[i][j] = tiles[i][j].replace(Wall, SPRITES.WALL_CHASM);
                        } else if (levelType == 2) {
                            tiles[i][j] = tiles[i][j].replace(Wall, SPRITES.WALL_CAVE);
                        }
                        
                    }
                } else {
                    if(neighbours < 5); {
                        if (levelType == 0) {
                            tiles[i][j] = tiles[i][j].replace(Floor, SPRITES.FLOOR_UNDERGROUND);
                        } else if (levelType == 1) {
                            tiles[i][j] = tiles[i][j].replace(Floor, SPRITES.FLOOR_CHASM);
                        } else if (levelType == 2) {
                            tiles[i][j] = tiles[i][j].replace(Floor, SPRITES.FLOOR_CAVE);
                        }
                    }
                }
            }
        }
    }
}

function inBounds(x, y) {
    return x > 0 && y > 0 && x < levelWidth - 1 && y < levelHeight - 1;
}

function getTile(x, y) {
    if (inBounds(x, y)) {
        return tiles[x][y];
    }

    if (tiles[x] == undefined) {
        const newWall = new Wall(x, y, SPRITES.WALL_CAVE);
        tiles[x] = [];
        tiles[x][y] = newWall;
        return tiles[x][y];
    } else if (tiles[x][y] == undefined) {
        const newWall = new Wall(x, y, SPRITES.WALL_CAVE);
        tiles[x][y] = newWall;
        return tiles[x][y];
    } else {
        return tiles[x][y];
    }
}

function randomPassableTile(allowHole) {
    let tile;
    tryTo('get random passable tile', () => {
        const x = randomRange(0, levelWidth - 1);
        const y = randomRange(0, levelHeight - 1);
        tile = getTile(x, y);
        if (!tile.passable || tile.monster) return false;
        if (!allowHole && tile.constructor.name === "Hole") return false;
        return true;
    })
    return tile;
}

function generateMonsters() {
    monsters = [];

    // Check if this is the goblin hideout boss level
    let isGoblinBossLevel = (levelPool[level-1] === BIOMES.goblinHideout) &&
                           (level === levelPool.length || levelPool[level] !== BIOMES.goblinHideout);

    if (isGoblinBossLevel) {
        // Spawn Goblin Chieftain in the center (throne room)
        let centerX = Math.floor(levelWidth / 2);
        let centerY = Math.floor(levelHeight / 2);
        let bossTile = getTile(centerX, centerY);
        if (bossTile && bossTile.passable) {
            const chieftain = new GoblinChieftain(bossTile);
            monsters.push(chieftain);
        }
        return; // Don't spawn other monsters on boss level
    }

    // Check if this is a goblin hideout level (for group spawning)
    let isGoblinHideout = (levelPool[level-1] === BIOMES.goblinHideout);

    if (isGoblinHideout) {
        // Spawn goblins in groups in rooms
        // Find all floor tiles that are part of rooms (not central area or tunnels)
        let roomTiles = [];
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                if (tiles[i][j].passable && tiles[i][j].sprite === SPRITES.FLOOR_GOBLIN_HIDEOUT_2) {
                    roomTiles.push(tiles[i][j]);
                }
            }
        }

        // Group room tiles into rooms (adjacent tiles)
        let rooms = [];
        let visited = new Set();

        for (let tile of roomTiles) {
            let key = `${tile.x},${tile.y}`;
            if (!visited.has(key)) {
                let room = [];
                let queue = [tile];
                visited.add(key);

                while (queue.length > 0) {
                    let current = queue.shift();
                    room.push(current);

                    let neighbors = current.getAdjacentNeighbours();
                    for (let neighbor of neighbors) {
                        if (neighbor.passable && neighbor.sprite === SPRITES.FLOOR_GOBLIN_HIDEOUT_2) {
                            let nKey = `${neighbor.x},${neighbor.y}`;
                            if (!visited.has(nKey)) {
                                visited.add(nKey);
                                queue.push(neighbor);
                            }
                        }
                    }
                }
                if (room.length > 0) {
                    rooms.push(room);
                }
            }
        }

        // Spawn 3-6 goblins in each room
        for (let room of rooms) {
            let numGoblins = randomRange(3, 6);
            for (let i = 0; i < numGoblins && i < room.length; i++) {
                let monsterType = shuffle(levelPool[level-1].monsterPool)[0];
                let monster = new monsterType(room[i]);
                monsters.push(monster);
            }
        }
    } else {
        // Normal monster spawning for other biomes
        const numMonsters = Math.floor(level / 5) + randomRange(2, 5);
        let numberOfRare;

        if (randomRange(1, 100) < 10) {
            numberOfRare = randomRange(1, 2);
        }

        if (randomRange(1, 2) == 1) spawnOODMonster();

        for (let i = 0; i < numMonsters; i++) {
            if (i < numberOfRare) {
                spawnMonster(true);
            } else {
                spawnMonster(false);
            }
        }
    }
}

function spawnOODMonster() {
    let ood = level + 3;
    if (ood > levelPool.length-1) ood = levelPool.length-1;

    let monsterType = shuffle(levelPool[ood].monsterPool)[0];
    const monster = new monsterType(randomPassableTile());
    const amount = (level + randomRange(5, 10));
    for (let i = 0; i < amount; i++) {
        monster.levelUp();
        monster.rare = true;
    }
    monsters.push(monster);
}

function spawnMonster(rare) {
    let monsterType = shuffle(levelPool[level-1].monsterPool)[0];

    //monsterType = shuffle([Spider, Worm, Snake, Zombie, Skeleton, RedDragonBaby, GreenSlime, Mouse, StoneGolem, GoblinRanger, GoblinSpear, GoblinSwordsman])[0];
    
    const monster = new monsterType(randomPassableTile());
    if (rare) {
        monsterType = shuffle(levelPool[level].monsterPool)[0];
        const amount = (level + randomRange(5, 10));
        for (let i = 0; i < amount; i++) {
            monster.levelUp();
            monster.rare = true;
        }
    } else if (level > 1) {
        const amount = (level + randomRange(0, 2));
        for (let i = 0; i < amount; i++) {
            monster.levelUp();
        }
    }
    monsters.push(monster);
}