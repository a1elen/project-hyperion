biome = {
    name: "level"
}

BIOMES = {};

BIOMES.underground = Object.create(biome);
BIOMES.underground.name = "Underground";
BIOMES.underground.monsterPool = [Spider, Snake, GreenSlime, Mouse];
BIOMES.underground.objPool = [objects.usable.barrel, objects.usable.campfire, objects.decorative.standingTorchLit];
BIOMES.underground.trapsPool = [traps.beartrap, traps.trapdoor, traps.tripwire];
BIOMES.underground.levelgen = function() {
    let wallChance = 0.3;
    let levelType = 0;
        let passableTiles=0;
    
        // clean level
        tiles = [];
        for (let i = 0; i < levelWidth; i++) {
            tiles[i] = [];
        }
    
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                if (Math.random() < wallChance || !inBounds(i, j)) {
                    if (levelType == 0) {
                        tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_1);
                    } else if (levelType == 1) {
                        tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_2);
                    } else if(levelType == 2) {
                        tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_3);
                    }
                } else {
                    if (levelType == 0) {
                        tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_DUNGEON_1);
                    } else if (levelType == 1) {
                        tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_DUNGEON_2);
                    } else if (levelType == 2) {
                        tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_DUNGEON_3);
                    }
                    passableTiles++;
                }
            }
        }
        return passableTiles;
}

BIOMES.chasm = Object.create(biome);
BIOMES.chasm.name = "Chasm";
BIOMES.chasm.monsterPool = [Spider, Snake, GreenSlime, Mouse];
BIOMES.chasm.objPool = [objects.usable.barrel, objects.usable.campfire, objects.decorative.standingTorchLit];
BIOMES.chasm.trapsPool = [traps.beartrap, traps.trapdoor];
BIOMES.chasm.levelgen = function() {
    tiles = [];
    for (let i = 0; i < levelWidth; i++) {
        tiles[i] = [];
    }


    let wallChance = 0.45;

    // Spawn walls randomly
    for (let i = 0; i < levelWidth; i++) {
        for (let j = 0; j < levelHeight; j++) {
            if (Math.random() < wallChance || !inBounds(i, j)) {
                tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_1);
            } else {
                tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_DUNGEON_1);

            }
        }
    }

    // iterate
    let iterations = 4;
    for (let i = 0; i < iterations; i++) {
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                let neighbours = tiles[i][j].getAdjacentNeighbours().filter(t => !t.passable);
                if (tiles[i][j].passable) { // if its a floor
                    if (neighbours.length >= 5) {
                        tiles[i][j].replace(Wall, SPRITES.WALL_DUNGEON_1);
                    }
                } else { // if its a wall
                    if (neighbours.length < 4) {
                        tiles[i][j].replace(Floor, SPRITES.FLOOR_DUNGEON_1);
                    }
                }
                
            }
        }
    }

    // Ensure all rooms are connected by tunnels
    connectAllRegions();
}

function connectAllRegions() {
    // Find all passable tiles
    let passableTiles = [];
    for (let i = 0; i < levelWidth; i++) {
        for (let j = 0; j < levelHeight; j++) {
            if (tiles[i][j].passable) {
                passableTiles.push(tiles[i][j]);
            }
        }
    }

    if (passableTiles.length === 0) return;

    // Find all disconnected regions
    let regions = [];
    let visited = new Set();

    for (let tile of passableTiles) {
        let key = `${tile.x},${tile.y}`;
        if (!visited.has(key)) {
            let region = tile.getConnectedTiles();
            regions.push(region);
            for (let r of region) {
                visited.add(`${r.x},${r.y}`);
            }
        }
    }

    // If only one region, all rooms are already connected
    if (regions.length <= 1) return;

    // Connect all regions to the first (main) region
    let mainRegion = regions[0];
    for (let i = 1; i < regions.length; i++) {
        let region = regions[i];
        connectRegions(mainRegion, region);
    }
}

function connectRegions(regionA, regionB) {
    // Find closest tiles between the two regions
    let closestPair = null;
    let minDist = Infinity;

    for (let tileA of regionA) {
        for (let tileB of regionB) {
            let dist = tileA.dist(tileB);
            if (dist < minDist) {
                minDist = dist;
                closestPair = [tileA, tileB];
            }
        }
    }

    if (!closestPair) return;

    // Carve tunnel between the two closest tiles
    let start = closestPair[0];
    let end = closestPair[1];
    carveTunnel(start, end);
}

function carveTunnel(start, end) {
    let x = start.x;
    let y = start.y;
    let endX = end.x;
    let endY = end.y;

    // Carve horizontal then vertical (L-shaped tunnel)
    while (x !== endX) {
        if (x < endX) x++;
        else x--;
        if (inBounds(x, y) && !tiles[x][y].passable) {
            tiles[x][y].replace(Floor, SPRITES.FLOOR_DUNGEON_1);
        }
    }

    while (y !== endY) {
        if (y < endY) y++;
        else y--;
        if (inBounds(x, y) && !tiles[x][y].passable) {
            tiles[x][y].replace(Floor, SPRITES.FLOOR_DUNGEON_1);
        }
    }
}

BIOMES.caves = Object.create(biome);
BIOMES.caves.name = "Caves";
BIOMES.caves.monsterPool = [StoneGolem, Zombie, Skeleton, Worm];
BIOMES.caves.objPool = [objects.usable.spiderCocoon, objects.decorative.standingTorchLit];
BIOMES.caves.trapsPool = [traps.cobweb, traps.spiketrap];
BIOMES.caves.levelgen = function() {
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
                tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_2);
            }
        }
    
        for (let i = 0; i < numberOfYCaves; i++) {
            let length = randomRange(10, levelMinDim() - 4);
            let roughness = randomRange(1, 100); // 1 to 100
            let windyness = randomRange(1, 100); // 1 to 100
    
            let startX = randomRange(3, levelWidth-3);
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

BIOMES.tunnel = Object.create(biome);
BIOMES.tunnel.name = "Tunnel";
BIOMES.tunnel.monsterPool = [StoneGolem, Zombie, Skeleton, Worm];
BIOMES.tunnel.objPool = [objects.usable.spiderCocoon, objects.decorative.standingTorchLit];
BIOMES.tunnel.trapsPool = [traps.cobweb, traps.spiketrap];
BIOMES.tunnel.levelgen = function() {
        let passableTiles=0;
    
        let numberOfYCaves = 1;
        let numberOfXCaves = 1;
    
        // clean level
        tiles = [];
        for (let i = 0; i < levelWidth; i++) {
            tiles[i] = [];
        }
        
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_2);
            }
        }
    
        for (let i = 0; i < numberOfYCaves; i++) {
            let length = levelMinDim() - 4;
            let roughness = randomRange(1, 100); // 1 to 100
            let windyness = randomRange(1, 100); // 1 to 100
    
            let startX = randomRange(3, levelWidth-3);
            let startY = levelHeight - 2;
            let startWidth = 3;
    
            fillRect(startX-1, startY+1, startX+1, startY-1);
    
            let x = startX;
            let y = startY;
            let width = startWidth;
            let maxWidth = 5;
    
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
            let length = levelMinDim() - 4;
            let roughness = randomRange(1, 100); // 1 to 100
            let windyness = randomRange(1, 100); // 1 to 100
    
            let startX = 0+2;
            let startY = randomRange(3, levelHeight - 3);
            let startWidth = 3;
    
            fillRect(startX-1, startY+1, startX+1, startY-1);
    
            let x = startX;
            let y = startY;
            let width = startWidth;
            let maxWidth = 5;
    
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

BIOMES.dungeon = Object.create(biome);
BIOMES.dungeon.name = "Dungeon";
BIOMES.dungeon.monsterPool = [GoblinSpear, GoblinRanger, GoblinSwordsman, RedDragonBaby];
BIOMES.dungeon.objPool = [objects.usable.bookshelf, objects.usable.coffin, objects.usable.weaponStand, objects.decorative.standingTorchLit];
BIOMES.dungeon.trapsPool = [traps.pressurePlate, traps.trapdoor, traps.tripwire, traps.spiketrap];
BIOMES.dungeon.levelgen = function() {
    let wallChance = 0.45;
    let levelType = 2;
        let passableTiles=0;
    
        // clean level
        tiles = [];
        for (let i = 0; i < levelWidth; i++) {
            tiles[i] = [];
        }
    
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                if (Math.random() < wallChance || !inBounds(i, j)) {
                    if (levelType == 0) {
                        tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_1);
                    } else if (levelType == 1) {
                        tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_2);
                    } else if(levelType == 2) {
                        tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_3);
                    }
                } else {
                    if (levelType == 0) {
                        tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_DUNGEON_1);
                    } else if (levelType == 1) {
                        tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_DUNGEON_2);
                    } else if (levelType == 2) {
                        tiles[i][j] = new Floor(i, j, SPRITES.FLOOR_DUNGEON_3);
                    }
                    passableTiles++;
                }
            }
        }
        return passableTiles;
}

BIOMES.maze = Object.create(biome);
BIOMES.maze.name = "Maze";
BIOMES.maze.monsterPool = [GoblinSpear, GoblinRanger, GoblinSwordsman, RedDragonBaby];
BIOMES.maze.objPool = [objects.usable.bookshelf, objects.usable.weaponStand, objects.decorative.standingTorchLit];
BIOMES.maze.trapsPool = [traps.pressurePlate, traps.tripwire, traps.spiketrap];
BIOMES.maze.levelgen = function() {
    let wallChance = 0.45;
    let levelType = 2;
        let passableTiles=0;
    
        // clean level
        tiles = [];
        for (let i = 0; i < levelWidth; i++) {
            tiles[i] = [];
        }
    
        for (let i = 0; i < levelWidth; i++) {
            for (let j = 0; j < levelHeight; j++) {
                tiles[i][j] = new Wall(i, j, SPRITES.WALL_DUNGEON_3);
            }
        }

        tiles[1][1].replace(Floor, SPRITES.WALL_DUNGEON_3);
        carvePassage(1, 1);

        function carvePassage(x, y) {
            let checks = [checkRight, checkLeft, checkDown, checkUp];

            checks = shuffle(checks);

            checks.forEach((direction) => direction(x,y));

            function checkRight(x, y) {
                if (inBounds(x+2, y) && !tiles[x+2][y].passable) {
                    tiles[x+1][y].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    tiles[x+2][y].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    carvePassage(x+2, y);
                }
    
            }
    
            function checkLeft(x, y) {
                if (inBounds(x-2, y) && !tiles[x-2][y].passable) {
                    tiles[x-1][y].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    tiles[x-2][y].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    carvePassage(x-2, y);
                }
            }
    
            function checkDown(x, y) {
                if (inBounds(x, y+2) && !tiles[x][y+2].passable) {
                    tiles[x][y+1].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    tiles[x][y+2].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    carvePassage(x, y+2);
                }
            }
    
            function checkUp(x, y) {
                if (inBounds(x, y-2) && !tiles[x][y-2].passable) {
                    tiles[x][y-1].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    tiles[x][y-2].replace(Floor, SPRITES.FLOOR_DUNGEON_3);
                    carvePassage(x, y-2);
                }
            }
        }

        

        return passableTiles;
}
