class Grid {
    constructor(tileSize, numTiles) {
        this.tileSize = tileSize;
        this.numTiles = numTiles;
    }

    init() {
        tiles = [];
        for (x = 0; x < numTiles; x++) {
            tiles[x] = [];
            for (y = 0; y < numTiles; y++) {
                tiles[x][y] = new Turf(x, y, 2);
                tiles[x][y].setFloor();
            }
        }
    }
}