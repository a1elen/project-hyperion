function generateLevel(levelGen) {

    let wallChance = 0.3;
    if (levelGen == 0) {
        wallChance = 0.3;
        tryTo('generate map', () => generateCellular(wallChance, levelGen) == randomPassableTile().getConnectedTiles().length)
    } else if (levelGen == 1 || levelGen == 2) {
        wallChance = 0.45
        tryTo('generate map', () => generateCellular(wallChance, levelGen) == randomPassableTile().getConnectedTiles().length)
        /*tryTo('generate map', () => {
            passableTilesCount = generateCellular(wallChance, levelGen);
            iterateCellular(5, levelGen);
            const passables = randomPassableTile().getConnectedTiles();

            for (let i = 0; i < numTiles; i++) {
                for (let j = 0; j < numTiles; j++) {
                    if (!passables.includes(tiles[i][j])) {
                        if (levelGen == 0) {
                            tiles[i][j].replace(Wall, 3);
                        } else if (levelGen == 1) {
                            tiles[i][j].replace(Wall, 33);
                        } else if (levelGen == 2) {
                            tiles[i][j].replace(Wall, 35);
                        }
                        
                    }
                }
            }

            return passableTilesCount == passables.length;
        })*/
    } else {
        generateDirectional();
    }

    generateMonsters();

    const treasureNumber = clamp(Math.floor(level / 2) + 1, 1, randomRange(2, 4));
    //const scrollNumber = clamp(Math.floor(level / 2) + 1, 0, randomRange(1, 2));
    
    generateTraps(randomRange(1, 5));

    //for (let i = 0; i < scrollNumber; i++) {
        //randomPassableTile().trap = true;
    //}

    generateItems(randomRange(clamp(Math.floor(level / 2) + 5, 1, 10), 20));
    generateObjects(randomRange(0, 5));
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
    for (let i = 0; i < numTiles; i++) {
        tiles[i] = [];
    }
    
    //tiles = [];
    for (let i = 0; i < numTiles; i++) {
        //tiles[i] = [];
        for (let j = 0; j < numTiles; j++) {
            tiles[i][j] = new Wall(i, j, 33);
        }
    }

    for (let i = 0; i < numberOfYCaves; i++) {
        let length = randomRange(10, 20);
        let roughness = randomRange(1, 100); // 1 to 100
        let windyness = randomRange(1, 100); // 1 to 100

        let startX = randomRange(3, numTiles-3);
        let startY = numTiles-2;
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
                } else if (x > numTiles - 3) {
                    x = numTiles - 3;
                }
            }
            fillRect(x, y, x+width, y);
        }
    }
    
    for (let i = 0; i < numberOfXCaves; i++) {
        let length = randomRange(10, 20);
        let roughness = randomRange(1, 100); // 1 to 100
        let windyness = randomRange(1, 100); // 1 to 100

        let startX = 0+2;
        let startY = randomRange(3, numTiles-3);
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
                } else if (y > numTiles - 3) {
                    y = numTiles - 3;
                }
            }

            fillRect(x, y, x, y-width);

        }
    }

}

function generateTraps(numberOfTraps) {
    for (let i = 0; i < numberOfTraps; i++) {
        randomPassableTile().traps.push(getRandomTrap());
    }
}

function fillRect(x1, y1, x2, y2) {
    for (let i = x1; i <= x2; i++) {
        for (let j = y1; j >= y2; j--) {
            //tiles[i][j] = new Floor(i, j, 32);
            if (tiles[i] != undefined) {
                if (tiles[i][j] != undefined) {
                    tiles[i][j].replace(Floor, 32);
                }

            }
        }
    }
}

function generateItems(numberOfItems) {
    for (let i = 0; i < numberOfItems; i++) {
        randomPassableTile().items.push(getRandomItem());
    }
}

function generateObjects(numberOfObjects) {
    for (let i = 0; i < numberOfObjects; i++) {
        randomPassableTile().objects.push(getRandomObject());
    }
}

function getRandomObject() {
    let objects = []
    let object;

    barrel = {
        name: "Barrel",
        sprite: 64
    }
    objects.push(barrel);

    bookshelf = {
        name: "Bookshelf",
        sprite: 71
    }
    objects.push(bookshelf);

    spider_cocoon = {
        name: "Spider Cocoon",
        sprite: 68
    }
    objects.push(spider_cocoon);

    coffin = {
        name: "Coffin",
        sprite: 69
    }
    objects.push(coffin);

    object = shuffle(objects)[0];
    return object;
}

function getRandomTrap() {

    let traps = [];

    beartrap = {
        name: "Bear Trap",
        sprite: 28,
        visible: false,
        sound: "trap",
        use(monster) {
            playSound(this.sound);



            addStatus("Bleeding", randomRange(2, 5), monster);
            addStatus("Stunned", randomRange(2, 5), monster);
            addPopups("Skirr!", "white", monster);
            addPopups("Bleed!", "red", monster);
            addPopups("Stun!", "yellow", monster);

            this.blood = true;
            const neighbours = monster.tile.getAdjacentNeighbours();
            for (const neighbour of neighbours) {
                if (!neighbour.passable && randomRange(1, 3) == 3) {
                    neighbour.wallBlood = true;
                }
            }

            this.visible = true;

            this.disarm(monster.tile);

        },
        disarm(target) {
            beartrap_item = {
                name: "Bear Trap",
                type: "trap",
                sprite: 29,
                get() {
                    player.inventory.push(this);
                    return true;
                }
            }
            target.items.push(beartrap_item)
            target.traps.splice(target.traps.indexOf(this));
        }
    };
    traps.push(beartrap);

    trapdoor = {
        name: "Trapdoor",
        sprite: 31,
        visible: false,
        sound: "trapdoor",
        use(monster) {
            playSound(this.sound);

            if (monster == player) {
                saveLevel();
                level++;
                startLevel(Math.min(maxHp, player.hp-5), player.spells, true);
                player.hit(10);
                player.bleed();
            } else {
                monster.hit(9999);
            }

            shakeAmount = 50;

            this.visible = true;
        }
    };
    traps.push(trapdoor);

    pressure_plate = {
        name: "Pressure plate",
        sprite: 72,
        visible: false,
        sound: "trapdoor",
        use(monster) {
            playSound(this.sound);

            monster.move(randomPassableTile());

            shakeAmount = 50;

            this.visible = true;
        },
        disarm(target) {
            target.traps.splice(target.traps.indexOf(this));
        }
    };
    traps.push(pressure_plate);

    cobweb = {
        name: "Cobweb",
        sprite: 67,
        visible: true,
        //sound: "trapdoor",
        use(monster) {
            addStatus("Stunned", 5, monster);
            addPopups("Webbed!", "white", monster);

            shakeAmount = 10;

            this.visible = true;

            if (roll(1, 20) > 15) {
                this.disarm(monster.tile);
            }
        },
        disarm(target) {
            target.traps.splice(target.traps.indexOf(this));
        }
    };
    traps.push(cobweb);

    let trap = shuffle(traps)[0];

    if (roll(1, 20) > 15) {
        trap.visible = true;
    }

    return trap;
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
            player.inventory.push(this);
            return true;
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
            //player.wield(this);
            player.inventory.push(this);
            return true;
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
            //player.wield(this);
            player.inventory.push(this);
            return true;
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
            //player.wield(this);
            player.inventory.push(this);
            return true;
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
            //player.wield(this);
            player.inventory.push(this);
            return true;
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
            //player.wield(this);
            player.inventory.push(this);
            return true;
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

    /*body_armor = {
        name: "Leather Chestplate",
        type: "body_armor",
        sprite: 44,
        av: randomRange(2, 5),
        ev: randomRange(1, 5),
        get() {
            player.wear(this);
            return true;
        }
    };*/

    gold = {
        name: "Gold",
        type: "coin",
        sprite: 12,
        amount: randomRange(5, 25),
        get() {
            score += randomRange(9, 21);
            playSound("treasure");
            return true;
        }
    };

    magicScroll = {
        name: "Scroll of ???",
        type: "scroll",
        sprite: 18,
        get() { 
            if (player.inventory.length < player.inventory_space) {
                player.inventory.push(this);
                return true;
            } else {
                return false;
            }
        }
    }

    magicBook = {
        name: "Magic Book of ???",
        type: "book",
        sprite: 57,
        get() { 
            if (player.spells.length < numSpells) {
                player.addSpell();
                return true;
            } else {
                return false;
            }
        }
    }

    pickaxe = {
        name: "Pickaxe",
        type: "tool",
        sprite: 56,
        get() { 
            if (player.inventory.length < player.inventory_space) {
                player.inventory.push(this);
                return true;
            } else {
                return false;
            }
        }
    }

    weapon.quality = getQuality(weapon);
    body_armor.quality = getQuality(body_armor);
    
    item_pool.push(makeSword(), makeAxe(), makeHammer(), makeStaff(), body_armor, gold, magicScroll, magicBook, pickaxe, items.food.apple)

    item = shuffle(item_pool)[0];

    return item;
}

function saveLevel() {
    levelTiles[level-1] = tiles;
}

function loadLevel() {
    tiles = levelTiles[level-1];
}

function generateCellular(wallChance, levelType) {
    let passableTiles=0;

    // clean level
    tiles = [];
    for (let i = 0; i < numTiles; i++) {
        tiles[i] = [];
    }

    //tiles = [];
    for (let i = 0; i < numTiles; i++) {
        //tiles[i] = [];
        for (let j = 0; j < numTiles; j++) {
            if (Math.random() < wallChance || !inBounds(i, j)) {
                if (levelType == 0) {
                    tiles[i][j] = new Wall(i, j, 3);
                } else if (levelType == 1) {
                    tiles[i][j] = new Wall(i, j, 33);
                } else if(levelType == 2) {
                    tiles[i][j] = new Wall(i, j, 35);
                }
            } else {
                if (levelType == 0) {
                    tiles[i][j] = new Floor(i, j, 2);
                } else if (levelType == 1) {
                    tiles[i][j] = new Floor(i, j, 32);
                } else if (levelType == 2) {
                    tiles[i][j] = new Floor(i, j, 34);
                }
                passableTiles++;
            }
        }
    }
    return passableTiles;
}

function iterateCellular(count, levelType) {
    for(let c = 0; c < count; c++) {
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                const neighbours = tiles[i][j].getAdjacentPassableNeighbours();
                if (tiles[i][j].passable) {
                    if(neighbours >= 5); {
                        //tiles[i][j] = null;
                        if (levelType == 0) {
                            tiles[i][j] = tiles[i][j].replace(Wall, 3);
                        } else if (levelType == 1) {
                            tiles[i][j] = tiles[i][j].replace(Wall, 33);
                        } else if (levelType == 2) {
                            tiles[i][j] = tiles[i][j].replace(Wall, 35);
                        }
                        
                    }
                } else {
                    if(neighbours < 5); {
                        if (levelType == 0) {
                            tiles[i][j] = tiles[i][j].replace(Floor, 2);
                        } else if (levelType == 1) {
                            tiles[i][j] = tiles[i][j].replace(Floor, 32);
                        } else if (levelType == 2) {
                            tiles[i][j] = tiles[i][j].replace(Floor, 34)
                        }
                    }
                }
            }
        }
    }
}

function inBounds(x, y) {
    return x > 0 && y > 0 && x < numTiles - 1 && y < numTiles - 1;
}

function getTile(x, y) {
    if (inBounds(x, y)) {
        return tiles[x][y];
    }

    if (tiles[x] == undefined) {
        const newWall = new Wall(x, y, 36);
        //newWall.known = true;
        tiles[x] = [];
        tiles[x][y] = newWall;
        //tiles[x][y] = new Wall(x, y, 36);
        return tiles[x][y];
        //return newWall;
    } else if (tiles[x][y] == undefined) {
        const newWall = new Wall(x, y, 36);
        tiles[x][y] = newWall;
        //newWall.known = true;
        //tiles[x][y] = new Wall(x, y, 36);
        return tiles[x][y];
        //return newWall;
    } else {
        return tiles[x][y];
    }
}

function randomPassableTile() {
    let tile;
    tryTo('get random passable tile', () => {
        const x = randomRange(0, numTiles-1);
        const y = randomRange(0, numTiles-1);
        tile = getTile(x, y);
        return tile.passable && !tile.monster;
    })
    return tile;
}

function generateMonsters() {
    monsters = [];
    const numMonsters = Math.floor(level / 5) + randomRange(2, 5);
    const numberOfRare = Math.floor(level / 5);
    for (let i = 0; i < numMonsters; i++) {
        if (i < numberOfRare) {
            spawnMonster(true);
        } else {
            spawnMonster(false);
        }
    }
}

function spawnMonster(rare) {
    let monsterType;
    if (level <= 5) {
        monsterType = shuffle([Spider, Snake, GreenSlime, Mouse])[0];
    } else if (level <= 10) {
        monsterType = shuffle([StoneGolem, Zombie, Skeleton, Worm])[0];
    } else if (level <= 15) {
        monsterType = shuffle([GoblinSpear, GoblinRanger, GoblinSwordsman, RedDragonBaby])[0];
    } else {
        monsterType = shuffle([Spider, Worm, Snake, Zombie, Skeleton, RedDragonBaby, GreenSlime, Mouse, StoneGolem, GoblinRanger, GoblinSpear, GoblinSwordsman])[0];
    }
    
    
    const monster = new monsterType(randomPassableTile());
    if (rare) {
        const amount = (Math.floor(level / 5)+1) * randomRange(10, 30);
        for (let i = 0; i < amount; i++) {
            monster.levelUp();
            monster.rare = true;
        }
    } else if (level > 1) {
        const amount = (Math.floor(level / 5)+1) * randomRange(0, 5);
        for (let i = 0; i < amount; i++) {
            monster.levelUp();
        }
    }
    monsters.push(monster);
}