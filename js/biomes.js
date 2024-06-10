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

biome.underground.prototype = Object.create(biome.prototype);
biome.underground.name = "Underground";
biome.underground.monsterPool = [Spider, Snake, GreenSlime, Mouse];
biome.underground.objPool = [objects.usable.barrel, objects.usable.campfire];
biome.underground.trapsPool = [traps.beartrap, traps.trapdoor];
biome.underground.levelgen = function() {
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

biome.chasm.prototype = Object.create(biome.prototype);
biome.chasm.name = "Chasm";
biome.chasm.monsterPool = [Spider, Snake, GreenSlime, Mouse];
biome.chasm.objPool = [objects.usable.barrel, objects.usable.campfire];
biome.chasm.trapsPool = [traps.beartrap, traps.trapdoor];
biome.chasm.levelgen = function() {
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

biome.caves = Object.create(biome);
biome.caves.name = "Caves";
biome.caves.monsterPool = [StoneGolem, Zombie, Skeleton, Worm];
biome.caves.objPool = [objects.usable.spiderCocoon];
biome.caves.trapsPool = [traps.cobweb];
biome.caves.levelgen = function() {
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

biome.dungeon = Object.create(biome);
biome.dungeon.name = "Dungeon";
biome.dungeon.monsterPool = [GoblinSpear, GoblinRanger, GoblinSwordsman, RedDragonBaby];
biome.dungeon.objPool = [objects.usable.bookshelf, objects.usable.coffin];
biome.dungeon.trapsPool = [traps.pressurePlate, traps.trapdoor];
biome.dungeon.levelgen = function() {
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

