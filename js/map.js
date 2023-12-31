function generateLevel() {
    tryTo('generate map', function() {
        return generateTiles() == randomPassableTile().getConnectedTiles().length;
    })

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

function generateTiles() {
    let passableTiles=0;
    tiles = [];
    for (let i = 0; i < numTiles; i++) {
        tiles[i] = [];
        for (let j = 0; j < numTiles; j++) {
            if (Math.random() < 0.3 || !inBounds(i, j)) {
                tiles[i][j] = new Wall(i, j);
            } else {
                tiles[i][j] = new Floor(i, j);
                passableTiles++;
            }
        }
    }
    return passableTiles;
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
    let monsterType = shuffle([Spider, Worm, Snake, Zombie, Skeleton, RedDrake, GreenSlime])[0];
    let monster = new monsterType(randomPassableTile());
    if (rare) {
        monster.upgrade(Math.floor(level / 3));
    }
    monsters.push(monster);
}