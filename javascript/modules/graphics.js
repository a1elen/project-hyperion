graphics = {
    drawSprite = function (sprite, x, y) {
        ctx.drawImage(
            spritesheet,
            (sprite-(Math.floor(sprite/50)*50))*16,
            Math.floor(sprite/50)*16,
            16,
            16,
            x*tileSize + shakeX,
            y*tileSize + shakeY,
            tileSize,
            tileSize
        );
    }
};