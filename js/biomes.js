/*class Biome {
    constructor() {

    }
}

class Underground extends Biome {
    constructor() {
        this.name = "Underground";
        this.monsterPool = [Spider, Snake, GreenSlime, Mouse];
        this.objPool = [objects.usable.barrel, objects.usable.campfire];
        this.trapsPool = [traps.beartrap, traps.trapdoor];
    }

    levelgen() {
        let wallChance = 0.3;
        let levelType = 0;
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
}

class Chasm extends Biome {
    constructor() {
        this.name = "Chasm";
        this.monsterPool = [Spider, Snake, GreenSlime, Mouse];
        this.objPool = [objects.usable.barrel, objects.usable.campfire];
        this.trapsPool = [traps.beartrap, traps.trapdoor];
    }

    levelgen() {
        tiles = [];
        for (let i = 0; i < numTiles; i++) {
            tiles[i] = [];
        }


        let wallChance = 0.45;

        // Spawn walls randomly
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                if (Math.random() < wallChance || !inBounds(i, j)) {
                    tiles[i][j] = new Wall(i, j, 3);
                } else {
                    tiles[i][j] = new Floor(i, j, 2);

                }
            }
        }

        // iterate
        let iterations = 4;
        for (let i = 0; i < iterations; i++) {
            for (let i = 0; i < numTiles; i++) {
                for (let j = 0; j < numTiles; j++) {
                    let neighbours = tiles[i][j].getAdjacentNeighbours().filter(t => !t.passable);
                    if (tiles[i][j].passable) { // if its a floor
                        if (neighbours.length >= 5) {
                            tiles[i][j].replace(Wall, 3);
                        }
                    } else { // if its a wall
                        if (neighbours.length < 4) {
                            tiles[i][j].replace(Floor, 2);
                        }
                    }
                    
                }
            }
        }
    }
}

class Caves extends Biome {
    constructor() {
        this.name = "Caves";
        this.monsterPool = [StoneGolem, Zombie, Skeleton, Worm];
        this.objPool = [objects.usable.spiderCocoon];
        this.trapsPool = [traps.cobweb];
    }

    levelgen() {
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
            let length = randomRange(10, numTiles-4);
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
            let length = randomRange(10, numTiles-4);
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

class Dungeon extends Biome {
    constructor() {
        this.name = "Dungeon";
        this.monsterPool = [GoblinSpear, GoblinRanger, GoblinSwordsman, RedDragonBaby];
        this.objPool = [objects.usable.bookshelf, objects.usable.coffin];
        this.trapsPool = [traps.pressurePlate, traps.trapdoor];
    }

    levelgen() {
        let wallChance = 0.45;
        let levelType = 2;
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
}*/

biome = {
    name: "level"
}

BIOMES = {};

BIOMES.underground = Object.create(biome);
BIOMES.underground.name = "Underground";
BIOMES.underground.monsterPool = [Spider, Snake, GreenSlime, Mouse];
BIOMES.underground.objPool = [objects.usable.barrel, objects.usable.campfire];
BIOMES.underground.trapsPool = [traps.beartrap, traps.trapdoor, traps.tripwire];
BIOMES.underground.levelgen = function() {
    let wallChance = 0.3;
    let levelType = 0;
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

BIOMES.chasm = Object.create(biome);
BIOMES.chasm.name = "Chasm";
BIOMES.chasm.monsterPool = [Spider, Snake, GreenSlime, Mouse];
BIOMES.chasm.objPool = [objects.usable.barrel, objects.usable.campfire];
BIOMES.chasm.trapsPool = [traps.beartrap, traps.trapdoor];
BIOMES.chasm.levelgen = function() {
    tiles = [];
    for (let i = 0; i < numTiles; i++) {
        tiles[i] = [];
    }


    let wallChance = 0.45;

    // Spawn walls randomly
    for (let i = 0; i < numTiles; i++) {
        for (let j = 0; j < numTiles; j++) {
            if (Math.random() < wallChance || !inBounds(i, j)) {
                tiles[i][j] = new Wall(i, j, 3);
            } else {
                tiles[i][j] = new Floor(i, j, 2);

            }
        }
    }

    // iterate
    let iterations = 4;
    for (let i = 0; i < iterations; i++) {
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                let neighbours = tiles[i][j].getAdjacentNeighbours().filter(t => !t.passable);
                if (tiles[i][j].passable) { // if its a floor
                    if (neighbours.length >= 5) {
                        tiles[i][j].replace(Wall, 3);
                    }
                } else { // if its a wall
                    if (neighbours.length < 4) {
                        tiles[i][j].replace(Floor, 2);
                    }
                }
                
            }
        }
    }
}

BIOMES.caves = Object.create(biome);
BIOMES.caves.name = "Caves";
BIOMES.caves.monsterPool = [StoneGolem, Zombie, Skeleton, Worm];
BIOMES.caves.objPool = [objects.usable.spiderCocoon];
BIOMES.caves.trapsPool = [traps.cobweb, traps.spiketrap];
BIOMES.caves.levelgen = function() {
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
            let length = randomRange(10, numTiles-4);
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
            let length = randomRange(10, numTiles-4);
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

BIOMES.tunnel = Object.create(biome);
BIOMES.tunnel.name = "Tunnel";
BIOMES.tunnel.monsterPool = [StoneGolem, Zombie, Skeleton, Worm];
BIOMES.tunnel.objPool = [objects.usable.spiderCocoon];
BIOMES.tunnel.trapsPool = [traps.cobweb, traps.spiketrap];
BIOMES.tunnel.levelgen = function() {
        let passableTiles=0;
    
        let numberOfYCaves = 1;
        let numberOfXCaves = 1;
    
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
            let length = numTiles-4;
            let roughness = randomRange(1, 100); // 1 to 100
            let windyness = randomRange(1, 100); // 1 to 100
    
            let startX = randomRange(3, numTiles-3);
            let startY = numTiles-2;
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
                    } else if (x > numTiles - 3) {
                        x = numTiles - 3;
                    }
                }
                fillRect(x, y, x+width, y);
            }
        }
        
        for (let i = 0; i < numberOfXCaves; i++) {
            let length = numTiles-4;
            let roughness = randomRange(1, 100); // 1 to 100
            let windyness = randomRange(1, 100); // 1 to 100
    
            let startX = 0+2;
            let startY = randomRange(3, numTiles-3);
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
                    } else if (y > numTiles - 3) {
                        y = numTiles - 3;
                    }
                }
    
                fillRect(x, y, x, y-width);
    
        }
    
    }
}

BIOMES.dungeon = Object.create(biome);
BIOMES.dungeon.name = "Dungeon";
BIOMES.dungeon.monsterPool = [GoblinSpear, GoblinRanger, GoblinSwordsman, RedDragonBaby];
BIOMES.dungeon.objPool = [objects.usable.bookshelf, objects.usable.coffin, objects.usable.weaponStand];
BIOMES.dungeon.trapsPool = [traps.pressurePlate, traps.trapdoor, traps.tripwire, traps.spiketrap];
BIOMES.dungeon.levelgen = function() {
    let wallChance = 0.45;
    let levelType = 2;
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

BIOMES.maze = Object.create(biome);
BIOMES.maze.name = "Maze";
BIOMES.maze.monsterPool = [GoblinSpear, GoblinRanger, GoblinSwordsman, RedDragonBaby];
BIOMES.maze.objPool = [objects.usable.bookshelf, objects.usable.weaponStand];
BIOMES.maze.trapsPool = [traps.pressurePlate, traps.tripwire, traps.spiketrap];
BIOMES.maze.levelgen = function() {
    let wallChance = 0.45;
    let levelType = 2;
        let passableTiles=0;
    
        // clean level
        tiles = [];
        for (let i = 0; i < numTiles; i++) {
            tiles[i] = [];
        }
    
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                tiles[i][j] = new Wall(i, j, 35);
            }
        }

        tiles[1][1].replace(Floor, 34);
        carvePassage(1, 1);

        function carvePassage(x, y) {
            let checks = [checkRight, checkLeft, checkDown, checkUp];

            checks = shuffle(checks);

            checks.forEach((direction) => direction(x,y));

            function checkRight(x, y) {
                if (inBounds(x+2, y) && !tiles[x+2][y].passable) {
                    tiles[x+1][y].replace(Floor, 34);
                    tiles[x+2][y].replace(Floor, 34);
                    carvePassage(x+2, y);
                }
    
            }
    
            function checkLeft(x, y) {
                if (inBounds(x-2, y) && !tiles[x-2][y].passable) {
                    tiles[x-1][y].replace(Floor, 34);
                    tiles[x-2][y].replace(Floor, 34);
                    carvePassage(x-2, y);
                }
            }
    
            function checkDown(x, y) {
                if (inBounds(x, y+2) && !tiles[x][y+2].passable) {
                    tiles[x][y+1].replace(Floor, 34);
                    tiles[x][y+2].replace(Floor, 34);
                    carvePassage(x, y+2);
                }
            }
    
            function checkUp(x, y) {
                if (inBounds(x, y-2) && !tiles[x][y-2].passable) {
                    tiles[x][y-1].replace(Floor, 34);
                    tiles[x][y-2].replace(Floor, 34);
                    carvePassage(x, y-2);
                }
            }
        }

        

        return passableTiles;
}
