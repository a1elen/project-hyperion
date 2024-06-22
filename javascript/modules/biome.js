class Biome {
    constructor() {

    }
}

class Underground extends Biome {
    constructor() {
        this.name = "Underground";
    }

    levelGen() {
        for(let x = 0; x < numTiles; x++) {
            for (let y = 0; y < numTiles; y++) {
                tiles[x][y].floor = new Floor(1);
            }
        }
    }
}