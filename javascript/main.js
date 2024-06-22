// Globals
tileSize = 0;
numTiles = 0;

shakeX = 0;
shakeY = 0;

function init() {
    // Canvas Setup
    initCanvas();

    // Load spritesheet
    spritesheet = new Image();
    spritesheet.src = 'spritesheet.png';
    //spritesheet.onload = showTitle;

    // Tile grid setup
    initTiles();

    initSounds();
}

function update() {

}

function draw() {
    for (x = 0; x < numTiles; x++) {
        for (y = 0; y < numTiles; y++) {
            /*if (tiles[x] == undefined) return;
            if (tiles[x][y] == undefined) return;*/
            tiles[x][y].draw();
        }
    }
}

function initCanvas() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;

    ctx.imageSmoothingEnabled = false;
}

function initSounds() {

}

function initTiles() {
    tileSize = 64;
    numTiles = 32;

    tiles = [];
    for (x = 0; x < numTiles; x++) {
        tiles[x] = [];
        for (y = 0; y < numTiles; y++) {
            tiles[x][y] = new Turf(x, y, 2);
            tiles[x][y].setFloor();
        }
    }
}