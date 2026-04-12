function defaultTileGases() {
    return { Air: 100 };
}

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

        this.floorSolid = true;
        this.blocksOpenVolume = false;
        this.temperatureC = 26;
        this.itemCapacity = 5;
        this.gases = defaultTileGases();

        this.liquid;
        this.liquidVolume = 0;
        this.liquidVolumeCapacity = 500;

        this.stain;
        this.stainVolume;

        this.selected = false;

        this.objects = [];
        this.items = [];
        this.lightLevel = 0;
    }

    hasOpenAtmosphere() {
        return this.floorSolid && !this.blocksOpenVolume;
    }

    gasSummaryString() {
        if (!this.gases) return "";
        return Object.keys(this.gases)
            .map((k) => `${k} ${this.gases[k]}%`)
            .join(" · ");
    }

    replace(newTileType, sprite) {
        let next;
        if (sprite !== undefined && sprite !== null) {
            next = new newTileType(this.x, this.y, sprite);
        } else if (newTileType === StairsDown || newTileType === StairsUp) {
            next = new newTileType(this.x, this.y);
        } else if (newTileType === Hole) {
            next = new Hole(this.x, this.y);
        } else {
            next = new newTileType(this.x, this.y, SPRITES.FLOOR_UNDERGROUND);
        }
        
        // Preserve monster, items, and objects references from old tile
        next.monster = this.monster;
        next.items = this.items;
        next.objects = this.objects;
        
        tiles[this.x][this.y] = next;
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


        if (this.liquid == "Blood") {
            if (this.liquidVolume > 400) {
                drawSprite(SPRITES.BLOOD_4, this.x, this.y);
            }
            if (this.liquidVolume > 300) {
                drawSprite(SPRITES.BLOOD_3, this.x, this.y);
            }
            else if (this.liquidVolume > 150) {
                drawSprite(SPRITES.BLOOD_2, this.x, this.y);
            }
            else if (this.liquidVolume > 0) {
                drawSprite(SPRITES.BLOOD_1, this.x, this.y);
            }
        }

        if (this.objects.length > 0) {
            for (let object of this.objects) {
                if (object.category === "trap" && !object.visible) {
                    continue;
                }
                drawSprite(object.sprite, this.x, this.y);
            }
        }

        if (this.items.length > 0) {
            for (let item of this.items) {
                if (item != undefined) {
                    drawSprite(item.sprite, this.x, this.y);
                }

            }
        }

        if (this.wallBlood) {
            drawSprite(SPRITES.WALL_BLOOD, this.x, this.y);
        }

        if (this.treasure) {
            drawSprite(SPRITES.TREASURE, this.x, this.y);
        }

        if (this.scroll) {
            drawSprite(SPRITES.SCROLL, this.x, this.y);
        }

        if (this.selected) {
            drawSprite(SPRITES.SELECTION, this.x, this.y);
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
        this.effectCounter = 200;
    }
}

class Floor extends Tile {
    constructor(x, y, sprite) {
        super(x, y, sprite, true);

        this.floorSolid = true;
        this.blocksOpenVolume = false;
        this.liquidVolumeCapacity = 500;
    }

    stepOn(monster) {
        const objs = this.objects.slice();
        for (const obj of objs) {
            if (obj.onStep) {
                obj.onStep(monster, this);
            }
        }



    }

    use() {
        if (this.items.length > 0) {
            if (this.items[0].get()) this.items.splice(0, 1);
            return;
        }
    }

    get() {
        if (this.items.length > 0) {
            if (this.items[0].get()) this.items.splice(0, 1);
        }
    }
}

class Hole extends Tile {
    constructor(x, y, sprite) {
        const spr = sprite !== undefined ? sprite : SPRITES.HOLE;
        super(x, y, spr, true);
        this.floorSolid = false;
        this.blocksOpenVolume = false;
        this.itemCapacity = 0;
        this.items = [];
        this.liquidVolume = 0;
        this.liquid = undefined;
    }

    stepOn(monster) {
        if (!monster.isPlayer) {
            monster.die(undefined);
            addPopups("Fell!", "grey", monster);
            return;
        }
        playSound("trapdoor");
        if (level >= numLevels) {
            addScore(score, true);
            showTitle();
            return;
        }
        saveLevel();
        level++;
        startLevel(Math.min(maxHp, player.hp - 2), player.spells, undefined, -1);
        addPopups("You fall through!", "grey", player);
    }
}

class Wall extends Tile {
    constructor(x, y, sprite) {
        super(x, y, sprite, false);
        this.floorSolid = true;
        this.blocksOpenVolume = true;
        this.itemCapacity = 0;
    }

    use() {
        let pickaxeToUse;
        for (let item of player.inventory) {
            if (item.name == "Pickaxe") {
                pickaxeToUse = item;
            }
        }

        if (pickaxeToUse == undefined) {
            addPopups("No pickaxe...", "white", player);
            return;
        }

        let randomNumber = roll(1, 20);
        if (randomNumber > 10) {
            this.replace(Floor);
            addPopups("Crackle", "brown", player);
        } else if (randomNumber > 1) {
            addPopups("Failed...", "white", player);
        } else {
            addPopups("Pickaxe broke!", "white", player);
            player.inventory.splice(player.inventory.indexOf(pickaxeToUse), 1);
        }


    }
}

class StairsDown extends Tile {
    constructor(x, y) {
        super(x, y, 250, true);
        this.floorSolid = true;
        this.blocksOpenVolume = false;
    }

    stepOn(monster) {
    }

    use() {
        if (this.items.length > 0) {
            if (this.items[0].get()) this.items.splice(0, 1); return;
        }
    }

    moveDown(monster) {
        if (monster.isPlayer) {
            playSound("newLevel");
            if (level == numLevels) {
                addScore(score, true);
                showTitle();
            } else {
                this.replace(StairsDown);
                saveLevel();
                level++;
                startLevel(Math.min(maxHp, player.hp + 1), player.spells, undefined, -1);
                addPopups("Tap tap tap...", "grey", player);
            }
        }
    }

    get() {
        if (this.items.length > 0) {
            if (this.items[0].get()) this.items.splice(0, 1);
        }
    }
}

class StairsUp extends Tile {
    constructor(x, y) {
        super(x, y, 251, true);
        this.floorSolid = true;
        this.blocksOpenVolume = false;
    }

    stepOn(monster) {
    }

    use() {
        if (this.items.length > 0) {
            if (this.items[0].get()) this.items.splice(0, 1); return;
        }
    }

    moveUp(monster) {
        if (monster.isPlayer) {
            playSound("newLevel");
            if (level == 1) {
                addScore(score, true);
                showTitle();
            } else {
                this.replace(StairsUp);
                saveLevel();
                level--;
                startLevel(Math.min(maxHp, player.hp + 1), player.spells, undefined, 1);
                addPopups("Tap tap tap...", "grey", player);
            }
        }
    }

    get() {
        if (this.items.length > 0) {
            if (this.items[0].get()) this.items.splice(0, 1);
        }
    }
}
