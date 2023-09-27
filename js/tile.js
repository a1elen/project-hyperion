class Tile {
    constructor(x, y, sprite, passable) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
        this.visible = false;
        this.trapWorks = true;
        this.blood = false;
        this.wallBlood = false;
        this.known = false;
    }

    replace(newTileType, sprite) {
        tiles[this.x][this.y] = sprite ? new newTileType(this.x, this.y, sprite) : new newTileType(this.x, this.y, 2);
        
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
            const neighbours = frontier.pop()
                .getAdjacentPassableNeighbours()
                .filter(t => !connectedTiles.includes(t));
            connectedTiles = connectedTiles.concat(neighbours);
            frontier = frontier.concat(neighbours);
        }
        return connectedTiles;
    }

    draw() {
        drawSprite(this.sprite, this.x, this.y);

        if (this.blood) {
            drawSprite(25, this.x, this.y);
        }

        if (this.wallBlood) {
            drawSprite(26, this.x, this.y);
        }

        if (this.treasure) {
            drawSprite(12, this.x, this.y);
        }

        if (this.scroll) {
            drawSprite(18, this.x, this.y);
        }

        if (this.trap && this.visible) {
            if (this.trapWorks) {
                drawSprite(28, this.x, this.y);
            } else {
                drawSprite(29, this.x, this.y);
            }
        }

        if (!this.effectCounter) {
            return;
        }
        this.effectCounter--;
        ctx.globalAlpha = this.effectCounter / 30;
        drawSprite(this.effect, this.x, this.y);
        ctx.globalAlpha = 1;
    }

    setEffect(effectSprite) {
        this.effect = effectSprite;
        this.effectCounter = 30;
    }
}

class Floor extends Tile {
    constructor(x, y, sprite) {
        super(x, y, sprite, true);
    }

    stepOn(monster) {
        if (!this.trap) {
            return;
        }
        if (!this.trapWorks) {
            return;
        }

        if (monster.isPlayer) {
            const isTrapdoor = randomRange(1, 100);
            if (isTrapdoor > 10) {
                playSound("trap");
                addStatus("Bleeding", randomRange(2, 5), monster);
                addStatus("Stunned", randomRange(2, 5), monster);
                this.blood = true;
                const neighbours = this.getAdjacentNeighbours();
                for (const neighbour of neighbours) {
                    if (!neighbour.passable && randomRange(1, 3) == 3) {
                        neighbour.wallBlood = true;
                    }
                }
            } else {
                playSound("trapdoor");
                saveLevel();
                level++;
                startLevel(Math.min(maxHp, player.hp-5), player.spells, true);
                shakeAmount = 50;

            }
        } else {
            playSound("trap");
            addStatus("Bleeding", randomRange(2, 5), monster);
            addStatus("Stunned", randomRange(2, 5), monster);
            this.blood = true;
            const neighbours = this.getAdjacentNeighbours();
            for (const neighbour of neighbours) {
                if (!neighbour.passable && randomRange(1, 3) == 3) {
                    neighbour.wallBlood = true;
                }
            }
        }

        this.visible = true;
        this.trapWorks = false;
        shakeAmount = 10;
    }

    use() {
        if (this.trap && !this.trapWorks && this.visible) {
            this.trapWorks = true;
        }
    }

    get() {
        if (this.treasure) {
            score += randomRange(9, 21);
            playSound("treasure");
            this.treasure = false;
            if (randomRange(0, 2) < 1) {
                spawnMonster();
            }
        }

        if (this.scroll && player.spells.length < numSpells) {
            console
            player.addSpell();
            this.scroll = false;
        }

        if (this.trap) {
            this.trap = false;
        }
    }
}

class Wall extends Tile {
    constructor(x, y, sprite) {
        super(x, y, sprite, false);
    }
}

class StairsDown extends Tile {
    constructor(x, y) {
        super(x, y, 23, true);
    }

    stepOn(monster) {
    }

    use() {

    }

    moveDown(monster) {
        if(monster.isPlayer) {
            playSound("newLevel");
            if (level == numLevels) {
                addScore(score, true);
                showTitle();
            } else {
                this.replace(StairsDown);
                saveLevel();
                level++;
                startLevel(Math.min(maxHp, player.hp+1), player.spells);
            }
        }
    }

    get() {

    }
}

class StairsUp extends Tile {
    constructor(x, y) {
        super(x, y, 24, true);
    }

    stepOn(monster) {
    }

    use() {

    }

    moveUp(monster) {
        if(monster.isPlayer) {
            playSound("newLevel");
            if (level == 1) {
                addScore(score, true);
                showTitle();
            } else {
                this.replace(StairsUp);
                saveLevel();
                level--;
                startLevel(Math.min(maxHp, player.hp+1), player.spells);
            }
        }
    }

    get() {
        
    }
}
