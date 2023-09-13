class Tile {
    constructor(x, y, sprite, passable) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;
        this.passable = passable;
        this.visible = false;
        this.trapWorks = true;
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
            if (this.trapWorks) {
                drawSprite(28, this.x, this.y);
            } else {
                drawSprite(29, this.x, this.y);
            }
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
            if (player.spells.length < numSpells) {
                console
                player.addSpell();
                this.scroll = false;
            }
            // TO DO
            //playSound("scroll");
        }
        if (this.trap) {

            if (!this.trapWorks) {
                return;
            }

            /*let statusName;
            if (randomRange(1, 2) > 1) {
                statusName = "Bleeding";
            } else {
                statusName = "Stunned";
            }*/
            if (monster.isPlayer) {
                let isTrapdoor = randomRange(1, 2);
                if (isTrapdoor == 1) {
                    playSound("trap");
                    addStatus("Bleeding", randomRange(2, 5), monster);
                    addStatus("Stunned", randomRange(2, 5), monster);
                } else {
                    playSound("trapdoor");
                    level++;
                    startLevel(Math.min(maxHp, player.hp-5), player.spells);
                    shakeAmount = 20;

                }
            } else {
                playSound("trap");
                addStatus("Bleeding", randomRange(2, 5), monster);
                addStatus("Stunned", randomRange(2, 5), monster);
            }

            this.visible = true;
            this.trapWorks = false;
            shakeAmount = 10;
        }
    }
}

class Wall extends Tile {
    constructor(x, y) {
        super(x, y, 3, false);
    }
}

class StairsDown extends Tile {
    constructor(x, y) {
        super(x, y, 23, true);
    }

    stepOn(monster) {
        if(monster.isPlayer) {
            playSound("newLevel");
            if (level == numLevels) {
                addScore(score, true);
                showTitle();
            } else {
                level++;
                startLevel(Math.min(maxHp, player.hp+1), player.spells);
            }
        }
    }
}

class StairsUp extends Tile {
    constructor(x, y) {
        super(x, y, 24, true);
    }

    stepOn(monster) {
        if (monster.isPlayer) {
        }
    }
}
