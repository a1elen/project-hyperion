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

function init() {
    // Canvas Setup
    initCanvas();

    // Load spritesheet
    spritesheet = new Image();
    spritesheet.src = 'spritesheet.png';
    spritesheet.onload = showTitle;

    // Tile grid setup
    tileSize = 64;
    numTiles = 32;

    for (x = 0; x < numTiles; x++) {
        for (y = 0; y < numTiles; y++) {
            //graphics.drawSprite(2, x, y);
        }
    }

    initSounds();
}

function update() {

}

function draw() {
    for (x = 0; x < numTiles; x++) {
        for (y = 0; y < numTiles; y++) {
            graphics.drawSprite(2, x, y);
        }
    }
}