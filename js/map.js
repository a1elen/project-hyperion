function generateLevel() {
    let levelType = 1;
    let wallChance = 0.3;
    if (levelType == 0) {
        wallChance = 0.3;
        tryTo('generate map', function() {
            return generateCellular(wallChance) == randomPassableTile().getConnectedTiles().length;
        })
    } else {
        wallChance = 0.45
        tryTo('generate map', function() {
            return generateCellular(wallChance) == randomPassableTile().getConnectedTiles().length;
        })
        iterateCellular(5);
    }

    generateMonsters();

    let treasureNumber = clamp(Math.floor(level / 2) + 1, 1, randomRange(2, 4));
    let scrollNumber = clamp(Math.floor(level / 2) + 1, 0, randomRange(1, 3));
    let trapNumber = clamp(Math.floor(level / 2) + 1, 0, randomRange(1, 5));
    

    for (let i = 0; i < treasureNumber; i++) {
        randomPassableTile().treasure = true;
    }

    for (let i = 0; i < scrollNumber; i++) {
        randomPassableTile().scroll = true;
    }

    for (let i = 0; i < scrollNumber; i++) {
        randomPassableTile().trap = true;
    }
}

function generateCellular(wallChance) {
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
                tiles[i][j] = new Wall(i, j);
            } else {
                tiles[i][j] = new Floor(i, j);
                passableTiles++;
            }
        }
    }
    return passableTiles;
}

function iterateCellular(count) {
    for(let c = 0; c < count; c++) {
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                if (tiles[i][j].passable) {
                    if(tiles[i][j].getAdjacentPassableNeighbours() >= 5); {
                        tiles[i][j] = null;
                        tiles[i][j] = new Wall(i, j);
                    }
                } else {
                    if(tiles[i][j].getAdjacentPassableNeighbours() < 5); {
                        tiles[i][j] = null;
                        tiles[i][j] = new Floor(i, j);
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
    } else {
        return new Wall(x, y);
    }
}

function randomPassableTile() {
    let tile;
    tryTo('get random passable tile', function() {
        let x = randomRange(0, numTiles-1);
        let y = randomRange(0, numTiles-1);
        tile = getTile(x, y);
        return tile.passable && !tile.monster;
    })
    return tile;
}

function generateMonsters() {
    monsters = [];
    let numMonsters = Math.floor(level / 3) + 1;
    let numberOfRare = Math.floor(level / 3);
    for (let i = 0; i < numMonsters; i++) {
        if (i < numberOfRare) {
            spawnMonster(true);
        }
        spawnMonster(false);
    }
}

function spawnMonster(rare) {
    let monsterType;
    if (level <= 3) {
        monsterType = shuffle([Spider, Worm, GreenSlime])[0];
    } else if (level <= 5) {
        monsterType = shuffle([Snake, Zombie, Skeleton])[0];
    } else if (level <= 10) {
        monsterType = shuffle([Zombie, Skeleton, RedDragonBaby])[0];
    } else {
        monsterType = shuffle([Spider, Worm, Snake, Zombie, Skeleton, RedDragonBaby, GreenSlime])[0];
    }
    
    
    let monster = new monsterType(randomPassableTile());
    if (rare) {
        monster.upgrade(Math.floor(level / 3));
    }
    monsters.push(monster);
}