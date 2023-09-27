spells = {
    Teleport() {
        player.move(randomPassableTile());
    },
    Earthquake() {
        for (let i = 0; i < numTiles; i++) {
            for (let j = 0; j < numTiles; j++) {
                const tile = getTile(i, j);
                if (tile.monster) {
                    const numWalls = 8 - tile.getAdjacentPassableNeighbours().length;
                    tile.monster.hit(numWalls * 5);
                }
            }
        }
        shakeAmount = 20;
    },
    Banish() {
        for (const monster of monsters) {
            monster.move(randomPassableTile());
            monster.teleportCounter = randomRange(3, 6);
        }
    },
    Rewind() {
        startLevel(startingHp, player.spells);
    },
    HealingAura() {
        player.tile.getAdjacentNeighbours().forEach((t) => {
            t.setEffect(13);
            if (t.monster) {
                t.monster.heal(5 * t.arcane);
            }
        });
        player.tile.setEffect(13);
        player.heal(5 * player.arcane);
    },
    Dash() {
        let newTile = player.tile;
        while (true) {
            const testTile = newTile.getNeighbour(player.lastMove[0], player.lastMove[1]);
            if (testTile.passable && !testTile.monster) {
                newTile = testTile;
            } else {
                break;
            }
        }
        if (player.tile != newTile) {
            player.move(newTile);
            newTile.getAdjacentNeighbours().forEach(t => {
                if (!t.monster) {
                    return;
                }
                t.setEffect(14);
                addStatus("Stunned", randomRange(2, 5), t.monster);
                t.monster.hit(1);
            });
        }
    },
    Dig() {
        for (let i = 1; i < numTiles - 1; i++) {
            for (let j = 1; j < numTiles - 1; j++) {
                const tile = getTile(i, j);
                if(!tile.passable) {
                    tile.replace(Floor);
                }
            }
        }
    },
    Midas() {
        let k = 0;
        for (let i = 0; i <= monsters.length; i++) {
            if (!monsters[k].isPlayer) {
                monsters[k].tile.treasure = true;
                monsters[k].die();
                k--;
            }
            k++;
        }
    },
    Spelunker() {
        player.tile.getAdjacentNeighbours().forEach((t) => {
            if (!t.passable && inBounds(t.x, t.y)) {
                t.replace(Floor).treasure = true;
            }
        });
    },
    Berserk() {
        player.tile.setEffect(13);
        player.heal(5);

        player.bonusAttack = 5;
    },
    Duplicate() {
        for (let i = player.spells.length - 1; i > 0; i--) {
            if (!player.spells[i]) {
                player.spells[i] = player.spells[i - 1];
            }
        }
    },
    Shield() {
        addStatus("Shielded", randomRange(5, 10), player);
    },
    Bolt() {
        boltTravel(player.lastMove, 15 + Math.abs(player.lastMove[1]), 5 * player.arcane);
        playSound("firebolt");
    },
    Cross() {
        const directions = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0]
        ];
        for (const direction of directions) {
            boltTravel(direction, 15 + Math.abs(direction[1]), 5 * player.arcane);
        }
        playSound("firebolt");
    },
    Explosion() {
        const directions = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ];
        for (const direction of directions) {
            boltTravel(direction, 14, 5 * player.arcane);
        }
        playSound("firebolt");
    },
    Fear() {
        for (const monster of monsters) {
            if (!monster.isPlayer) {
                addStatus("Stunned", randomRange(2, 8), monster)
            }
        }
    },
    Heal() {
        player.tile.setEffect(13);
        player.heal(10);
    },
    Pray() {
        const outcome = randomRange(1, 5);
        switch(outcome) {
            case 1:
                player.tile.setEffect(13);
                player.heal(randomRange(5, player.maxHealth));
                break;
            case 2:
                addStatus("Stunned", randomRange(5, 10), player);
                break;
            case 3:
                addStatus("Shielded", randomRange(5, 10), player);
                break;
            case 4:
                if (randomRange(1, 2) == 1) {
                    player.strength++;
                } else {
                    player.constitution++;
                }
                break;
            case 5:
                addStatus("AllSeeingEye", randomRange(10, 50), player)
                break;
        }
    },
    Regenerate() {
        player.statuses.push(new HpRegen(10));
    },
    Matchstick() {
        player.statuses.push(new Burning(5));
        player.bonusAttack = 5;
    }
};

function boltTravel(direction, effect, damage) {
    let newTile = player.tile;
    while (true) {
        const testTile = newTile.getNeighbour(direction[0], direction[1]);
        if (testTile.passable) {
            newTile = testTile;
            if (newTile.monster) {
                newTile.monster.hit(damage);
            }
            newTile.setEffect(effect);
        } else {
            break;
        }
    }
}