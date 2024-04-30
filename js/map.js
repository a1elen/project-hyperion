function generateLevel(levelGen) {
    let wallChance = 0.3;
    if (levelGen == 0) {
        wallChance = 0.3;
        tryTo('generate map', () => generateCellular(wallChance, levelGen) == randomPassableTile().getConnectedTiles().length)
    } else {
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
    }

    generateMonsters();

    const treasureNumber = clamp(Math.floor(level / 2) + 1, 1, randomRange(2, 4));
    //const scrollNumber = clamp(Math.floor(level / 2) + 1, 0, randomRange(1, 2));
    
    generateTraps(randomRange(1, 5));

    //for (let i = 0; i < scrollNumber; i++) {
        //randomPassableTile().trap = true;
    //}

    generateItems(randomRange(clamp(Math.floor(level / 2) + 5, 1, 10), 20));
}

function generateTraps(numberOfTraps) {
    for (let i = 0; i < numberOfTraps; i++) {
        randomPassableTile().traps.push(getRandomTrap());
    }
}

function generateItems(numberOfItems) {
    for (let i = 0; i < numberOfItems; i++) {
        randomPassableTile().items.push(getRandomItem());
    }
}

function getRandomTrap() {
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
        }
    };

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
            } else {
                monster.hit(9999);
            }

            shakeAmount = 50;

            this.visible = true;
        }
    };

    let trap;

    let randomNumber = randomRange(1,4)
    if (randomNumber == 1) {
        trap = beartrap;
    } else if (randomNumber == 2) {
        trap = beartrap;
        trap.visible = true;
    } else if (randomNumber == 3) {
        trap = trapdoor;
    } else if (randomNumber == 4) {
        trap = trapdoor;
        trap.visible = true;
    }

    return trap;
}

function getRandomItem() {

    // weapon materials: wood, iron, copper, bronze, silver, gold, steel
    // armor materials, leather, iron, copper, bronze, silver, gold, steel

    weapon = {
        name: "Iron Sword",
        type: "weapon",
        sprite: 43,
        damage_min: 1,
        damage_max: randomRange(4, 8),
        get() {
            player.wield(this);
            return true;
        }
    };

    armor = {
        name: "Leather Chestplate",
        type: "body_armor",
        sprite: 44,
        av: randomRange(2, 5),
        ev: randomRange(1, 5),
        get() {
            player.wear(this);
            return true;
        }
    };

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
        name: "Scroll",
        type: "scroll",
        sprite: 18,
        get() { 
            if (player.spells.length < numSpells) {
                player.addSpell();
                return true;
            } else {
                return false;
            }
        }
    }

    let item;

    let randomNumber = randomRange(1,4)
    if (randomNumber == 1) {
        item = weapon;
    } else if (randomNumber == 2) {
        item = armor;
    } else if (randomNumber == 3) {
        item = gold;
    } else if (randomNumber == 4) {
        item = magicScroll;
    }

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