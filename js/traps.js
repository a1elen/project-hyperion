traps = {};

trap = {
    name: "Trap",
    type: "world-object",
    category: "trap",
    sprite: 0,
    visible: false,
    sound: "trap",
    onStep(monster, tile) {},
    getInteractions(player, tile) {
        return [];
    },
};

traps.beartrap = Object.create(trap);
traps.beartrap.name = "Bear Trap";
traps.beartrap.sprite = SPRITES.BEARTRAP;
traps.beartrap.item = items.tools.beartrap;
traps.beartrap.onStep = function (monster, tile) {
    playSound(this.sound);

    const bleedDuration = randomRange(5, 10);
    const stunDuration = randomRange(4, 8);
    addStatus("Bleeding", bleedDuration, monster);
    addStatus("Stunned", stunDuration, monster);

    if (monster == player) {
        addMessageLog("You stepped on " + this.name);
        addMessageLog("Stunned for " + stunDuration + " turns");
        addMessageLog("Bleeding for " + bleedDuration + " turns");
    }
    addPopups("Skirr!", "white", monster);
    addPopups("Bleed!", "red", monster);
    addPopups("Stun!", "yellow", monster);

    this.blood = true;
    const neighbours = monster.tile.getAdjacentNeighbours();
    for (const neighbour of neighbours) {
        if (!neighbour.passable && randomRange(1, 3) == 3) {
            neighbour.wallBlood = true;
        }
    }

    this.visible = true;

    tryAddItemToTile(tile, this.item);
    removeWorldObjectFromTile(tile, this);
};
traps.beartrap.getInteractions = function (player, tile) {
    if (!this.visible) return [];
    const trap = this;
    return [
        {
            label: "Try to disarm bear trap",
            run() {
                const randomNumber = roll(1, 20);
                if (randomNumber > 10) {
                    tryAddItemToTile(tile, trap.item);
                    removeWorldObjectFromTile(tile, trap);
                    addPopups("Trap disarmed!", "white", player);
                } else if (randomNumber > 1) {
                    addPopups("Failed...", "white", player);
                } else {
                    addPopups("Trap broken!", "white", player);
                    removeWorldObjectFromTile(tile, trap);
                }
            },
        },
    ];
};

traps.trapdoor = Object.create(trap);
traps.trapdoor.name = "Trapdoor";
traps.trapdoor.sprite = SPRITES.TRAPDOOR;
traps.trapdoor.sound = "trapdoor";
traps.trapdoor.onStep = function (monster, tile) {
    if (monster == player) {
        addMessageLog("You stepped on " + this.name);
    }
    if (monster.tile.dist(player.tile) < 6) {
        playSound(this.sound);
        shakeAmount = 50;
    }

    if (monster == player) {
        saveLevel();
        level++;
        startLevel(Math.min(maxHp, player.hp - 5), player.spells, true);
        player.hit(10);
        player.bleed();
    } else {
        monster.hit(9999);
    }

    this.visible = true;
};

traps.pressurePlate = Object.create(trap);
traps.pressurePlate.name = "Pressure Plate";
traps.pressurePlate.sprite = SPRITES.PRESSURE_PLATE;
traps.pressurePlate.sound = "trapdoor";
traps.pressurePlate.onStep = function (monster, tile) {
    if (monster == player) {
        addMessageLog("You stepped on " + this.name);
    }
    monster.move(randomPassableTile());

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 50;
        playSound(this.sound);
    }

    this.visible = true;
};
traps.pressurePlate.getInteractions = function (player, tile) {
    if (!this.visible) return [];
    const trap = this;
    return [
        {
            label: "Try to disarm pressure plate",
            run() {
                const randomNumber = roll(1, 20);
                if (randomNumber > 10) {
                    removeWorldObjectFromTile(tile, trap);
                    addPopups("Trap disarmed!", "white", player);
                } else {
                    addPopups("Failed...", "white", player);
                }
            },
        },
    ];
};

traps.cobweb = Object.create(trap);
traps.cobweb.name = "Cobweb";
traps.cobweb.sprite = SPRITES.COBWEB;
traps.cobweb.onStep = function (monster, tile) {
    if (monster == player) {
        addMessageLog("You stepped on " + this.name);
        addMessageLog("Stunned for 5 turns");
    }
    addStatus("Stunned", 5, monster);
    addPopups("Webbed!", "white", monster);

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 10;
    }

    this.visible = true;

    if (roll(1, 20) > 15) {
        removeWorldObjectFromTile(tile, this);
    }
};
traps.cobweb.getInteractions = function (player, tile) {
    if (!this.visible) return [];
    const trap = this;
    return [
        {
            label: "Clear cobweb",
            run() {
                removeWorldObjectFromTile(tile, trap);
                addPopups("Cleared.", "white", player);
            },
        },
    ];
};

traps.tripwire = Object.create(trap);
traps.tripwire.name = "Tripwire";
traps.tripwire.sprite = SPRITES.TRIPWIRE;
traps.tripwire.sound = "trap";
traps.tripwire.onStep = function (monster, tile) {
    const stunDuration = randomRange(4, 8);
    addStatus("Stunned", stunDuration, monster);
    monster.hit(5);
    monster.tile.setEffect(401);

    if (monster == player) {
        addMessageLog("You stepped on " + this.name);
        addMessageLog("Stunned for " + stunDuration + " turns");
    }

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 10;
        playSound(this.sound);
    }

    this.visible = true;
    removeWorldObjectFromTile(tile, this);
};
traps.tripwire.getInteractions = function (player, tile) {
    if (!this.visible) return [];
    const trap = this;
    return [
        {
            label: "Remove tripwire",
            run() {
                removeWorldObjectFromTile(tile, trap);
                addPopups("Removed.", "white", player);
            },
        },
    ];
};

traps.spiketrap = Object.create(trap);
traps.spiketrap.name = "Spiketrap";
traps.spiketrap.sprite = SPRITES.SPIKETRAP_LOADED;
traps.spiketrap.loaded = true;
traps.spiketrap.onStep = function (monster, tile) {
    if (!this.loaded) {
        return;
    }
    const stunDuration = randomRange(4, 8);
    const bleedDuration = randomRange(4, 8);
    addStatus("Stunned", stunDuration, monster);
    addStatus("Bleeding", bleedDuration, monster);
    monster.hit(5);

    if (monster == player) {
        addMessageLog("You stepped on " + this.name);
        addMessageLog("Stunned for " + stunDuration + " turns");
        addMessageLog("Bleeding for " + bleedDuration + " turns");
    }

    this.blood = true;
    const neighbours = monster.tile.getAdjacentNeighbours();
    for (const neighbour of neighbours) {
        if (!neighbour.passable && randomRange(1, 3) == 3) {
            neighbour.wallBlood = true;
        }
    }

    if (monster.tile.dist(player.tile) < 6) {
        shakeAmount = 10;
        playSound(this.sound);
    }

    this.visible = true;
    this.loaded = false;
    this.sprite = SPRITES.SPIKETRAP_UNLOADED;
};
traps.spiketrap.getInteractions = function (player, tile) {
    if (!this.visible || this.loaded) return [];
    return [
        {
            label: "Inspect (spent spike trap)",
            run() {
                addPopups("The mechanism is jammed.", "gray", player);
            },
        },
    ];
};
