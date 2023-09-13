class Tile {
    constructor(x, y, sprite, passable) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
        this.visible = false;
    }

    replace(newTileType) {
        tiles[this.x][this.y] = new newTileType(this.x, this.y);
        return tiles[this.x][this.y];
    }

    dist(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    getNeighbour(dx, dy) {
        return getTile(this.x + dx, this.y + dy);
    }

    getAdjacentNeighbours() {
        return shuffle([
            // Four directions
            this.getNeighbour(0, -1),
            this.getNeighbour(0, 1),
            this.getNeighbour(-1, 0),
            this.getNeighbour(1, 0),
            // Diagonal directions
            this.getNeighbour(-1, -1),
            this.getNeighbour(1, 1),
            this.getNeighbour(-1, 1),
            this.getNeighbour(1, -1)

        ]);
    }

    getAdjacentPassableNeighbours() {
        return this.getAdjacentNeighbours().filter(t => t.passable);
    }

    getConnectedTiles() {
        let connectedTiles = [this];
        let frontier = [this];
        while (frontier.length) {
            let neighbours = frontier.pop()
                .getAdjacentPassableNeighbours()
                .filter(t => !connectedTiles.includes(t));
            connectedTiles = connectedTiles.concat(neighbours);
            frontier = frontier.concat(neighbours);
        }
        return connectedTiles;
    }

    draw() {
        drawSprite(this.sprite, this.x, this.y);

        if (this.treasure) {
            drawSprite(12, this.x, this.y);
        }

        if (this.scroll) {
            drawSprite(18, this.x, this.y);
        }

        if (this.trap && this.visible) {
            drawSprite(19, this.x, this.y);
        }

        if (this.effectCounter) {
            this.effectCounter--;
            ctx.globalAlpha = this.effectCounter / 30;
            drawSprite(this.effect, this.x, this.y);
            ctx.globalAlpha = 1;
        }
    }

    setEffect(effectSprite) {
        this.effect = effectSprite;
        this.effectCounter = 30;
    }
}

class Floor extends Tile {
    constructor(x, y) {
        super(x, y, 2, true);
    }

    stepOn(monster) {
        if (monster.isPlayer && this.treasure) {
            score += randomRange(9, 21);
            //if (score % 3 == 0 && numSpells < 9) {
                //numSpells++;
                //player.addSpell();
            //}
            playSound("treasure");
            this.treasure = false;
            spawnMonster();
        }
        if (monster.isPlayer && this.scroll) {
            //if (numSpells < 9) {
            //    numSpells++;
            //}
            if (player.spells.length <= numSpells) {
                player.addSpell();
            }
            // TO DO
            //playSound("scroll");
            this.scroll = false;
        }
        if (this.trap) {
            addStatus("Bleeding", 5, monster);
            this.visible = true;
            shakeAmount = 10;
        }
    }
}

class Wall extends Tile {
    constructor(x, y) {
        super(x, y, 3, false);
    }
}

class Exit extends Tile {
    constructor(x, y) {
        super(x, y, 11, true);
    }

    stepOn(monster) {
        if(monster.isPlayer) {
            playSound("newLevel");
            if (level == numLevels) {
                addScore(score, true);
                showTitle();
            } else {
                level++;
                startLevel(Math.min(maxHp, player.hp+1));
            }
        }
    }
}